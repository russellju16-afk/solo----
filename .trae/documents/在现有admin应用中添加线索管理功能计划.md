1. **在App.tsx中添加线索管理路由**：
   - 保留现有的/login和/（仪表盘）路由
   - 在Layout内部添加leads路由，指向现有的LeadsList组件

2. **在MainLayout.tsx中添加线索管理菜单**：
   - 在现有的仪表盘菜单基础上，添加线索管理菜单项
   - 确保菜单点击时跳转到/leads路由
   - 保持现有的登录鉴权逻辑不变

3. **验证现有线索管理代码**：
   - 检查现有的LeadsList和LeadDetailDrawer组件是否能正常工作
   - 确保API服务调用正常
   - 验证类型定义和工具函数是否完整

修改的文件：
- admin/src/App.tsx：添加线索管理路由
- admin/src/layouts/MainLayout.tsx：添加线索管理菜单

所有其他线索相关的代码已经存在，只需要将它们挂载到路由和菜单上即可。