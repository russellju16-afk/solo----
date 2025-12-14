import { Image } from 'antd'
import type { ImageProps } from 'antd'

type Props = Omit<ImageProps, 'src' | 'fallback'> & {
  src?: string | null
  fallbackSrc?: string
}

export default function ImageWithFallback({
  src,
  fallbackSrc = '/assets/placeholder-card.webp',
  ...rest
}: Props) {
  const finalSrc = src || fallbackSrc
  return <Image {...rest} src={finalSrc} fallback={fallbackSrc} />
}
