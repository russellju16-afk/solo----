import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Typography, Row, Col, Button, Pagination, Select, List, Space, Tag, Skeleton } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useIsMobile } from '@/hooks/useIsMobile'
import { fetchCases } from '@/services/content'
import type { CaseItem } from '@/types/content'
import ImageWithFallback from '@/components/ImageWithFallback'
import EmptyState from '@/components/EmptyState'

const { Title, Paragraph } = Typography
const { Meta } = Card
const { Option } = Select

const DEFAULT_INDUSTRY_TYPES = ['高校', '团餐', '商超', '食品加工', '其他']

function getSnippet(summary?: string, detail?: string, maxLen = 72) {
  const text = (summary || detail || '').replace(/\s+/g, ' ').trim()
  if (!text) return '暂无摘要'
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
}

const Cases: React.FC = () => {
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<CaseItem[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [industryType, setIndustryType] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const industryOptions = useMemo(() => {
    const set = new Set<string>(DEFAULT_INDUSTRY_TYPES)
    rows.forEach((item) => item.industry_type && set.add(item.industry_type))
    return Array.from(set)
  }, [rows])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    fetchCases(
      {
        page: currentPage,
        pageSize,
        industry_type: industryType,
      },
      { signal: controller.signal },
    )
      .then((resp) => {
        const nextRows = resp?.data || []
        setTotal(resp?.total || 0)
        setRows((prev) => (isMobile && currentPage > 1 ? [...prev, ...nextRows] : nextRows))
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setTotal(0)
        setRows((prev) => (isMobile && currentPage > 1 ? prev : []))
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [currentPage, industryType, isMobile, pageSize])

  const hasMore = rows.length < total

  return (
    <div className="min-h-screen py-8 md:py-12">
      <Helmet>
        <title>成功案例 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司成功案例展示，覆盖高校、团餐、商超等行业应用场景。" />
        <meta name="keywords" content="西安超群粮油, 成功案例, 粮油供应, 团餐, 商超, 高校" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-10 md:mb-16 text-center">
          <Title level={2}>成功案例</Title>
          <Paragraph className="max-w-3xl mx-auto">我们为多个行业提供优质的粮油服务，积累了丰富的经验和成功案例。</Paragraph>
        </div>

        <div className="mb-8 md:mb-12 flex justify-center">
          <Select
            placeholder="选择行业类型"
            style={{ width: isMobile ? '100%' : 200, maxWidth: 320 }}
            value={industryType}
            onChange={(value) => {
              setIndustryType(value)
              setCurrentPage(1)
              if (isMobile) setRows([])
            }}
            allowClear
          >
            {industryOptions.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </div>

        {loading && rows.length === 0 ? (
          isMobile ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <List
                itemLayout="horizontal"
                dataSource={Array.from({ length: Math.min(pageSize, 6) })}
                renderItem={(_, index) => (
                  <List.Item className="px-4 py-4" key={index}>
                    <Skeleton active avatar={{ shape: 'square', size: 80 }} title paragraph={{ rows: 2 }} />
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {Array.from({ length: pageSize }).map((_, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <Card loading className="h-full" />
                </Col>
              ))}
            </Row>
          )
        ) : rows.length === 0 ? (
          <EmptyState
            title="暂无案例"
            description="还没有发布案例内容，您可以先浏览产品或联系我们获取报价。"
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
              renderItem={(caseItem) => (
                <List.Item className="px-4 py-4">
                  <Link to={`/cases/${caseItem.id}`} className="flex gap-4 w-full">
                    <ImageWithFallback
                      src={caseItem.cover_image}
                      alt={caseItem.customer_name}
                      fallback="/assets/placeholder-card.webp"
                      className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 cq-clamp-2">{caseItem.customer_name}</div>
                      <div className="text-sm text-gray-600 mt-1 cq-clamp-2">{getSnippet(caseItem.summary, caseItem.detail, 56)}</div>
                      <Space size={6} wrap className="mt-2">
                        <Tag color="blue">{caseItem.industry_type}</Tag>
                        {caseItem.published_at ? (
                          <Tag icon={<CalendarOutlined />}>{new Date(caseItem.published_at).toLocaleDateString()}</Tag>
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
            {rows.map((caseItem) => (
              <Col key={caseItem.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  className="h-full transition-all hover:shadow-xl"
                  cover={
                    <div className="h-[200px] overflow-hidden bg-gray-50">
                      <ImageWithFallback
                        alt={caseItem.customer_name}
                        src={caseItem.cover_image}
                        fallback="/assets/placeholder-card.webp"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  }
                  actions={[
                    <Link to={`/cases/${caseItem.id}`} key="detail">
                      <Button type="link" icon={<ArrowRightOutlined />} className="p-0">
                        查看详情
                      </Button>
                    </Link>,
                  ]}
                >
                  <Meta
                    title={caseItem.customer_name}
                    description={
                      <div className="space-y-3">
                        <Paragraph ellipsis={{ rows: 2 }}>{getSnippet(caseItem.summary, caseItem.detail, 96)}</Paragraph>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <CheckCircleOutlined className="text-blue-600 mr-1 text-xs" />
                            <span>{caseItem.industry_type}</span>
                          </div>
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <CheckCircleOutlined className="text-blue-600 mr-1 text-xs" />
                            <span>{caseItem.published_at ? new Date(caseItem.published_at).toLocaleDateString() : '-'}</span>
                          </div>
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

        <section className="py-16 mt-20 bg-blue-600 text-white rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <Title level={3} className="mb-6 text-white">
              想成为我们的下一个成功案例吗？
            </Title>
            <Paragraph className="max-w-2xl mx-auto mb-8 text-white/90">我们拥有丰富的经验和专业的团队，可以为您提供优质的粮油服务。</Paragraph>
            <Link to="/contact">
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} className="bg-white text-blue-600 hover:bg-gray-100">
                联系我们
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Cases

