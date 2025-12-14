import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, message } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { bindAntdMessage } from './utils/antdMessage'

const Login = lazy(() => import('./pages/Login'))
const Layout = lazy(() => import('./layouts/MainLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))
const LeadsList = lazy(() => import('./pages/Leads/LeadsList'))
const Products = lazy(() => import('./pages/Products'))
const ProductBrands = lazy(() => import('./pages/ProductBrands'))
const Banners = lazy(() => import('./pages/Banners'))
const News = lazy(() => import('./pages/News'))
const Cases = lazy(() => import('./pages/Cases'))
const Solutions = lazy(() => import('./pages/Solutions'))
const CompanyInfo = lazy(() => import('./pages/CompanyInfo'))
const FeishuConfig = lazy(() => import('./pages/FeishuConfig'))
const Users = lazy(() => import('./pages/Users'))
const OperationLogs = lazy(() => import('./pages/OperationLogs'))
const Profile = lazy(() => import('./pages/Profile'))

const themeConfig = {
  token: {
    colorPrimary: '#1E40AF',
    colorBgLayout: '#f6f8fd',
    colorBgContainer: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#667085',
    fontFamily:
      "'Inter', 'SF Pro Display', 'PingFang SC', 'Segoe UI', Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    borderRadius: 8,
    borderRadiusLG: 12,
  },
} as const

function AntdMessageBridge({ children }: { children: React.ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage()

  React.useLayoutEffect(() => {
    bindAntdMessage(messageApi)
  }, [messageApi])

  return (
    <>
      {contextHolder}
      {children}
    </>
  )
}

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={themeConfig}
    >
      <AntdMessageBridge>
        <Router>
          <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: '#667085' }}>页面加载中...</div>}>
            <Routes>
              {/* 登录页 */}
              <Route path="/login" element={<Login />} />
              {/* 主布局 */}
              <Route path="/" element={<Layout />}>
                {/* 仪表盘 */}
                <Route index element={<Dashboard />} />
                {/* 数据看板 */}
                <Route path="analytics" element={<Analytics />} />
                {/* 线索管理 */}
                <Route path="leads" element={<LeadsList />} />
                <Route path="leads/:id" element={<LeadsList />} />
                {/* 产品相关 */}
                <Route path="products" element={<Products />} />
                <Route path="product-categories" element={<Navigate to="/products?tab=categories" replace />} />
                <Route path="product-brands" element={<ProductBrands />} />
                {/* 内容管理 */}
                <Route path="banners" element={<Banners />} />
                <Route path="news" element={<News />} />
                <Route path="cases" element={<Cases />} />
                <Route path="solutions" element={<Solutions />} />
                {/* 公司信息 */}
                <Route path="company-info" element={<CompanyInfo />} />
                {/* 飞书配置 */}
                <Route path="feishu-config" element={<FeishuConfig />} />
                {/* 系统设置 */}
                <Route path="users" element={<Users />} />
                <Route path="operation-logs" element={<OperationLogs />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AntdMessageBridge>
    </ConfigProvider>
  )
}

export default App
