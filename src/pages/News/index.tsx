import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Typography, Row, Col, Button, Pagination, Select, List, Space, Tag } from 'antd'
import { ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useIsMobile } from '@/hooks/useIsMobile'
import { fetchNews } from '@/services/content'
import type { NewsItem } from '@/types/content'
import ImageWithFallback from '@/components/ImageWithFallback'
import PageEmpty from '@/components/PageEmpty'
import PageSkeleton from '@/components/PageSkeleton'
import ErrorState from '@/components/ErrorState'

const { Title, Paragraph, Text } = Typography
const { Meta } = Card
const { Option } = Select

const DEFAULT_CATEGORIES = ['公司新闻', '行业资讯', '行情分析']

function getSnippet(content?: string, maxLen = 72) {
  const text = (content || '').replace(/\s+/g, ' ').trim()
  if (!text) return '暂无摘要'
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
}

const News: React.FC = () => {
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [category, setCategory] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadSeq, setReloadSeq] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES)
    rows.forEach((item) => item.category && set.add(item.category))
    return Array.from(set)
  }, [rows])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setLoadError(null)
    fetchNews(
      {
        page: currentPage,
        pageSize,
        category,
      },
      { signal: controller.signal },
    )
      .then((resp) => {
        const nextRows = resp?.data || []
        setTotal(resp?.total || 0)
        setRows((prev) => (isMobile && currentPage > 1 ? [...prev, ...nextRows] : nextRows))
        setLoadError(null)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setLoadError('获取新闻列表失败，请稍后重试')
        setTotal(0)
        setRows((prev) => (isMobile && currentPage > 1 ? prev : []))
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [category, currentPage, isMobile, pageSize, reloadSeq])

  const hasMore = rows.length < total

  return (
    <div className="min-h-screen py-8 md:py-12">
      <Helmet>
        <title>新闻资讯 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司新闻资讯，包括公司新闻、行业资讯与行情分析。" />
        <meta name="keywords" content="西安超群粮油, 新闻资讯, 公司新闻, 行业资讯, 行情分析" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-10 md:mb-16 text-center">
          <Title level={2}>新闻资讯</Title>
          <Paragraph className="max-w-3xl mx-auto">为您提供最新的公司动态、行业资讯与行情分析。</Paragraph>
        </div>

        <div className="mb-8 md:mb-12 flex justify-center">
          <Select
            placeholder="选择新闻类别"
            style={{ width: isMobile ? '100%' : 200, maxWidth: 320 }}
            value={category}
            onChange={(value) => {
              setCategory(value)
              setCurrentPage(1)
              if (isMobile) setRows([])
            }}
            allowClear
          >
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </div>

        {loading && rows.length === 0 ? (
          isMobile ? (
            <PageSkeleton variant="list" count={Math.min(pageSize, 6)} />
          ) : (
            <PageSkeleton variant="cards" count={pageSize} />
          )
        ) : rows.length === 0 && loadError ? (
          <ErrorState
            description={loadError}
            onRetry={() => setReloadSeq((v) => v + 1)}
            extraActions={
              <Link to="/contact#quote">
                <Button>获取报价</Button>
              </Link>
            }
          />
        ) : rows.length === 0 ? (
          <PageEmpty
            title="暂无新闻"
            description="还没有发布新闻内容，您可以先浏览产品或联系我们获取报价。"
            actions={
              <Space>
                <Link to="/products">
                  <Button>去产品中心</Button>
                </Link>
                <Link to="/contact#quote">
                  <Button type="primary">获取报价</Button>
                </Link>
              </Space>
            }
          />
        ) : isMobile ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <List
              itemLayout="horizontal"
              dataSource={rows}
              renderItem={(newsItem) => (
                <List.Item className="px-4 py-4">
                  <Link to={`/news/${newsItem.id}`} className="flex gap-4 w-full">
                    <ImageWithFallback
                      src={newsItem.cover_image}
                      alt={newsItem.title}
                      fallback="/assets/placeholder-card.webp"
                      className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 cq-clamp-2">{newsItem.title}</div>
                      <div className="text-sm text-gray-600 mt-1 cq-clamp-2">{getSnippet(newsItem.content, 56)}</div>
                      <Space size={6} wrap className="mt-2">
                        <Tag color="blue">{newsItem.category}</Tag>
                        {newsItem.published_at ? (
                          <Tag icon={<CalendarOutlined />}>{new Date(newsItem.published_at).toLocaleDateString()}</Tag>
                        ) : null}
                      </Space>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {rows.map((newsItem) => (
              <Col key={newsItem.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  className="h-full transition-all hover:shadow-xl"
                  cover={
                    <div className="h-[200px] overflow-hidden bg-gray-50">
                      <ImageWithFallback
                        alt={newsItem.title}
                        src={newsItem.cover_image}
                        fallback="/assets/placeholder-card.webp"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  }
                  actions={[
                    <div className="flex items-center text-xs text-gray-500" key="date">
                      <CalendarOutlined className="mr-1" />
                      <span>{newsItem.published_at ? new Date(newsItem.published_at).toLocaleDateString() : '-'}</span>
                    </div>,
                    <Link to={`/news/${newsItem.id}`} key="detail">
                      <Button type="link" icon={<ArrowRightOutlined />} className="p-0">
                        查看详情
                      </Button>
                    </Link>,
                  ]}
                >
                  <Meta
                    title={newsItem.title}
                    description={
                      <div className="space-y-3">
                        <Paragraph ellipsis={{ rows: 2 }}>{getSnippet(newsItem.content, 96)}</Paragraph>
                        <div className="flex justify-between items-center">
                          <Text type="secondary" className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {newsItem.category}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {total > pageSize && (
          <div className="mt-10 md:mt-12 flex justify-center">
            {isMobile ? (
              <Button size="large" disabled={!hasMore} loading={loading && hasMore} onClick={() => setCurrentPage((p) => p + 1)}>
                {hasMore ? '加载更多' : '已加载全部'}
              </Button>
            ) : (
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={setCurrentPage}
                onShowSizeChange={(_, size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                showSizeChanger
                pageSizeOptions={['6', '12', '24']}
                showTotal={(t, range) => `第 ${range[0]}-${range[1]} 条，共 ${t} 条`}
              />
            )}
          </div>
        )}

        <section className="py-16 mt-20 bg-gray-50 rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <Title level={3} className="mb-6">
              订阅新闻
            </Title>
            <Paragraph className="max-w-2xl mx-auto mb-8">订阅我们的新闻资讯，及时获取最新的公司动态和行业信息。</Paragraph>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <input
                type="email"
                placeholder="请输入您的电子邮箱"
                className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow"
              />
              <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700">
                立即订阅
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default News
