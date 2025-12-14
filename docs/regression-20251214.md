# 回归验证报告（2025-12-14）

目标：进入“回归验证 + 收口优化 + 防回归”阶段，确保本地运行体验接近可上线质量。

## A1) 三端启动信息（已真实启动）

> 启动日志：`logs/server-dev.log`、`logs/web-dev.log`、`logs/admin-dev.log`

```bash
# server
npm --prefix server run start:dev

# web
npm run dev -- --host 127.0.0.1

# admin
npm --prefix admin run dev -- --host 127.0.0.1
```

监听端口（本机）：
- server：`http://127.0.0.1:3002`（API 前缀 `/api`；静态 `/uploads/**`）
- web：`http://127.0.0.1:3000`
- admin：`http://127.0.0.1:5173`

## A2) 回归用例结果（Pass/Fail + 证据）

自动化“浏览器回归”（Playwright / Chromium，headless）：
- 命令：`node scripts/smoke.mjs`、`node scripts/regression.mjs`
- 证据：`logs/smoke-20251214.json`（`hasIssues=false`）、`logs/regression-20251214.json`（`hasIssues=false`）
- 截图证据：`logs/artifacts/regression-20251214/web-products-desktop.png`、`logs/artifacts/regression-20251214/web-products-mobile.png`、`logs/artifacts/regression-20251214/web-products-mobile-filter-drawer.png`

> 注：尝试 `HEADLESS=false` 会因当前运行环境无可用 GUI 而失败；回归仍使用真实 Chromium 引擎执行并收集 Console/Network 结果。

### 用例 1【前台】联系我们：地区级联可选到街道

- 步骤：打开 `web /contact#quote` → 展开“所在城市/区县”级联 → 逐级点选 4 层（省→市→区县→街道）
- 结果：Pass
- 证据：`logs/regression-20251214.json` → `web-regression`（无 Console error / Network 4xx/5xx）；回归脚本内断言选中层级 ≥ 4

### 用例 2【前台】获取报价表单：必填校验 + 成功/失败提示清晰

- 步骤：打开 `web /contact#quote` → 直接提交触发必填校验 → 填写必填项（姓名/手机号/公司/采购角色/地区/意向品类/月采购量）→ 提交
- 结果：Pass（成功 toast 含“提交成功”）
- 证据：`logs/regression-20251214.json` → `web-regression`（无静默 400/500；无 Console error）

### 用例 3【前台】产品中心：筛选/搜索/清空/空态 CTA；筛选条无异常

- 步骤（桌面端）：打开 `web /products` → 搜索框输入关键词 → 点击“搜索” → 如为空态则检查 CTA（清空条件/返回全部/去获取报价）
- 步骤（移动端）：打开 `web /products`（<=768px）→ 点击“筛选”打开 Drawer → 点击“应用筛选”并可关闭
- 结果：Pass
- 证据：
  - 截图：`logs/artifacts/regression-20251214/web-products-desktop.png`、`logs/artifacts/regression-20251214/web-products-mobile.png`、`logs/artifacts/regression-20251214/web-products-mobile-filter-drawer.png`
  - 回归：`logs/regression-20251214.json` → `web-regression` + `web-states`（含“空态 CTA 断言”）

### 用例 4【前台】新闻/案例/解决方案：Skeleton/Empty/详情页

- 步骤：分别打开 `web /news`、`/cases`、`/solutions` → 验证列表加载态 Skeleton → 验证空数据 Empty + CTA → 列表可跳详情（新闻/案例/解决方案）
- 结果：Pass
- 证据：`logs/regression-20251214.json` → `web-states`（脚本通过网络延迟/空响应注入，断言 Skeleton/Empty/CTA 路径均可达）；`web-regression`（列表→详情跳转）

### 用例 5【后台】登录后频繁切换菜单 2-3 分钟不跳回登录

- 步骤：登录后台 → 在多个模块之间快速切换（约 120 秒）
- 结果：Pass（回归脚本中断言全程不进入 `/login`）
- 证据：`logs/regression-20251214.json` → `admin-regression`

### 用例 6【后台】线索管理：筛选/分页正常；导出稳定下载 xlsx

- 步骤：打开 `admin /leads` → 点击“导出”
- 结果：Pass（下载 `.xlsx` 且文件头为 `PK`）
- 证据：`logs/regression-20251214.json` → `admin-regression`

### 用例 7【后台】内容管理任一模块：上传→保存→刷新仍存在；删除图片同步清理字段

- 步骤：以“新闻”为例：新增新闻→上传封面→提交→刷新页面确认记录存在→编辑删除封面→提交→刷新→再次编辑确认封面字段为空→删除记录
- 结果：Pass
- 证据：`logs/regression-20251214.json` → `admin-regression`

### 用例 8【后端】`/api/admin/leads/export` 不被 `:id` 路由吃掉

- 步骤：请求 `GET http://127.0.0.1:3002/api/admin/leads/export?pageSize=10`（携带 Bearer token）
- 结果：Pass（200 且 `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`）
- 证据：本地 `curl` 头信息（节选）
  - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition: attachment; filename=leads_*.xlsx`

## 通过率

- Pass/Total：**8/8**

