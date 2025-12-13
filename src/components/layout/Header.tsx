import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Drawer } from 'antd'

const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const navItems = [
    { label: '首页', path: '/' },
    { label: '产品中心', path: '/products' },
    { label: '解决方案', path: '/solutions' },
    { label: '服务能力', path: '/service' },
    { label: '客户案例', path: '/cases' },
    { label: '新闻资讯', path: '/news' },
    { label: '关于我们', path: '/about' },
    { label: '联系我们', path: '/contact' },
    { label: '数据看板', path: '/analytics' }
  ]

  const handleDrawerClose = () => setIsDrawerOpen(false)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={handleDrawerClose}>
            <div className="text-2xl font-bold text-primary leading-none">超群粮油</div>
          </Link>

          {/* PC Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[15px]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Contact Button - PC */}
          <div className="hidden md:block">
            <Link to="/contact" className="primary-button px-5 py-2 text-sm md:text-base inline-block">
              获取报价
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary focus:outline-none"
            onClick={() => setIsDrawerOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="导航菜单"
        placement="right"
        onClose={handleDrawerClose}
        open={isDrawerOpen}
        width={250}
      >
        <nav className="space-y-4 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block py-3 px-4 text-gray-800 hover:bg-primary/10 hover:text-primary rounded-md transition-all duration-200 text-base"
              onClick={handleDrawerClose}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-8 px-4">
            <Link to="/contact" className="primary-button w-full block text-center py-3 text-base" onClick={handleDrawerClose}>
              获取报价
            </Link>
          </div>
        </nav>
      </Drawer>
    </header>
  )
}

export default Header
