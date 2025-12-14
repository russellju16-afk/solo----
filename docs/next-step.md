# 本轮修复点清单 & 后续建议（2025-12-14）

要求：发现 Bug 必须当场修复，并记录“复现步骤 + 修复点 + 文件路径”。

## P0 修复（影响核心功能/构建）

### 1) web：解决方案缺少详情页（列表无法进入详情）

- 复现步骤：打开 `web /solutions` → 点击卡片内的“了解更多”（旧行为）只能跳到 `/contact`，无法查看该解决方案详情
- 问题影响：前台“解决方案详情页可打开”验收项无法满足；后端已提供 `/api/solutions/:id` 但前台未接入
- 修复点：
  - 新增详情页：`src/pages/Solutions/Detail/index.tsx`
  - 新增接口：`src/services/content.ts`（`fetchSolutionDetail`）
  - 路由补齐：`src/App.tsx`（新增 `/solutions/:id`）
  - 列表跳转：`src/pages/Solutions/index.tsx`（“查看详情”指向 `/solutions/:id`）

### 2) web：`npm run build` TypeScript 失败（noUnusedLocals）

- 复现步骤：根目录执行 `npm run build`
- 现象：TS 报错 `src/pages/Solutions/Detail/index.tsx React is declared but its value is never read`
- 修复点：移除无用默认导入 `React`：`src/pages/Solutions/Detail/index.tsx`

## P0 稳定性加固（防 401 风暴 / 防重复提交）

### 3) admin：并发 401 风暴防护（只提示一次、只跳转一次；returnUrl 保留）

- 复现步骤：登录后手动把 token 改成无效值（或 token 过期）→ 刷新页面触发多个并发请求
- 期望：只弹一次“登录过期”提示、只跳一次登录页，并保留 `returnUrl`
- 修复点：
  - 401 冷却窗口（5s）避免重复处理：`admin/src/services/http.ts`
  - localStorage token 兜底（空/非法/非 JWT 结构自动清理）：`admin/src/utils/auth.ts`
  - returnUrl 安全处理：`admin/src/utils/authRedirect.ts`（前序已存在，本轮保持）

### 4) admin：提交按钮防重复 + 错误提示可读（避免“操作失败”）

- 复现步骤：在“品牌管理/分类管理”等弹窗中多次快速点击“提交”，或制造后端校验失败
- 修复点：
  - 提交 loading+disabled，防重复：`admin/src/pages/ProductBrands/index.tsx`、`admin/src/pages/ProductCategories/index.tsx`
  - 统一错误文案提取：`admin/src/utils/errorMessage.ts`

## P1 体验统一（低风险）

### 5) admin：Upload 回显一致性（fileList <-> form value）

- 复现步骤：编辑 Banner/新闻/案例/解决方案/公司信息 → 上传图片 → 保存 → 刷新 → 预览/回显应正常；删除图片后保存，刷新后仍应为空
- 修复点：
  - 统一 URL 归一化/回显转换：`admin/src/utils/uploadForm.ts`
  - 接入统一方法：`admin/src/pages/Banners/index.tsx`、`admin/src/pages/News/index.tsx`、`admin/src/pages/Cases/index.tsx`、`admin/src/pages/Solutions/index.tsx`、`admin/src/pages/CompanyInfo/index.tsx`

### 6) web：统一错误态组件（4 态组件收口）

- 说明：列表页统一“加载/空/错误/正常”4 态渲染出口
- 修复点：
  - 新增：`src/components/ErrorState.tsx`
  - 接入：`src/pages/News/index.tsx`、`src/pages/Cases/index.tsx`、`src/pages/Solutions/index.tsx`、`src/pages/Products/List/index.tsx`

## 后续建议（不影响本轮验收，按需排期）

- `any` 类型使用较多（见 `docs/audit-summary.md`），建议优先从 API 返回类型/表单类型开始逐步收紧，减少线上隐藏 bug 概率
- 将 `scripts/regression.mjs` 纳入日常回归（至少在改动表单/鉴权/导出/上传后执行一次）

