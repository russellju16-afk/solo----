import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-light">
      <Header />
      <main className="bg-white">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout