1. **修改App.tsx路由结构**：只保留/login和/路径，移除其他所有业务路由，但不删除页面文件
2. **简化MainLayout.tsx菜单**：只保留仪表盘菜单项，移除所有其他菜单项
3. **修改Dashboard页面**：将复杂仪表盘替换为简单的欢迎信息，说明后台功能建设中
4. **保持登录与鉴权逻辑**：确保现有登录和鉴权机制正常工作

修改的文件：
- admin/src/App.tsx：简化路由配置
- admin/src/layouts/MainLayout.tsx：简化菜单配置
- admin/src/pages/Dashboard/index.tsx：修改为简单欢迎页面

所有其他页面文件和API服务将保持不变，只是暂时不挂到路由上，以便未来扩展使用。