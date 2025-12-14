import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { CompanyInfoProvider } from '@/hooks/useCompanyInfo'
import ContactWidget from '../ContactWidget'
import { useIsMobile } from '@/hooks/useIsMobile'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile()

  return (
    <CompanyInfoProvider>
      <div
        className="min-h-screen bg-light"
        style={isMobile ? { paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' } : undefined}
      >
        <Header />
        <main className="bg-white">
          {children}
        </main>
        <ContactWidget />
        <Footer />
      </div>
    </CompanyInfoProvider>
  )
}

export default AppLayout
