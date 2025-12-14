# 全仓快速体检摘要（本地）

更新时间：2025-12-14

> 说明：以下统计基于 `rg` 全仓检索（默认遵循 `.gitignore`，不扫描 `node_modules/`、构建产物等）。

## 1) 关键关键词检索

### console.log

- 命中次数：8
- 涉及文件（5）
  - `admin/src/layouts/MainLayout.tsx`
  - `scripts/regression.mjs`
  - `scripts/smoke.mjs`
  - `server/src/main.ts`
  - `test-login.js`

### console.error

- 命中次数：16
- 涉及文件（11）
  - `admin/src/pages/CompanyInfo/index.tsx`
  - `admin/src/pages/LeadDetail/index.tsx`
  - `scripts/regression.mjs`
  - `scripts/smoke.mjs`
  - `src/components/ContactWidget.tsx`
  - `src/components/common/RegionCascader/index.tsx`
  - `src/components/forms/LeadForm/index.tsx`
  - `src/pages/Contact/index.tsx`
  - `src/pages/Products/Detail/index.tsx`
  - `src/pages/Products/List/index.tsx`
  - `test-login.js`

### TODO / FIXME

- 命中次数：0
- 涉及文件：无

### any（TS/TSX）

- 命中次数：330
- 涉及文件（54）
  - `admin/src/components/LeadForm.tsx`
  - `admin/src/components/ProductForm.tsx`
  - `admin/src/layouts/MainLayout.tsx`
  - `admin/src/pages/Banners/index.tsx`
  - `admin/src/pages/Cases/index.tsx`
  - `admin/src/pages/CompanyInfo/index.tsx`
  - `admin/src/pages/Dashboard/index.tsx`
  - `admin/src/pages/FeishuConfig/index.tsx`
  - `admin/src/pages/Leads/LeadsList.tsx`
  - `admin/src/pages/Login/index.tsx`
  - `admin/src/pages/News/index.tsx`
  - `admin/src/pages/OperationLogs/index.tsx`
  - `admin/src/pages/ProductBrands/index.tsx`
  - `admin/src/pages/ProductCategories/index.tsx`
  - `admin/src/pages/Products/CategoriesPanel.tsx`
  - `admin/src/pages/Products/index.tsx`
  - `admin/src/pages/Solutions/index.tsx`
  - `admin/src/pages/Users/index.tsx`
  - `admin/src/services/company.ts`
  - `admin/src/services/content.ts`
  - `admin/src/services/http.ts`
  - `admin/src/services/lead.ts`
  - `admin/src/services/product.ts`
  - `admin/src/services/user.ts`
  - `server/src/modules/analytics/analytics.service.ts`
  - `server/src/modules/analytics/dto/track-event.dto.ts`
  - `server/src/modules/analytics/entities/analytics-event.entity.ts`
  - `server/src/modules/auth/auth.controller.ts`
  - `server/src/modules/auth/strategies/jwt.strategy.ts`
  - `server/src/modules/content/banner.controller.ts`
  - `server/src/modules/content/banner.service.ts`
  - `server/src/modules/content/case.controller.ts`
  - `server/src/modules/content/case.service.ts`
  - `server/src/modules/content/news.controller.ts`
  - `server/src/modules/content/news.service.ts`
  - `server/src/modules/content/solution.controller.ts`
  - `server/src/modules/content/solution.service.ts`
  - `server/src/modules/faq/faq.controller.ts`
  - `server/src/modules/feishu/feishu.controller.ts`
  - `server/src/modules/feishu/feishu.service.ts`
  - `server/src/modules/lead/dto/quick-signal-lead.dto.ts`
  - `server/src/modules/lead/entities/lead.entity.ts`
  - `server/src/modules/lead/lead-followup.service.ts`
  - `server/src/modules/lead/lead.controller.ts`
  - `server/src/modules/lead/lead.service.ts`
  - `server/src/modules/logging/logging.controller.ts`
  - `server/src/modules/product/product-brand.controller.ts`
  - `server/src/modules/product/product-brand.service.ts`
  - `server/src/modules/product/product-category.controller.ts`
  - `server/src/modules/product/product-category.service.ts`
  - `server/src/modules/product/product.controller.ts`
  - `server/src/modules/product/product.service.ts`
  - `server/src/modules/user/user.controller.ts`
  - `server/src/modules/user/user.service.ts`

### ts-ignore / ts-expect-error

- `@ts-ignore`：0
- `@ts-expect-error`：0

## 2) 可疑硬编码（默认密钥/默认密码/默认域名或邮箱）

### JWT Secret 占位值

- `server/src/modules/auth/auth.module.ts`：对 `JWT_SECRET` 进行“缺失/占位值”检测，生产环境缺失直接报错，开发环境使用 `dev_jwt_secret` 并告警
- `server/src/modules/auth/strategies/jwt.strategy.ts`：同上，避免策略 secret 与签发 secret 不一致

### 默认密码/弱密码痕迹

- `scripts/smoke.mjs`：`ADMIN_PASSWORD` 默认 `123456`（E2E/本地）
- `scripts/regression.mjs`：`ADMIN_PASSWORD` 默认 `123456`（E2E/本地）
- `test-login.js`：测试登录使用 `123456`
- `docs/接口对照表.md`、`docs/验收报告.md`：示例里包含 `123456`（文档示例）
- `server/src/modules/user/user.service.ts`：支持从 `ADMIN_DEFAULT_PASSWORD` 初始化管理员（已避免日志输出明文密码）

