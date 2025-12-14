import { useEffect, useMemo, useState } from 'react'

export function useIsMobile(maxWidth = 768) {
  const query = useMemo(() => `(max-width: ${maxWidth}px)`, [maxWidth])

  const getMatches = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }

  const [isMobile, setIsMobile] = useState<boolean>(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(query)
    const onChange = () => setIsMobile(mql.matches)

    onChange()

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }

    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [query])

  return isMobile
}

