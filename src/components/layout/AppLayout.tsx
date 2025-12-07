import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { CompanyInfoProvider } from '@/hooks/useCompanyInfo'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <CompanyInfoProvider>
      <div className="min-h-screen bg-light">
        <Header />
        <main className="bg-white">
          {children}
        </main>
        <Footer />
      </div>
    </CompanyInfoProvider>
  )
}

export default AppLayout