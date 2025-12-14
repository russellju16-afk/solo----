import React from 'react'
import EmptyState from './EmptyState'

export type PageEmptyProps = React.ComponentProps<typeof EmptyState>

export default function PageEmpty(props: PageEmptyProps) {
  return <EmptyState {...props} />
}

