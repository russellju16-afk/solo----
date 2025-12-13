import React from 'react'
import { fetchCompanyInfo } from '@/services/company'
import { CompanyInfo } from '@/types/company'

interface CompanyInfoContextValue {
  companyInfo: CompanyInfo | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const CompanyInfoContext = React.createContext<CompanyInfoContextValue | undefined>(undefined)

export const CompanyInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyInfo, setCompanyInfo] = React.useState<CompanyInfo | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<Error | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCompanyInfo()
      setCompanyInfo(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch company info'))
      setCompanyInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <CompanyInfoContext.Provider value={{ companyInfo, loading, error, refetch: load }}>
      {children}
    </CompanyInfoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompanyInfo = () => {
  const ctx = React.useContext(CompanyInfoContext)
  if (!ctx) {
    throw new Error('useCompanyInfo must be used within CompanyInfoProvider')
  }
  return ctx
}

