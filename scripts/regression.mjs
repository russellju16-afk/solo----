import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RUN_ID = new Date().toISOString().slice(0, 10).replace(/-/g, '')

const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:3000'
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || 'http://localhost:5173'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456'
const headless = process.env.HEADLESS !== 'false'

function normalizeUrl(baseUrl, pathname) {
  if (!pathname.startsWith('/')) return `${baseUrl}/${pathname}`
  return `${baseUrl}${pathname}`
}

function shouldIgnoreResponse(url, status) {
  if (status < 400) return true
  if (url.includes('/sockjs-node')) return true
  if (url.includes('/__vite_ping')) return true
  if (url.includes('/@vite/client')) return true
  if (url.includes('/@react-refresh')) return true
  return false
}

function attachCollector(page) {
  const consoleErrors = []
  const pageErrors = []
  const requestFailures = []
  const badResponses = []

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    consoleErrors.push({ text: msg.text(), location: msg.location() })
  })

  page.on('pageerror', (error) => {
    pageErrors.push({ message: error?.message || String(error), stack: error?.stack })
  })

  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText
    if (failure === 'net::ERR_ABORTED') return
    requestFailures.push({ url: request.url(), method: request.method(), failure: request.failure()?.errorText })
  })

  page.on('response', (response) => {
    const status = response.status()
    const url = response.url()
    if (shouldIgnoreResponse(url, status)) return
    badResponses.push({ url, status, method: response.request().method() })
  })

  const reset = () => {
    consoleErrors.length = 0
    pageErrors.length = 0
    requestFailures.length = 0
    badResponses.length = 0
  }

  return { consoleErrors, pageErrors, requestFailures, badResponses, reset }
}

async function ensureArtifactsDir(subdir = '') {
  const fs = await import('node:fs/promises')
  const dir = path.resolve(__dirname, '../logs', 'artifacts', `regression-${RUN_ID}`, subdir)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

async function takeScreenshot(page, filename, options = {}) {
  const dir = await ensureArtifactsDir()
  const filePath = path.join(dir, filename)
  await page.screenshot({ path: filePath, ...options })
  return filePath
}

async function gotoAndSettle(page, url, settleMs = 1200) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(settleMs)
}

async function exportLeadsAndVerifyDownload(page) {
  await gotoAndSettle(page, normalizeUrl(ADMIN_BASE_URL, '/leads'), 1400)

  const exportButton = page.getByRole('button', { name: '导出' }).first()
  if (!(await exportButton.count())) {
    throw new Error('export button not found on /leads')
  }

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    exportButton.click(),
  ])

  const filename = download.suggestedFilename()
  if (!filename.endsWith('.xlsx')) {
    throw new Error(`expected xlsx download, got ${filename}`)
  }

  const filePath = await download.path()
  if (filePath) {
    const fs = await import('node:fs/promises')
    const buf = await fs.readFile(filePath)
    if (buf.slice(0, 2).toString('utf8') !== 'PK') {
      throw new Error('expected xlsx zip header (PK)')
    }
  }
}

async function loginAdmin(page, returnUrl) {
  const current = new URL(page.url())
  const shouldGotoLogin = current.origin !== ADMIN_BASE_URL || current.pathname !== '/login'
  if (shouldGotoLogin || returnUrl) {
    const url = normalizeUrl(ADMIN_BASE_URL, returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login')
    await gotoAndSettle(page, url, 800)
  }
  await page.locator('input[placeholder="用户名"]').fill(ADMIN_USERNAME)
  await page.locator('input[placeholder="密码"]').fill(ADMIN_PASSWORD)
  await Promise.all([
    page.waitForURL((u) => !u.pathname.endsWith('/login')),
    page.locator('button[type="submit"]').click(),
  ])
}

async function ensureListToDetail(page, listPath, linkSelector, detailPathRegex) {
  await gotoAndSettle(page, normalizeUrl(WEB_BASE_URL, listPath), 1500)
  const link = page.locator(linkSelector).first()
  if (await link.count()) {
    await Promise.all([page.waitForURL(detailPathRegex), link.click()])
    await page.waitForTimeout(900)
    return { hadDetail: true }
  }
  return { hadDetail: false }
}

async function ensureListSkeleton(page, routePath, apiPathPattern) {
  await page.route(apiPathPattern, async (route) => {
    await new Promise((r) => setTimeout(r, 1200))
    try {
      await route.continue()
    } catch {
      // If the route is already handled (e.g. page navigated/unrouted), ignore.
    }
  })

  await gotoAndSettle(page, normalizeUrl(WEB_BASE_URL, routePath), 200)
  const skeleton = page.locator('.ant-skeleton')
  await skeleton.first().waitFor({ timeout: 5000 })
  // Give the delayed request a chance to be continued before unroute, avoiding "Route is already handled!".
  await page.waitForTimeout(1400)
  await page.unroute(apiPathPattern)
}

async function ensureListEmptyState(page, routePath, apiPathPattern, expectedCtas = []) {
  await page.route(apiPathPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], total: 0 }),
    })
  })

  await gotoAndSettle(page, normalizeUrl(WEB_BASE_URL, routePath), 1200)
  await page.locator('.ant-empty').first().waitFor({ timeout: 5000 })

  for (const label of expectedCtas) {
    const btn = page.getByRole('button', { name: label }).first()
    await btn.waitFor({ timeout: 5000 })
  }

  await page.unroute(apiPathPattern)
}

async function exerciseProductFiltersDesktop(page) {
  await gotoAndSettle(page, normalizeUrl(WEB_BASE_URL, '/products'), 1600)
  await takeScreenshot(page, 'web-products-desktop.png', { fullPage: true })

  const keywordInput = page.getByPlaceholder('搜索产品名称或描述').first()
  await keywordInput.waitFor()
  const keyword = `__no_such_keyword_${Date.now()}__`
  await keywordInput.fill(keyword)
  await page.getByRole('button', { name: '搜索' }).first().click()
  await page.waitForTimeout(900)

  // 验证 URL 同步（不依赖后端数据）
  const url = new URL(page.url())
  if (!url.searchParams.get('keyword')) {
    throw new Error('expected keyword query param after search')
  }

  // 如果为空，应该有 CTA；如果不为空，也至少不应报错
  const empty = page.getByText('未找到符合条件的产品').first()
  if (await empty.count()) {
    await page.getByRole('button', { name: '清空条件' }).first().waitFor({ timeout: 8000 })
    await page.getByRole('button', { name: '返回全部' }).first().waitFor({ timeout: 8000 })
    await page.getByRole('button', { name: '去获取报价' }).first().waitFor({ timeout: 8000 })

    // 只点一个动作即可，避免清空后空态消失导致按钮不可点
    await page.getByRole('button', { name: '清空条件' }).first().click()
    await page.waitForTimeout(800)
  }
}

async function exerciseProductFiltersMobile(page) {
  await page.setViewportSize({ width: 390, height: 844 })
  await gotoAndSettle(page, normalizeUrl(WEB_BASE_URL, '/products'), 1600)
  await takeScreenshot(page, 'web-products-mobile.png', { fullPage: true })

  const filterButton = page.getByRole('button', { name: '筛选' }).first()
  await filterButton.waitFor()
  await filterButton.click()

  // Drawer 打开
  const drawer = page.locator('.ant-drawer').filter({ hasText: '筛选' }).first()
  await drawer.waitFor({ state: 'visible', timeout: 5000 })
  await takeScreenshot(page, 'web-products-mobile-filter-drawer.png', { fullPage: true })

  await drawer.getByRole('button', { name: '应用筛选' }).first().click()
  // antd Drawer may keep the container visible while animating; wait for mask to disappear instead.
  await page.keyboard.press('Escape')
  const mask = page.locator('.ant-drawer-mask').first()
  if (await mask.count()) {
    await mask.waitFor({ state: 'hidden', timeout: 8000 }).catch(async () => {
      await mask.waitFor({ state: 'detached', timeout: 8000 })
    })
  }
}

async function submitContactLead(page) {
  await gotoAndSettle(page, normalizeUrl(WEB_BASE_URL, '/contact'), 1400)

  // Trigger validation once
  await page.getByRole('button', { name: '获取报价' }).first().click()
  await page.waitForTimeout(500)

  await page.getByPlaceholder('请输入您的姓名').fill('测试用户')
  await page.getByPlaceholder('请输入您的手机号').fill('13800138000')
  await page.getByPlaceholder('请输入您的公司名称').fill('超群测试单位')

  const channelItem = page.locator('.ant-form-item').filter({ hasText: '采购角色' }).first()
  await channelItem.locator('.ant-select-selector').click()
  await page.locator('.ant-select-item-option').first().click()

  const cityItem = page.locator('.ant-form-item').filter({ hasText: '所在城市/区县' }).first()
  await cityItem.locator('.ant-cascader').click()
  const cascaderMenus = page.locator('.ant-cascader-dropdown .ant-cascader-menu')
  // province -> city -> district -> street (depth 4)
  for (let depth = 0; depth < 4; depth += 1) {
    const menu = cascaderMenus.nth(depth)
    await menu.waitFor()
    await menu.locator('.ant-cascader-menu-item').first().click()
    await page.waitForTimeout(250)
  }

  const selectedPath = await cityItem.locator('.ant-select-selection-item').first().textContent()
  if (!selectedPath || selectedPath.split('/').length < 4) {
    throw new Error(`expected cascader depth >= 4, got: ${selectedPath}`)
  }

  // required: interested categories + monthly volume
  await page.getByRole('checkbox', { name: '大米' }).first().check()
  await page.getByRole('radio', { name: '小于 5 吨' }).first().click()

  await page.getByRole('button', { name: '获取报价' }).first().click()
  await page.getByText('提交成功').first().waitFor({ timeout: 8000 })
}

async function initCompanyInfoTemplate(page) {
  await gotoAndSettle(page, normalizeUrl(ADMIN_BASE_URL, '/company-info'), 1200)
  const initBtn = page.getByRole('button', { name: /一键填充默认模板/ })
  if (!(await initBtn.count())) return false

  page.once('dialog', (dialog) => dialog.accept())
  await initBtn.click()
  await page.waitForTimeout(1200)

  const companyNameInput = page.locator('input[placeholder="请输入公司名称"]')
  await companyNameInput.waitFor()
  const val = await companyNameInput.inputValue()
  if (!val) throw new Error('company-info init expected company_name filled')
  return true
}

async function forceAdmin401ReturnUrlFlow(page) {
  await gotoAndSettle(page, normalizeUrl(ADMIN_BASE_URL, '/products'), 1500)

  const persisted = await page.evaluate(() => {
    const authStorage = localStorage.getItem('auth-storage')
    const tokenKey = localStorage.getItem('solo_admin_token')
    return { authStorage, tokenKey }
  })

  if (!persisted.authStorage) {
    throw new Error('missing auth-storage in localStorage after login')
  }

  await page.evaluate((raw) => {
    const parsed = JSON.parse(raw)
    if (!parsed?.state) throw new Error('unexpected auth-storage shape')
    parsed.state.token = 'invalid-token'
    localStorage.setItem('auth-storage', JSON.stringify(parsed))
    localStorage.setItem('solo_admin_token', 'invalid-token')
  }, persisted.authStorage)

  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForURL((u) => u.pathname === '/login')

  const url = new URL(page.url())
  const returnUrl = url.searchParams.get('returnUrl')
  if (returnUrl !== '/products') {
    throw new Error(`expected returnUrl=/products, got ${returnUrl}`)
  }

  await loginAdmin(page)
  await page.waitForURL((u) => u.pathname === '/products')
}

async function createNewsWithCoverAndDelete(page) {
  await gotoAndSettle(page, normalizeUrl(ADMIN_BASE_URL, '/news'), 1200)

  const title = `E2E 新闻 ${Date.now()}`

  await page.getByRole('button', { name: '新增新闻' }).click()
  const modal = page.locator('.ant-modal').filter({ has: page.locator('.ant-modal-title', { hasText: '新增新闻' }) }).last()
  await modal.waitFor({ state: 'visible' })

  await modal.locator('input[placeholder="请输入新闻标题"]').fill(title)

  // 分类
  const categoryItem = modal.locator('.ant-form-item').filter({ hasText: '分类' }).first()
  await categoryItem.locator('.ant-select-selector').click()
  await page.locator('.ant-select-item-option').first().click()

  // 上传封面
  const coverPath = path.resolve(__dirname, '../admin/public/assets/placeholder-card.webp')
  await modal.locator('input[type="file"]').setInputFiles(coverPath)
  await modal.locator('.ant-upload-list-item-done').first().waitFor({ timeout: 30000 })

  await modal.locator('textarea[placeholder="请输入新闻内容"]').fill('这是自动化回归测试创建的新闻内容。')

  await modal.locator('button[type="submit"]').click()
  await modal.waitFor({ state: 'hidden' })

  // 刷新确认记录持久化
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)

  const row = page.locator('tr').filter({ hasText: title }).first()
  await row.waitFor({ timeout: 20000 })

  // 编辑 -> 删除封面 -> 提交
  await row.getByRole('button', { name: '编辑' }).click()
  const editModal = page.locator('.ant-modal').filter({ has: page.locator('.ant-modal-title', { hasText: '编辑新闻' }) }).last()
  await editModal.waitFor({ state: 'visible' })

  const uploadItem = editModal.locator('.ant-upload-list-item')
  if (await uploadItem.count()) {
    await uploadItem.first().locator('span[role="img"][aria-label="delete"]').first().click()
    await uploadItem.first().waitFor({ state: 'detached' })
  }

  await editModal.locator('button[type="submit"]').click()
  await editModal.waitFor({ state: 'hidden' })

  // 刷新确认封面清空持久化
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)

  const rowAfterReload = page.locator('tr').filter({ hasText: title }).first()
  await rowAfterReload.waitFor({ timeout: 20000 })

  // 再次编辑确认封面已清空
  await rowAfterReload.getByRole('button', { name: '编辑' }).click()
  const editModal2 = page.locator('.ant-modal').filter({ has: page.locator('.ant-modal-title', { hasText: '编辑新闻' }) }).last()
  await editModal2.waitFor({ state: 'visible' })
  if (await editModal2.locator('.ant-upload-list-item').count()) {
    throw new Error('expected cover_image cleared after delete+save')
  }
  await editModal2.locator('.ant-modal-close').click()
  await editModal2.waitFor({ state: 'hidden' })

  // 删除记录
  await row.getByRole('button', { name: '删除' }).click()
  const pop = page.locator('.ant-popconfirm').last()
  await pop.waitFor({ state: 'visible' })
  await pop.locator('.ant-popconfirm-buttons').locator('button.ant-btn-primary').click()
  await page.waitForTimeout(900)
}

async function main() {
  const browser = await chromium.launch({ headless })
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 720 } })

  const results = []
  try {
    // Web: list -> detail
    {
      const page = await context.newPage()
      const collector = attachCollector(page)

      await ensureListToDetail(page, '/news', 'a[href^="/news/"]:not([href="/news"])', /\/news\/\d+/)
      await ensureListToDetail(page, '/cases', 'a[href^="/cases/"]:not([href="/cases"])', /\/cases\/\d+/)
      await ensureListToDetail(page, '/solutions', 'a[href^="/solutions/"]:not([href="/solutions"])', /\/solutions\/\d+/)
      await ensureListToDetail(page, '/products', 'a[href^="/products/"]:not([href="/products"])', /\/products\/\d+/)

      await exerciseProductFiltersDesktop(page)
      await submitContactLead(page)

      results.push({ label: 'web-regression', ...collector })
      await page.close()
    }

    // Web: verify skeleton & empty states (force)
    {
      const page = await context.newPage()
      const collector = attachCollector(page)

      await ensureListSkeleton(page, '/news', '**/api/news**')
      await ensureListSkeleton(page, '/cases', '**/api/cases**')
      await ensureListSkeleton(page, '/solutions', '**/api/solutions**')

      await ensureListEmptyState(page, '/news', '**/api/news**', ['获取报价'])
      await ensureListEmptyState(page, '/cases', '**/api/cases**', ['获取报价'])
      await ensureListEmptyState(page, '/solutions', '**/api/solutions**', ['获取报价'])
      await ensureListEmptyState(page, '/products', '**/api/products**', ['清空条件', '返回全部', '去获取报价'])

      await exerciseProductFiltersMobile(page)

      results.push({ label: 'web-states', ...collector })
      await page.close()
    }

    // Admin: login, 401 returnUrl flow, init template, upload+remove image regression
    {
      const page = await context.newPage()
      const collector = attachCollector(page)

      await loginAdmin(page)
      await forceAdmin401ReturnUrlFlow(page)
      collector.reset()

      // 2 minutes rapid menu switch should not redirect to /login
      const adminRoutes = ['/', '/leads', '/products', '/news', '/cases', '/solutions', '/banners', '/company-info']
      const endAt = Date.now() + 120000
      let index = 0
      while (Date.now() < endAt) {
        const target = adminRoutes[index % adminRoutes.length]
        await gotoAndSettle(page, normalizeUrl(ADMIN_BASE_URL, target), 650)
        const current = new URL(page.url())
        if (current.pathname === '/login') {
          throw new Error(`unexpected redirect to /login during admin navigation, last=${target}`)
        }
        index += 1
      }

      await initCompanyInfoTemplate(page)
      await createNewsWithCoverAndDelete(page)
      await exportLeadsAndVerifyDownload(page)

      results.push({ label: 'admin-regression', ...collector })
      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
  }

  const hasIssues = results.some(
    (item) =>
      item.consoleErrors.length ||
      item.pageErrors.length ||
      item.requestFailures.length ||
      item.badResponses.length
  )

  console.log(JSON.stringify({ hasIssues, runId: RUN_ID, results }, null, 2))
  process.exitCode = hasIssues ? 1 : 0
}

main().catch((error) => {
  console.error('[regression] failed:', error)
  process.exitCode = 1
})
