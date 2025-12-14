# 性能优化记录（D）

目标：本地体验更接近可上线质量，重点消除 `chunk > 500k` 警告并优化首屏加载路径。

---

## 改动点

### 1) Vite 拆包策略（manualChunks）

- web：`vite.config.ts`
  - `react-vendor`：`react` / `react-dom` / `react-router-dom`
  - `antd`：`antd`
  - `antd-icons`：`@ant-design/icons`
  - `vendor`：其余 `node_modules`

- admin：`admin/vite.config.ts`
  - `react-vendor`：`react` / `react-dom` / `react-router-dom`
  - `antd`：antd 核心（并对 `table/form/date-picker/select/upload/tree/cascader` 进一步拆分为 `antd-xxx`）
  - `rc`：`rc-*`
  - `ant-design` / `ant-design-icons`：`@ant-design/*`
  - `vendor`：其余 `node_modules`

### 2) 路由懒加载（页面级）

- web：`src/App.tsx`（除首页外均 `React.lazy` + `Suspense`）
- admin：`admin/src/App.tsx`（页面与主布局均 `React.lazy` + `Suspense`）

### 3) 图片加载

- `src/components/ImageWithFallback.tsx`：默认 `loading="lazy"` + `decoding="async"`；首屏 Banner 按需 `loading="eager"`（`src/pages/Home/index.tsx`）。

---

## 构建对比（本地）

### 构建命令

```bash
# web
npm run build

# admin
npm --prefix admin run build:check
```

### 结果摘要（largest chunk）

| 应用 | Before | After | 说明 |
|---|---:|---:|---|
| web | `index-*.js` ≈ **613.84 kB**（触发 >500k 警告） | `vendor-*.js` ≈ **483.56 kB** / `antd-*.js` ≈ **396.52 kB**（无警告） | 通过 `manualChunks` 将 vendor/antd/react 拆分 |
| admin | `index-*.js` ≈ **1,478.48 kB**（触发 >500k 警告） | `rc-*.js` ≈ **405.87 kB** / `antd-*.js` ≈ **403.55 kB**（无警告） | 路由懒加载 + antd 细分拆包，显著降低首屏 bundle |

> 详细输出日志已在本地 `logs/build-*-before.log` / `logs/build-*-after.log` 中记录（仓库默认忽略 logs）。

