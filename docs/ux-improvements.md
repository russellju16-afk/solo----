# UX / 可用性提升清单

目标：让本地运行体验接近可上线质量（更少报错、更清晰状态、更稳的表单与内容管理流程）。

---

## 前台（web）

### 统一组件（全站复用）

- `src/components/ImageWithFallback.tsx`：缺图/坏图统一兜底；默认 `loading="lazy"` + `decoding="async"`，并允许页面按需设置 `loading="eager"`。
- `src/components/PageSkeleton.tsx`：列表/卡片/详情页 Skeleton 统一出口。
- `src/components/PageEmpty.tsx`：空数据统一 Empty + CTA。

### 列表页 4 态统一（加载/空/错误/正常）

- 产品列表：`src/pages/Products/List/index.tsx`（加入 loadError + Retry；缺图不再出现“白板卡片”）
- 新闻列表：`src/pages/News/index.tsx`（Skeleton + Empty + CTA）
- 案例列表：`src/pages/Cases/index.tsx`（Skeleton + Empty + CTA）
- 解决方案列表：`src/pages/Solutions/index.tsx`（Skeleton + Empty + CTA）

### 详情页加载体验与控制台清零

- 新闻/案例/产品详情：`src/pages/News/Detail/index.tsx`, `src/pages/Cases/Detail/index.tsx`, `src/pages/Products/Detail/index.tsx`  
  修复 antd `Spin tip` 使用方式，避免 Console 出现红色告警。

### 首页 Banner 为空兜底（避免大块空白）

- `src/pages/Home/index.tsx`：当 Banner 列表为空时，展示默认 Hero + CTA（获取报价/查看产品）；首屏 Banner 设为 `loading="eager"`。

### 联系方式可用性修正

- `src/components/ContactWidget.tsx`, `src/components/layout/Footer.tsx` 等：修复邮箱含中文域名导致不可用的问题。

### 移动端细节

- `src/components/layout/AppLayout.tsx`：移动端底部安全区（`safe-area-inset-bottom`）适配，避免浮动组件遮挡内容。

---

## 后台（admin）

### 登录/鉴权体验

- `admin/src/utils/authRedirect.ts`：401 时统一跳转 `/login?returnUrl=...`（含安全校验），避免用户迷失。
- `admin/src/pages/Login/index.tsx`：登录成功回跳原页面；已登录直接跳转 returnUrl（或默认首页）。

### 内容管理：上传/删除/保存更稳定

- Banner/新闻/案例/解决方案：删除图片时同步清空字段，避免“UI 删了但提交旧值”。  
  涉及文件：`admin/src/pages/Banners/index.tsx`, `admin/src/pages/News/index.tsx`, `admin/src/pages/Cases/index.tsx`, `admin/src/pages/Solutions/index.tsx`

### 公司信息：空对象可初始化 + 字段完善

- `admin/src/pages/CompanyInfo/index.tsx`：增加 dev-only「一键填充默认模板」按钮；补充介绍/服务区域/服务渠道/微信二维码等字段并校验。
- `server/src/modules/company/dto/update-company-info.dto.ts`, `server/src/modules/company/company.service.ts`：后端 DTO/默认值同步，确保前台 About/Contact 可直接展示后台配置。

### 控制台告警清零（不逐个改 100+ 调用点）

- `admin/src/utils/antdMessage.ts`, `admin/src/App.tsx`：桥接 antd `message.useMessage()`，解决 “Static function cannot consume context” 全站告警。

---

## 其他体验修正

- favicon：`index.html`, `admin/index.html`, `public/favicon.svg`, `admin/public/favicon.svg`（消除 404 /favicon.ico）

