import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Typography, Button, Space, Tag, Spin, Result, List } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import { fetchSolutionDetail } from '@/services/content'
import type { Solution } from '@/types/content'
import ImageWithFallback from '@/components/ImageWithFallback'

const { Title, Paragraph, Text } = Typography

function toTextList(value?: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean)
  return String(value)
    .split(/[\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function SolutionDetail() {
  const { id } = useParams<{ id: string }>()
  const solutionId = Number(id)

  const [solution, setSolution] = useState<Solution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const painPoints = useMemo(() => toTextList(solution?.pain_points), [solution?.pain_points])
  const solutions = useMemo(() => toTextList(solution?.solutions), [solution?.solutions])

  useEffect(() => {
    if (!solutionId) {
      setError('未找到对应的解决方案')
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    fetchSolutionDetail(solutionId, { signal: controller.signal })
      .then((data) => {
        setSolution(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const status = (err as { response?: { status?: number } })?.response?.status
        setError(status === 404 ? '解决方案不存在或已删除' : '获取解决方案详情失败')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [solutionId])

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Spin spinning tip="加载中...">
            <div className="min-h-[240px]" />
          </Spin>
        </div>
      </div>
    )
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Result
            status="404"
            title="未找到内容"
            subTitle={error || '内容不存在'}
            extra={
              <Link to="/solutions">
                <Button type="primary">返回解决方案列表</Button>
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
        <title>{solution.title} - 解决方案 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content={(solution.intro || '').slice(0, 120)} />
        <meta name="keywords" content={`${solution.title}, ${solution.channel_type || ''}, 西安超群粮油, 解决方案`} />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/solutions">
            <Button type="link" icon={<ArrowLeftOutlined />} className="text-gray-700">
              返回解决方案列表
            </Button>
          </Link>
        </div>

        <Card variant="borderless" className="shadow-lg">
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <div>
              <Title level={2} className="mb-2">
                {solution.title}
              </Title>
              <Space size={10} wrap>
                {solution.channel_type ? <Tag color="blue">{solution.channel_type}</Tag> : null}
                {solution.enabled === 0 ? <Tag>未启用</Tag> : null}
                <Text type="secondary">排序：{solution.sort_order ?? '-'}</Text>
              </Space>
            </div>

            <ImageWithFallback
              src={solution.cover_image}
              fallback="/assets/placeholder-banner.webp"
              alt={solution.title}
              className="w-full max-h-[420px] object-cover rounded-lg bg-gray-50"
            />

            {solution.intro ? (
              <div>
                <Title level={4} className="mb-2">
                  方案简介
                </Title>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{solution.intro}</Paragraph>
              </div>
            ) : null}

            {painPoints.length > 0 ? (
              <div>
                <Title level={4} className="mb-2">
                  常见痛点
                </Title>
                <List
                  dataSource={painPoints}
                  renderItem={(item) => (
                    <List.Item className="py-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-3 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </List.Item>
                  )}
                />
              </div>
            ) : null}

            {solutions.length > 0 ? (
              <div>
                <Title level={4} className="mb-2">
                  方案要点
                </Title>
                <List
                  dataSource={solutions}
                  renderItem={(item) => (
                    <List.Item className="py-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-3 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </List.Item>
                  )}
                />
              </div>
            ) : null}

            <div className="bg-gray-50 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <Title level={4} className="mb-1">
                  需要进一步定制方案？
                </Title>
                <Text type="secondary">留下需求，我们会在工作日尽快联系您。</Text>
              </div>
              <Link to="/contact#quote">
                <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                  获取报价
                </Button>
              </Link>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}
