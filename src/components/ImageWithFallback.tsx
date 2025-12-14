import React, { useEffect, useState } from 'react'

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
  fallback?: string
}

export default function ImageWithFallback({
  src,
  fallback = '/assets/placeholder-card.webp',
  onError,
  loading,
  decoding,
  ...rest
}: Props) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const finalSrc = !src || hasError ? fallback : src

  return (
    <img
      {...rest}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      src={finalSrc}
      onError={(event) => {
        setHasError(true)
        onError?.(event)
      }}
    />
  )
}
