import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Typography, Button, Space, Tag, Spin, Result } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import { fetchNewsDetail } from '@/services/content'
import type { NewsItem } from '@/types/content'
import ImageWithFallback from '@/components/ImageWithFallback'

const { Title, Paragraph, Text } = Typography

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const newsId = Number(id)

  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!newsId) {
      setError('未找到对应的新闻')
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    fetchNewsDetail(newsId, { signal: controller.signal })
      .then((data) => {
        setNews(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const responseStatus = (err as { response?: { status?: number } })?.response?.status
        setError(responseStatus === 404 ? '新闻不存在或已删除' : '获取新闻详情失败')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [newsId])

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Spin spinning tip="加载中..." />
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Result
            status="404"
            title="未找到内容"
            subTitle={error || '内容不存在'}
            extra={
              <Link to="/news">
                <Button type="primary">返回新闻列表</Button>
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <Helmet>
        <title>{news.title} - 新闻资讯 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content={(news.content || '').slice(0, 120)} />
        <meta name="keywords" content={`${news.title}, ${news.category}, 西安超群粮油, 新闻资讯`} />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/news">
            <Button type="link" icon={<ArrowLeftOutlined />} className="text-gray-700">
              返回新闻列表
            </Button>
          </Link>
        </div>

        <Card variant="borderless" className="shadow-lg">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Title level={2} className="mb-2">
                {news.title}
              </Title>
              <Space size={10} wrap>
                <Tag color="blue">{news.category}</Tag>
                {news.published_at ? (
                  <Tag icon={<CalendarOutlined />}>{new Date(news.published_at).toLocaleString()}</Tag>
                ) : (
                  <Text type="secondary">未设置发布时间</Text>
                )}
              </Space>
            </div>

            <ImageWithFallback
              src={news.cover_image}
              fallback="/assets/placeholder-banner.webp"
              alt={news.title}
              className="w-full max-h-[420px] object-cover rounded-lg bg-gray-50"
            />

            <div>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{news.content || '暂无内容'}</Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default NewsDetail
