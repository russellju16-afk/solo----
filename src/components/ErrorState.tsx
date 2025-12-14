import React from 'react'
import { Button, Space } from 'antd'
import PageEmpty from './PageEmpty'

type Props = {
  title?: string
  description?: React.ReactNode
  onRetry?: () => void
  extraActions?: React.ReactNode
  className?: string
}

export default function ErrorState({
  title = '加载失败',
  description = '请求失败，请稍后重试',
  onRetry,
  extraActions,
  className,
}: Props) {
  const actions =
    onRetry || extraActions ? (
      <Space wrap>
        {onRetry ? (
          <Button type="primary" onClick={onRetry}>
            重试
          </Button>
        ) : null}
        {extraActions}
      </Space>
    ) : null

  return <PageEmpty title={title} description={description} actions={actions || undefined} className={className} />
}

