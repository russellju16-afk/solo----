# Bug & 优化报告（本地回归）

更新时间：2025-12-14  
环境：macOS (arm64) / Node `v25.2.1` / npm `11.6.2`

---

## A. 启动与基线检查（已真实启动 + 打开页面验证）

### A1. 依赖安装（按 lock 自动识别：本仓库为 npm）

```bash
# 根目录（web）
npm install --no-fund --no-audit

# admin
npm --prefix admin install --no-fund --no-audit

# server
npm --prefix server install --no-fund --no-audit
```

### A2. 三端启动命令（3 个终端标签）

```bash
# server
npm --prefix server run start:dev

# web
npm run dev

# admin
npm --prefix admin run dev
```

### A3. 实际监听端口（以本机监听为准）

- server：`http://localhost:3002`（全局前缀 `/api`；静态 `/uploads/**`）
- web：`http://localhost:3000`
- admin：`http://localhost:5173`

### A4. 关键日志（节选）

**server 启动**

```
Application is running on: http://localhost:3002
```

**server 路由映射（Nest 启动期节选）**

```
[RouterExplorer] Mapped {/api/auth/login, POST} route
[RouterExplorer] Mapped {/api/products, GET} route
[RouterExplorer] Mapped {/api/company-info, GET} route
[RouterExplorer] Mapped {/api/admin/company-info, PUT} route
```

**uploads 静态托管验证（真实请求）**

```
curl -I http://localhost:3002/uploads/1ceab797-594e-4cdc-9685-e6e89795390f.webp
HTTP/1.1 200 OK
Content-Type: image/webp
Content-Length: 12120
```

**web / admin 启动（Vite）**

```
web  ➜  Local: http://localhost:3000/
admin ➜  Local: http://localhost:5173/
```

### A5. 启动期可接受 Warning 说明

- server：在 Node `v25.x` 下，`nest start --watch` 启动期会出现 `DEP0190` 的 DeprecationWarning（与 child_process `shell: true` 参数拼接相关），不影响接口功能；如需消除建议切换 Node LTS（20/22）或升级 Nest CLI。

---

## B. Bug 扫描与修复清单（Console + Network + 交互）

说明：以下问题均为本地回归测试中真实复现（Playwright 打开页面 + DevTools 级别采集 console/page/network），并已在代码中修复。

| 优先级 | 模块/页面 | 复现步骤 | 截图点位（文字描述） | 修复文件 | 修复方案 |
|---|---|---|---|---|---|
| P0 | admin `npm run build:check` 失败 | `npm --prefix admin run build:check` | 终端报错：`import.meta.env` 类型缺失 | `admin/tsconfig.json` | 增加 `types: ["vite/client"]`，补齐 `ImportMetaEnv` 类型 |
| P1 | admin 登录/鉴权 401 体验 | 打开任意后台页 → 触发 token 过期/401 → 观察跳转 | 401 后页面仍停留在原页或重复报错 | `admin/src/utils/authRedirect.ts`, `admin/src/pages/Login/index.tsx` | 401 时提示一次并跳转登录页，携带 `returnUrl`；登录后回跳原页面 |
| P1 | admin 内容管理：删除图片但提交旧值 | Banner/新闻/案例/解决方案：上传图片→删除→保存→刷新 | UI 已删除但刷新后图片又回来了 | `admin/src/pages/Banners/index.tsx`, `admin/src/pages/News/index.tsx`, `admin/src/pages/Cases/index.tsx`, `admin/src/pages/Solutions/index.tsx` | 文件列表为空时向后端提交 `''` 清空字段，避免残留旧值 |
| P1 | admin 公司信息为空时无法快速初始化 | 进入「公司信息」模块，后端返回空对象时 | 表单字段大量为空，前台长期依赖兜底文案 | `admin/src/pages/CompanyInfo/index.tsx`, `server/src/modules/company/dto/update-company-info.dto.ts`, `server/src/modules/company/company.service.ts` | 增加 dev-only「一键填充默认模板」按钮；补齐字段并支持微信二维码；后端 DTO/默认值同步 |
| P2 | web 详情页 Spin `tip` 控制台告警 | 进入新闻/案例/产品详情（加载态）打开 Console | Console：`Spin tip only work in nest or fullscreen` | `src/pages/News/Detail/index.tsx`, `src/pages/Cases/Detail/index.tsx`, `src/pages/Products/Detail/index.tsx` | 按 antd 约束给 `Spin` 添加 children 包裹，消除告警 |
| P2 | admin antd `message` 静态方法告警 | 打开后台任意页面触发 `message.*` | Console：`Static function can not consume context` | `admin/src/utils/antdMessage.ts`, `admin/src/App.tsx` | 通过 `message.useMessage()` 注入实例并桥接，避免全站逐个改动调用点 |
| P2 | web FloatButton `shape` 告警 | 打开 web 任意页面（右下角悬浮按钮） | Console：`FloatButton supported only when shape is square` | `src/components/ContactWidget.tsx` | 设置 `shape="square"` 以符合 antd 约束 |
| P2 | favicon 404 | 打开 web/admin → Network 过滤 `favicon` | Network：`/favicon.ico` 404 | `index.html`, `admin/index.html`, `public/favicon.svg`, `admin/public/favicon.svg` | 提供 `favicon.svg` 并更新 HTML 引用，消除 404 |
| P2 | 文案/邮箱包含中文导致不可用 | 打开 Contact/页脚等位置点击邮箱 | mailto 地址包含中文域名 | `src/components/ContactWidget.tsx`, `src/components/layout/Footer.tsx`, `src/pages/Contact/index.tsx`, `src/pages/Service/index.tsx`, `src/pages/Products/Detail/index.tsx` | 统一替换为可用邮箱 `info@chaoqun-liangyou.com` |

---

## 本轮回归验证结果（已通过）

### 前台（web）已验证页面

- `/` `/products` `/solutions` `/cases` `/news` `/about` `/contact`

### 后台（admin）已验证模块

- Dashboard、Leads、Banner、新闻、案例、解决方案、产品、公司信息

### 验证结论

- Console：无红色 error（包含常见 antd/React “红色 warning” 已清零）
- Network：无 404/500（favicon / 静态资源 / API 均正常；401 场景已做友好跳转）
