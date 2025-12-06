import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home/index'
import ProductsList from './pages/Products/List/index'
import ProductDetail from './pages/Products/Detail/index'
import Solutions from './pages/Solutions/index'
import Service from './pages/Service/index'
import Cases from './pages/Cases/index'
import News from './pages/News/index'
import About from './pages/About/index'
import Contact from './pages/Contact/index'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/service" element={<Service />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </AppLayout>
  )
}

export default App