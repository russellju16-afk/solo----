
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Login from './pages/Login'
import Layout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import LeadsList from './pages/Leads/LeadsList'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
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
            {/* 未来会在统一后台应用里恢复其他功能 */}
            {/* 产品相关：products、product-categories、product-brands */}
            {/* 内容管理：banners、news、cases、solutions */}
            {/* 公司信息：company-info */}
            {/* 飞书配置：feishu-config */}
            {/* 系统设置：users、operation-logs */}
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
