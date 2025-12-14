import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Typography, Button, Space, Tag, Spin, Result } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import { fetchCaseDetail } from '@/services/content'
import type { CaseItem } from '@/types/content'
import ImageWithFallback from '@/components/ImageWithFallback'

const { Title, Paragraph, Text } = Typography

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const caseId = Number(id)

  const [caseItem, setCaseItem] = useState<CaseItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) {
      setError('未找到对应的案例')
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    fetchCaseDetail(caseId, { signal: controller.signal })
      .then((data) => {
        setCaseItem(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const responseStatus = (err as { response?: { status?: number } })?.response?.status
        setError(responseStatus === 404 ? '案例不存在或已删除' : '获取案例详情失败')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [caseId])

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Spin spinning tip="加载中..." />
        </div>
      </div>
    )
  }

  if (error || !caseItem) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Result
            status="404"
            title="未找到内容"
            subTitle={error || '内容不存在'}
            extra={
              <Link to="/cases">
                <Button type="primary">返回案例列表</Button>
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
        <title>{caseItem.customer_name} - 成功案例 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content={(caseItem.summary || caseItem.detail || '').slice(0, 120)} />
        <meta name="keywords" content={`${caseItem.customer_name}, ${caseItem.industry_type}, 西安超群粮油, 成功案例`} />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/cases">
            <Button type="link" icon={<ArrowLeftOutlined />} className="text-gray-700">
              返回案例列表
            </Button>
          </Link>
        </div>

        <Card variant="borderless" className="shadow-lg">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Title level={2} className="mb-2">
                {caseItem.customer_name}
              </Title>
              <Space size={10} wrap>
                <Tag color="blue">{caseItem.industry_type}</Tag>
                {caseItem.published_at ? (
                  <Tag icon={<CalendarOutlined />}>{new Date(caseItem.published_at).toLocaleString()}</Tag>
                ) : (
                  <Text type="secondary">未设置发布时间</Text>
                )}
              </Space>
            </div>

            <ImageWithFallback
              src={caseItem.cover_image}
              fallback="/assets/placeholder-banner.webp"
              alt={caseItem.customer_name}
              className="w-full max-h-[420px] object-cover rounded-lg bg-gray-50"
            />

            {caseItem.summary ? (
              <div>
                <Title level={4} className="mb-2">
                  摘要
                </Title>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{caseItem.summary}</Paragraph>
              </div>
            ) : null}

            <div>
              <Title level={4} className="mb-2">
                详情
              </Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{caseItem.detail || '暂无内容'}</Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default CaseDetail
