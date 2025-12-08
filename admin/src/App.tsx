
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Login from './pages/Login'
import Layout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import LeadsList from './pages/Leads/LeadsList'
import Products from './pages/Products'
import ProductCategories from './pages/ProductCategories'
import ProductBrands from './pages/ProductBrands'
import Banners from './pages/Banners'
import News from './pages/News'
import Cases from './pages/Cases'
import Solutions from './pages/Solutions'
import CompanyInfo from './pages/CompanyInfo'
import FeishuConfig from './pages/FeishuConfig'
import Users from './pages/Users'
import OperationLogs from './pages/OperationLogs'
import Profile from './pages/Profile'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1E40AF',
          colorBgLayout: '#f6f8fd',
          colorBgContainer: '#ffffff',
          colorText: '#0f172a',
          colorTextSecondary: '#667085',
          fontFamily: "'Inter', 'SF Pro Display', 'PingFang SC', 'Segoe UI', Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
          fontSize: 14,
          borderRadius: 8,
          borderRadiusLG: 12,
        },
      }}
    >
      <Router>
        <Routes>
          {/* 登录页 */}
          <Route path="/login" element={<Login />} />
          {/* 主布局 */}
          <Route path="/" element={<Layout />}>
            {/* 仪表盘 */}
            <Route index element={<Dashboard />} />
            {/* 线索管理 */}
            <Route path="leads" element={<LeadsList />} />
            {/* 产品相关 */}
            <Route path="products" element={<Products />} />
            <Route path="product-categories" element={<ProductCategories />} />
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
      </Router>
    </ConfigProvider>
  )
}

export default App
