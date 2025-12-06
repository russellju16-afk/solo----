# Admin 端「线索管理页面」开发计划

## 一、目录结构调整
1. 将现有的 `src/pages/Leads/index.tsx` 拆分为：
   - `src/pages/Leads/LeadsList.tsx` - 线索列表主页面
   - `src/pages/Leads/LeadDetailDrawer.tsx` - 线索详情抽屉组件
   - `src/pages/Leads/index.tsx` - 导出入口

2. 创建类型定义和工具函数：
   - `src/types/lead.ts` - 完整的 TypeScript 类型定义
   - `src/utils/lead.ts` - 渠道类型和状态标签映射

## 二、实现步骤

### 1. 类型定义 (`src/types/lead.ts`)
- 定义 `LeadStatus` 枚举类型
- 定义 `LeadListItem` 接口
- 定义 `LeadDetail` 接口
- 定义 `LeadFollowup` 接口

### 2. 工具函数 (`src/utils/lead.ts`)
- 实现渠道类型映射
- 实现状态标签映射
- 实现状态颜色映射

### 3. 服务层完善 (`src/services/lead.ts`)
- 为现有方法添加完整的 TypeScript 类型
- 确保与后端 API 接口一致

### 4. 线索列表页面 (`src/pages/Leads/LeadsList.tsx`)
- 实现筛选区（状态、渠道类型、时间范围、负责人、关键字）
- 实现表格展示（带分页、loading 状态、错误处理）
- 实现导出功能
- 实现详情抽屉的调用

### 5. 线索详情抽屉 (`src/pages/Leads/LeadDetailDrawer.tsx`)
- 实现抽屉组件，从右侧弹出
- 展示线索基础信息、业务信息和文本信息
- 实现状态更新功能
- 实现跟进记录展示（Timeline）
- 实现新增跟进记录功能

### 6. 路由调整
- 将 `src/pages/LeadDetail/index.tsx` 改为使用抽屉组件
- 调整路由配置，确保 `/leads/:id` 也能打开抽屉

## 三、技术要求
- 使用 React + TypeScript + Ant Design
- 保持与现有项目代码风格一致
- 实现完整的 loading 状态和错误处理
- 确保所有异步操作都有反馈
- 实现手机号脱敏显示
- 支持响应式布局

## 四、预期效果
- 运营/销售人员可以通过 `/leads` 页面查看、筛选、搜索线索
- 可以通过抽屉查看线索详情和跟进记录
- 可以更新线索状态和添加跟进记录
- 可以导出当前筛选条件下的线索
- 整体界面美观、交互流畅