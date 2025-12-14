import { Card, List, Skeleton } from 'antd'

type Props = {
  variant?: 'list' | 'cards' | 'detail'
  count?: number
  className?: string
}

export default function PageSkeleton({ variant = 'detail', count = 6, className }: Props) {
  if (variant === 'list') {
    return (
      <div className={className || 'bg-white rounded-lg shadow-md overflow-hidden'}>
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: count })}
          renderItem={(_, index) => (
            <List.Item className="px-4 py-4" key={index}>
              <Skeleton active avatar={{ shape: 'square', size: 80 }} title paragraph={{ rows: 2 }} />
            </List.Item>
          )}
        />
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={className || 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} loading className="h-full" />
        ))}
      </div>
    )
  }

  return (
    <Card variant="borderless" className={className || 'shadow-lg'}>
      <Skeleton active title paragraph={{ rows: 10 }} />
    </Card>
  )
}
