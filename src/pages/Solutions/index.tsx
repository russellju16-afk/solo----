import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Typography, Row, Col, Button, Pagination, Select, Space, Tag } from 'antd'
import {
  ArrowRightOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  SafetyOutlined,
  TruckOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchSolutions } from '@/services/content'
import type { Solution } from '@/types/content'
import { useIsMobile } from '@/hooks/useIsMobile'
import PageEmpty from '@/components/PageEmpty'
import PageSkeleton from '@/components/PageSkeleton'
import ImageWithFallback from '@/components/ImageWithFallback'
import ErrorState from '@/components/ErrorState'

const { Title, Paragraph } = Typography
const { Meta } = Card
const { Option } = Select

const CHANNEL_OPTIONS = [
  { label: '粮油贸易解决方案', value: 'grain_trade', icon: <ShoppingCartOutlined className="text-4xl text-blue-600" /> },
  { label: '物流配送解决方案', value: 'logistics', icon: <TruckOutlined className="text-4xl text-green-600" /> },
  { label: '仓储管理解决方案', value: 'warehousing', icon: <BarChartOutlined className="text-4xl text-orange-600" /> },
  { label: '供应链金融解决方案', value: 'finance', icon: <SafetyOutlined className="text-4xl text-purple-600" /> },
  { label: '其他解决方案', value: 'other', icon: <AppstoreOutlined className="text-4xl text-slate-600" /> },
]

function getBulletList(solution: Solution) {
  if (Array.isArray(solution.solutions) && solution.solutions.length > 0) {
    return solution.solutions.slice(0, 4)
  }
  if (Array.isArray(solution.pain_points) && solution.pain_points.length > 0) {
    return solution.pain_points.slice(0, 4)
  }
  return []
}

const Solutions: React.FC = () => {
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<Solution[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [channelType, setChannelType] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadSeq, setReloadSeq] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const channelOptions = useMemo(() => {
    const set = new Set(CHANNEL_OPTIONS.map((opt) => opt.value))
    rows.forEach((item) => item.channel_type && set.add(item.channel_type))
    const base = CHANNEL_OPTIONS.map((opt) => opt.value)
    const extra = Array.from(set).filter((v) => !base.includes(v))
    return [...CHANNEL_OPTIONS, ...extra.map((v) => ({ label: v, value: v, icon: <AppstoreOutlined className="text-4xl text-slate-600" /> }))]
  }, [rows])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setLoadError(null)
    fetchSolutions(
      {
        page: currentPage,
        pageSize,
        channel_type: channelType,
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
        setLoadError('获取解决方案列表失败，请稍后重试')
        setTotal(0)
        setRows((prev) => (isMobile && currentPage > 1 ? prev : []))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [channelType, currentPage, isMobile, pageSize, reloadSeq])

  const hasMore = rows.length < total

  return (
    <div className="min-h-screen py-12">
      <Helmet>
        <title>解决方案 - 西安超群粮油贸易有限公司</title>
        <meta
          name="description"
          content="西安超群粮油贸易有限公司提供粮油贸易、物流配送、仓储管理等解决方案，为企业客户提供稳定可靠的供应服务。"
        />
        <meta name="keywords" content="西安超群粮油, 粮油解决方案, 粮油贸易, 物流配送, 仓储管理" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-12 md:mb-16 text-center">
          <Title level={2}>解决方案</Title>
          <Paragraph className="max-w-3xl mx-auto">
            我们提供面向不同场景的粮油贸易解决方案，从供应、仓储到配送，满足您的不同需求。
          </Paragraph>
        </div>

        <div className="mb-8 md:mb-12 flex justify-center">
          <Select
            placeholder="选择渠道类型"
            style={{ width: isMobile ? '100%' : 240, maxWidth: 320 }}
            value={channelType}
            onChange={(value) => {
              setChannelType(value)
              setCurrentPage(1)
              if (isMobile) setRows([])
            }}
            allowClear
          >
            {channelOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </div>

        {loading && rows.length === 0 ? (
          <PageSkeleton variant="cards" count={pageSize} className="grid grid-cols-1 md:grid-cols-2 gap-6" />
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
            title="暂无解决方案"
            description="还没有配置解决方案内容，您可以先联系我们获取定制方案。"
            actions={
              <Space>
                <Link to="/contact#quote">
                  <Button type="primary">获取报价</Button>
                </Link>
              </Space>
            }
          />
        ) : (
          <Row gutter={[24, 24]}>
            {rows.map((solution) => {
              const option = channelOptions.find((item) => item.value === solution.channel_type)
              const bullets = getBulletList(solution)
              return (
                <Col key={solution.id} xs={24} md={12}>
                  <Card
                    hoverable
                    className="h-full transition-all hover:shadow-xl"
                    cover={
                      solution.cover_image ? (
                        <ImageWithFallback
                          src={solution.cover_image}
                          fallback="/assets/placeholder-card.webp"
                          alt={solution.title}
                          className="h-[200px] w-full object-cover"
                        />
                      ) : (
                        <div className="h-[200px] bg-gray-50 flex items-center justify-center">{option?.icon}</div>
                      )
                    }
                  >
                    <Meta
                      title={
                        <Space size={10} wrap>
                          <span>{solution.title}</span>
                          {solution.channel_type ? <Tag>{solution.channel_type}</Tag> : null}
                        </Space>
                      }
                      description={
                        <div className="space-y-4">
                          <Paragraph ellipsis={{ rows: 2 }}>{solution.intro || '（暂无简介）'}</Paragraph>
                          {bullets.length > 0 ? (
                            <ul className="space-y-2">
                              {bullets.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-2 mr-2 flex-shrink-0"></span>
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Paragraph type="secondary" className="mb-0">
                              暂无要点内容，请在后台完善该解决方案详情。
                            </Paragraph>
                          )}
                          <Space size={12} wrap>
                            <Link to={`/solutions/${solution.id}`}>
                              <Button type="link" icon={<ArrowRightOutlined />} className="p-0">
                                查看详情
                              </Button>
                            </Link>
                            <Link to="/contact#quote">
                              <Button type="link" className="p-0">
                                获取报价
                              </Button>
                            </Link>
                          </Space>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              )
            })}
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
              />
            )}
          </div>
        )}

        <section className="py-16 mt-20 text-center">
          <Title level={3} className="mb-6">
            需要定制解决方案？
          </Title>
          <Paragraph className="max-w-2xl mx-auto mb-8">我们可以根据您的具体需求，为您定制专属的粮油贸易解决方案。</Paragraph>
          <Link to="/contact">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} className="bg-blue-600 hover:bg-blue-700">
              联系我们
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}

export default Solutions
