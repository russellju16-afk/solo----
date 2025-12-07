/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import type { MenuProps } from 'antd'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TrademarkCircleOutlined,
  ReadOutlined,
  PictureOutlined,
  FileTextOutlined,
  BulbOutlined,
  HomeOutlined,
  MessageOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
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

  const routeKeys = React.useMemo(
    () => [
      '/',
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
      key: '/leads',
      icon: <TeamOutlined />,
      label: '线索管理',
    },
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: '产品管理',
      children: [
        { key: '/products', label: '产品列表', icon: <AppstoreOutlined /> },
        { key: '/product-categories', label: '产品分类', icon: <TagsOutlined /> },
        { key: '/product-brands', label: '品牌管理', icon: <TrademarkCircleOutlined /> },
      ],
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

    if (matched) return matched
    return pathname === '/' ? '/' : ''
  }, [pathname, routeKeys])

  const [openKeys, setOpenKeys] = React.useState<string[]>([])

  React.useEffect(() => {
    const keys: string[] = []
    if (['/products', '/product-categories', '/product-brands'].some(key => pathname === key || pathname.startsWith(`${key}/`))) {
      keys.push('products')
    }
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
          selectedKeys={selectedKey ? [selectedKey] : []}
          openKeys={openKeys}
          onOpenChange={keys => setOpenKeys(keys as string[])}
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
