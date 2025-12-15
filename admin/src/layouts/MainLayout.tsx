/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import type { MenuProps } from 'antd'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Space } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ReadOutlined,
  PictureOutlined,
  FileTextOutlined,
  BulbOutlined,
  HomeOutlined,
  MessageOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  FileSearchOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { isAuthenticated } from '../utils/auth'
import { redirectToLogin } from '../utils/authRedirect'
import './MainLayout.css'

const { Header, Sider, Content } = AntLayout

const MainLayout: React.FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout, token } = useAuthStore()

  // 检查用户是否登录
  React.useEffect(() => {
    if (!token && !isAuthenticated()) {
      redirectToLogin('MainLayout 检测到未登录，pathname=' + pathname)
    }
  }, [pathname, token])

  // 退出登录
  const handleLogout = () => {
    logout('用户主动退出')
    redirectToLogin('用户主动退出')
  }

  // 用户菜单
  const userMenu = [
    {
      key: 'profile',
      label: '个人中心',
    },
    {
      key: 'logout',
      label: (
        <Button type="text" danger block icon={<LogoutOutlined />}>
          退出登录
        </Button>
      ),
    },
  ]

  const handleUserMenuClick: MenuProps['onClick'] = info => {
    if (info.key === 'profile') {
      navigate('/profile')
    }
    if (info.key === 'logout') {
      handleLogout()
    }
  }

  const routeKeys = React.useMemo(
    () => [
      '/',
      '/analytics',
      '/leads',
      '/products',
      '/product-categories',
      '/product-brands',
      '/banners',
      '/news',
      '/cases',
      '/solutions',
      '/company-info',
      '/feishu-config',
      '/users',
      '/operation-logs',
    ],
    [],
  )

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据看板',
    },
    {
      key: '/leads',
      icon: <TeamOutlined />,
      label: '线索管理',
    },
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: '产品管理',
    },
    {
      key: 'content',
      icon: <ReadOutlined />,
      label: '内容管理',
      children: [
        { key: '/banners', label: 'Banner 管理', icon: <PictureOutlined /> },
        { key: '/news', label: '新闻资讯', icon: <FileTextOutlined /> },
        { key: '/cases', label: '客户案例', icon: <BulbOutlined /> },
        { key: '/solutions', label: '解决方案', icon: <FileTextOutlined /> },
      ],
    },
    {
      key: '/company-info',
      icon: <HomeOutlined />,
      label: '公司信息',
    },
    {
      key: '/feishu-config',
      icon: <MessageOutlined />,
      label: '飞书配置',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/users', label: '用户管理', icon: <UserSwitchOutlined /> },
        { key: '/operation-logs', label: '操作日志', icon: <FileSearchOutlined /> },
      ],
    },
  ]

  const selectedKey = React.useMemo(() => {
    const matched = routeKeys
      .filter(key => key !== '/')
      .find(key => pathname === key || pathname.startsWith(`${key}/`))

    if (matched) {
      if (matched === '/product-categories' || matched === '/product-brands') return '/products'
      return matched
    }
    return pathname === '/' ? '/' : ''
  }, [pathname, routeKeys])

  const [openKeys, setOpenKeys] = React.useState<string[]>([])

  React.useEffect(() => {
    const keys: string[] = []
    if (['/banners', '/news', '/cases', '/solutions'].some(key => pathname === key || pathname.startsWith(`${key}/`))) {
      keys.push('content')
    }
    if (['/users', '/operation-logs'].some(key => pathname === key || pathname.startsWith(`${key}/`))) {
      keys.push('system')
    }
    setOpenKeys(keys)
  }, [pathname])

  // 菜单点击处理
  const handleMenuClick = (e: any) => {
    navigate(e.key)
  }

  return (
    <AntLayout className="admin-shell">
      {/* 侧边栏 */}
      <Sider
        className="admin-sider"
        theme="dark"
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type)
        }}
      >
        <div className="sider-brand">
          <div className="brand-mark">超群</div>
          <div className="brand-text">
            <span className="brand-title">超群粮油</span>
            <span className="brand-subtitle">统一后台</span>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          openKeys={openKeys}
          onOpenChange={keys => setOpenKeys(keys as string[])}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>
      <AntLayout className="admin-main">
        {/* 顶部导航 */}
        <Header className="admin-header">
          <div className="header-left">
            <span className="header-pill">超群粮油</span>
            <span className="header-sub">统一后台</span>
          </div>
          <Dropdown
            menu={{ items: userMenu, onClick: handleUserMenuClick }}
            trigger={['click']}
          >
            <Space className="header-user">
              <Avatar size={36} icon={<UserOutlined />} />
              <div className="user-meta">
                <span className="user-name">{user?.name || '管理员'}</span>
                <span className="user-role">管理员</span>
              </div>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>
        {/* 内容区域 */}
        <Content className="admin-content">
          <div className="content-area">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default MainLayout
