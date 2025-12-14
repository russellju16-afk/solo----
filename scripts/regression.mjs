import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    requestFailures.push({ url: request.url(), method: request.method(), failure: request.failure()?.errorText })
  })

  page.on('response', (response) => {
    const status = response.status()
    const url = response.url()
    if (shouldIgnoreResponse(url, status)) return
    badResponses.push({ url, status, method: response.request().method() })
  })

  return { consoleErrors, pageErrors, requestFailures, badResponses }
}

async function gotoAndSettle(page, url, settleMs = 1200) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(settleMs)
}

async function loginAdmin(page, returnUrl) {
  const url = normalizeUrl(ADMIN_BASE_URL, returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login')
  await gotoAndSettle(page, url, 800)
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
  await page.locator('.ant-cascader-menu-item').first().click()
  await page.waitForTimeout(300)

  await page.getByRole('button', { name: '获取报价' }).first().click()
  await page.waitForTimeout(1200)
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
  const modal = page.locator('.ant-modal').filter({ has: page.locator('.ant-modal-title', { hasText: '新增新闻' }) })
  await modal.waitFor()

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

  await modal.getByRole('button', { name: '提交' }).click()
  await modal.waitFor({ state: 'hidden' })

  const row = page.locator('tr').filter({ hasText: title }).first()
  await row.waitFor({ timeout: 20000 })

  // 编辑 -> 删除封面 -> 提交
  await row.getByRole('button', { name: '编辑' }).click()
  const editModal = page.locator('.ant-modal').filter({ has: page.locator('.ant-modal-title', { hasText: '编辑新闻' }) })
  await editModal.waitFor()

  const uploadItem = editModal.locator('.ant-upload-list-item')
  if (await uploadItem.count()) {
    await uploadItem.locator('span[role="img"][aria-label="delete"]').click()
    await uploadItem.first().waitFor({ state: 'detached' })
  }

  await editModal.getByRole('button', { name: '提交' }).click()
  await editModal.waitFor({ state: 'hidden' })

  // 再次编辑确认封面已清空
  await row.getByRole('button', { name: '编辑' }).click()
  const editModal2 = page.locator('.ant-modal').filter({ has: page.locator('.ant-modal-title', { hasText: '编辑新闻' }) })
  await editModal2.waitFor()
  if (await editModal2.locator('.ant-upload-list-item').count()) {
    throw new Error('expected cover_image cleared after delete+save')
  }
  await editModal2.getByRole('button', { name: '取消' }).click()
  await editModal2.waitFor({ state: 'hidden' })

  // 删除记录
  await row.getByRole('button', { name: '删除' }).click()
  const pop = page.locator('.ant-popover').filter({ hasText: '确定' }).last()
  await pop.getByRole('button', { name: '确定' }).click()
  await page.waitForTimeout(900)
}

async function main() {
  const browser = await chromium.launch({ headless })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })

  const results = []
  try {
    // Web: list -> detail
    {
      const page = await context.newPage()
      const collector = attachCollector(page)

      await ensureListToDetail(page, '/news', 'a[href^="/news/"]:not([href="/news"])', /\\/news\\/(\\d+)/)
      await ensureListToDetail(page, '/cases', 'a[href^="/cases/"]:not([href="/cases"])', /\\/cases\\/(\\d+)/)
      await ensureListToDetail(page, '/products', 'a[href^="/products/"]:not([href="/products"])', /\\/products\\/(\\d+)/)

      await submitContactLead(page)

      results.push({ label: 'web-regression', ...collector })
      await page.close()
    }

    // Admin: login, 401 returnUrl flow, init template, upload+remove image regression
    {
      const page = await context.newPage()
      const collector = attachCollector(page)

      await loginAdmin(page)
      await forceAdmin401ReturnUrlFlow(page)

      await initCompanyInfoTemplate(page)
      await createNewsWithCoverAndDelete(page)

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

  console.log(JSON.stringify({ hasIssues, results }, null, 2))
  process.exitCode = hasIssues ? 1 : 0
}

main().catch((error) => {
  console.error('[regression] failed:', error)
  process.exitCode = 1
})

