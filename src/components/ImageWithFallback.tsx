import React, { useEffect, useState } from 'react'

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
  fallback?: string
}

export default function ImageWithFallback({
  src,
  fallback = '/assets/placeholder-card.webp',
  onError,
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
      src={finalSrc}
      onError={(event) => {
        setHasError(true)
        onError?.(event)
      }}
    />
  )
}

