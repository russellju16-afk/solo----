# 开发自测步骤

## 1. 后端 + admin 产品筛选与封面图

### 启动服务
- 启动后端：`cd server && npm run start:dev`
- 启动 admin：`cd admin && npm run dev`

### 验证内容
- **分类筛选**：在后台「产品管理 → 产品列表」中选择某个分类，列表应只显示该分类的产品
- **品牌筛选**：选择某品牌后，列表应只显示该品牌的产品
- **状态筛选**：选择「上架」或「下架」状态，列表应只显示对应状态的产品
- **封面图字段**：
  - 列表接口返回中，每条记录包含 `cover_image`（来自首张产品图片）
  - 详情接口返回完整的 `images` 数组

## 2. 前台 & admin dev 时 Tailwind 不再有 node_modules 扫描 warning

### 操作步骤
- 前台：在根目录执行 `npm run dev`
- admin：`cd admin && npm run dev`

### 验证内容
- dev 启动后不应出现 "content pattern matches node_modules" 或 "content is missing or empty" 的 warning
- `tailwind.config.js` 中的 `content` 配置不会匹配到 node_modules，按当前目录结构写得合理

## 3. 路由懒加载的 loading fallback

### 操作步骤
- 打开前台站点（例如 `http://localhost:3000`）
- 第一次点击某些路由，如「产品中心」、「客户案例」、「解决方案」等

### 期望结果
- 第一次访问时短暂显示统一的 loading 文案「页面加载中...」，然后渲染对应页面
- 再次点击这些路由时，页面应立即显示，不再长时间 loading

### 技术实现
- 使用 `React.lazy` + `Suspense` 实现路由懒加载
- Suspense fallback 文案友好、不会导致白屏
- 懒加载的页面组件导入路径正确
