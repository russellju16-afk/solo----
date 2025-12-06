# Admin端线索管理页面清理计划

## 一、清理范围

### 1. 前端代码（Admin端）

#### 组件与页面
- ✅ `/admin/src/pages/Leads/LeadsList.tsx` - 线索列表页面
- ✅ `/admin/src/pages/Leads/LeadDetailDrawer.tsx` - 线索详情抽屉组件
- ✅ `/admin/src/pages/Leads/index.tsx` - 线索列表入口
- ✅ `/admin/src/pages/LeadDetail/index.tsx` - 线索详情页面
- ✅ `/admin/src/components/LeadForm.tsx` - 线索表单组件

#### 服务与类型
- ✅ `/admin/src/services/lead.ts` - 线索相关API服务
- ✅ `/admin/src/types/lead.ts` - 线索类型定义
- ✅ `/admin/src/utils/lead.ts` - 线索工具函数

#### 配置
- ✅ `/admin/src/App.tsx` - 移除leads相关路由
- ✅ `/admin/src/layouts/MainLayout.tsx` - 移除leads菜单项

### 2. 后端代码

**注意：需保留官网提交线索的API（`POST /api/leads`）**

#### Controller
- ✅ 修改 `/server/src/modules/lead/lead.controller.ts` - 移除后台管理相关接口

#### Service
- ✅ 修改 `/server/src/modules/lead/lead.service.ts` - 移除后台管理相关方法
- ✅ 删除 `/server/src/modules/lead/lead-followup.service.ts` - 跟进记录服务

#### 实体与DTO
- ✅ 删除 `/server/src/modules/lead/entities/lead-followup.entity.ts` - 跟进记录实体
- ✅ 删除相关DTO文件

## 二、清理步骤

### 1. 前端清理（Admin端）

1. **移除路由配置**
   - 从 `/admin/src/App.tsx` 中移除 `/leads` 和 `/leads/:id` 路由

2. **移除菜单项**
   - 从 `/admin/src/layouts/MainLayout.tsx` 中移除线索管理菜单项

3. **删除组件与页面**
   - 删除 `/admin/src/pages/Leads/` 目录
   - 删除 `/admin/src/pages/LeadDetail/` 目录
   - 删除 `/admin/src/components/LeadForm.tsx`

4. **删除服务、类型与工具函数**
   - 删除 `/admin/src/services/lead.ts`
   - 删除 `/admin/src/types/lead.ts`
   - 删除 `/admin/src/utils/lead.ts`

### 2. 后端清理

1. **修改Controller**
   - 保留 `POST /api/leads` 接口（官网提交线索）
   - 移除所有 `/api/admin/leads` 相关接口

2. **修改Service**
   - 保留 `create` 方法（创建线索）
   - 移除 `findAll`、`findOneById`、`update`、`delete`、`updateStatus`、`export` 等后台管理方法

3. **删除跟进记录相关**
   - 删除 `LeadFollowupService`
   - 删除 `lead-followup.entity.ts`
   - 删除相关DTO和依赖

4. **更新Module配置**
   - 移除LeadModule中与跟进记录相关的配置
   - 移除不必要的依赖注入

## 三、依赖分析

### 1. 前端依赖
- Leads组件只被App.tsx路由引用，移除后不会影响其他组件
- LeadForm组件只被Leads页面引用，移除后不会影响其他组件
- leadService只被Leads相关组件引用，移除后不会影响其他服务

### 2. 后端依赖
- LeadController的后台接口只被Admin端调用，移除后不会影响官网功能
- LeadFollowupService只被LeadController引用，移除后不会影响其他服务
- 官网提交线索的API（`POST /api/leads`）将被保留，确保正常功能

## 四、测试计划

### 1. 前端测试
- ✅ 确认Admin端无leads相关路由和菜单
- ✅ 确认Admin端其他功能正常访问
- ✅ 确认官网提交线索功能正常

### 2. 后端测试
- ✅ 确认 `/api/leads` 接口正常工作
- ✅ 确认所有 `/api/admin/leads` 接口已移除
- ✅ 确认后端服务正常启动，无编译错误

## 五、注意事项

1. **保留官网功能**：确保官网提交线索的功能不受影响
2. **清理彻底**：移除所有相关的导入和引用
3. **测试充分**：在开发环境和测试环境中进行全面测试
4. **代码规范**：确保清理后的代码符合项目代码规范

## 六、预期结果

- Admin端不再显示线索管理页面和菜单
- 官网提交线索功能正常工作
- 系统其他功能不受影响
- 代码结构更加清晰，无冗余文件