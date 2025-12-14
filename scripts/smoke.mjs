import { chromium } from 'playwright'

const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:3000'
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || 'http://localhost:5173'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456'

const headless = process.env.HEADLESS !== 'false'

function normalizeUrl(baseUrl, path) {
  if (!path.startsWith('/')) return `${baseUrl}/${path}`
  return `${baseUrl}${path}`
}

function shouldIgnoreResponse(url, status) {
  if (status < 400) return true
  if (url.includes('/sockjs-node')) return true
  if (url.includes('/__vite_ping')) return true
  if (url.includes('/@vite/client')) return true
  if (url.includes('/@react-refresh')) return true
  return false
}

async function checkPage(page, url, options = {}) {
  const consoleErrors = []
  const pageErrors = []
  const requestFailures = []
  const badResponses = []

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    consoleErrors.push({
      text: msg.text(),
      location: msg.location(),
    })
  })

  page.on('pageerror', (error) => {
    pageErrors.push({
      message: error?.message || String(error),
      stack: error?.stack,
    })
  })

  page.on('requestfailed', (request) => {
    requestFailures.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText,
    })
  })

  page.on('response', (response) => {
    const status = response.status()
    const url = response.url()
    if (shouldIgnoreResponse(url, status)) return
    badResponses.push({
      url,
      status,
      method: response.request().method(),
    })
  })

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(options.settleMs ?? 1200)

  return {
    url,
    consoleErrors,
    pageErrors,
    requestFailures,
    badResponses,
  }
}

async function loginAdmin(page) {
  await page.goto(normalizeUrl(ADMIN_BASE_URL, '/login'), { waitUntil: 'domcontentloaded' })

  await page.locator('input[placeholder="用户名"]').fill(ADMIN_USERNAME)
  await page.locator('input[placeholder="密码"]').fill(ADMIN_PASSWORD)

  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith('/login')),
    page.locator('button[type="submit"]').click(),
  ])
}

async function main() {
  const browser = await chromium.launch({ headless })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })

  const results = {
    web: [],
    admin: [],
  }

  try {
    // Web
    const webRoutes = ['/', '/products', '/solutions', '/cases', '/news', '/about', '/contact']
    for (const route of webRoutes) {
      const page = await context.newPage()
      const url = normalizeUrl(WEB_BASE_URL, route)
      const res = await checkPage(page, url, { settleMs: 1500 })
      results.web.push(res)
      await page.close()
    }

    // Admin
    const adminPage = await context.newPage()
    await loginAdmin(adminPage)
    await adminPage.close()

    const adminRoutes = ['/', '/leads', '/banners', '/news', '/cases', '/solutions', '/products', '/company-info']
    for (const route of adminRoutes) {
      const page = await context.newPage()
      const url = normalizeUrl(ADMIN_BASE_URL, route)
      const res = await checkPage(page, url, { settleMs: 1800 })
      results.admin.push(res)
      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
  }

  const all = [...results.web, ...results.admin]
  const hasIssues = all.some(
    (item) =>
      item.consoleErrors.length ||
      item.pageErrors.length ||
      item.requestFailures.length ||
      item.badResponses.length
  )

  console.log(JSON.stringify({ hasIssues, ...results }, null, 2))
  process.exitCode = hasIssues ? 1 : 0
}

main().catch((error) => {
  console.error('[smoke] failed:', error)
  process.exitCode = 1
})
