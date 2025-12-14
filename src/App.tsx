import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import AppLayout from './components/layout/AppLayout'

import Home from './pages/Home/index'
const ProductsList = lazy(() => import('./pages/Products/List/index'))
const ProductDetail = lazy(() => import('./pages/Products/Detail/index'))
const Solutions = lazy(() => import('./pages/Solutions/index'))
const Service = lazy(() => import('./pages/Service/index'))
const Cases = lazy(() => import('./pages/Cases/index'))
const CaseDetail = lazy(() => import('./pages/Cases/Detail/index'))
const News = lazy(() => import('./pages/News/index'))
const NewsDetail = lazy(() => import('./pages/News/Detail/index'))
const About = lazy(() => import('./pages/About/index'))
const Contact = lazy(() => import('./pages/Contact/index'))

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-6 text-center text-gray-500">页面加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/service" element={<Service />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/analytics" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}

export default App
