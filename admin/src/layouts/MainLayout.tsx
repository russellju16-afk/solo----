import React from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button } from 'antd'
import { UserOutlined, LogoutOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const { Header, Sider, Content } = AntLayout

const MainLayout: React.FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // 检查用户是否登录
  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  // 退出登录
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 用户菜单
  const userMenu = [
    {
      key: '1',
      label: '个人中心',
    },
    {
      key: '2',
      label: (
        <Button type="text" danger onClick={handleLogout} icon={<LogoutOutlined />}>
          退出登录
        </Button>
      ),
    },
  ]

  // 侧边栏菜单
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/leads',
      icon: <TeamOutlined />,
      label: '线索管理',
    },
  ]

  // 菜单点击处理
  const handleMenuClick = (e: any) => {
    navigate(e.key)
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        theme="dark"
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type)
        }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        {/* 顶部导航 */}
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Dropdown
            menu={{ items: userMenu }}
            trigger={['click']}
          >
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{user?.name || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        {/* 内容区域 */}
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default MainLayout
