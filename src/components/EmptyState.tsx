import React from 'react'
import { Empty } from 'antd'

type Props = {
  title?: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export default function EmptyState({ title = '暂无数据', description, actions, className }: Props) {
  return (
    <div className={className || 'text-center py-16 bg-white rounded-lg shadow-md'}>
      <Empty description={description || title} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      {actions ? <div className="mt-4 flex justify-center">{actions}</div> : null}
    </div>
  )
}

