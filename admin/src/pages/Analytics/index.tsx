import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Col, DatePicker, Progress, Row, Segmented, Space, Statistic, Table, Typography, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { getAnalyticsOverview } from '../../services/analytics'
import './index.css'

const { Title, Paragraph, Text } = Typography
const { RangePicker } = DatePicker

type RangePreset = 'today' | '7d' | '30d' | 'custom'

const computePresetRange = (preset: RangePreset): [Dayjs, Dayjs] => {
  const today = dayjs().startOf('day')
  if (preset === 'today') return [today, today]
  if (preset === '7d') return [today.subtract(6, 'day'), today]
  if (preset === '30d') return [today.subtract(29, 'day'), today]
  return [today, today]
}

const Analytics: React.FC = () => {
  const fallbackFunnel = useMemo(
    () => [
      { stage: '产品浏览', value: 1280 },
      { stage: '筛选/搜索', value: 860 },
      { stage: '添加对比', value: 320 },
      { stage: '提交询价', value: 140 },
      { stage: '销售跟进', value: 88 },
    ],
    [],
  )

  const fallbackChannels = useMemo(
    () => [
      { channel: '电话直拨', count: 52, rate: 37 },
      { channel: '微信', count: 28, rate: 20 },
      { channel: '表单提交', count: 44, rate: 31 },
      { channel: '邮件', count: 16, rate: 12 },
    ],
    [],
  )

  const fallbackTopFilters = useMemo(
    () => [
      { name: '大米 + 25kg', usage: 192 },
      { name: '小麦粉 + 散装', usage: 148 },
      { name: '非转基因 + 食用油', usage: 116 },
    ],
    [],
  )

  const [rangePreset, setRangePreset] = useState<RangePreset>('7d')
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [lastUpdated, setLastUpdated] = useState(() => dayjs().format('YYYY-MM-DD HH:mm'))
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<any | null>(null)
  const warnedRef = useRef(false)

  const rangeValue = useMemo<[Dayjs, Dayjs]>(() => {
    if (rangePreset !== 'custom') return computePresetRange(rangePreset)
    const [from, to] = customRange
    if (from && to) return [from.startOf('day'), to.startOf('day')]
    return computePresetRange('7d')
  }, [customRange, rangePreset])

  const rangeText = useMemo(() => {
    const [from, to] = rangeValue
    return `${from.format('YYYY-MM-DD')} ~ ${to.format('YYYY-MM-DD')}`
  }, [rangeValue])

  const rangeQuery = useMemo(() => {
    const [from, to] = rangeValue
    return { startAt: from.format('YYYY-MM-DD'), endAt: to.format('YYYY-MM-DD') }
  }, [rangeValue])

  const handlePresetChange = (value: string | number) => {
    const nextPreset: RangePreset = value as RangePreset
    setRangePreset(nextPreset)
    if (nextPreset !== 'custom') {
      setCustomRange([null, null])
    }
    setLastUpdated(dayjs().format('YYYY-MM-DD HH:mm'))
  }

  const handleCustomRangeChange = (value: [Dayjs | null, Dayjs | null] | null) => {
    setCustomRange(value ?? [null, null])
    setLastUpdated(dayjs().format('YYYY-MM-DD HH:mm'))
  }

  useEffect(() => {
    let cancelled = false

    const fetchOverview = async () => {
      setLoading(true)
      try {
        const res: any = await getAnalyticsOverview(rangeQuery)
        if (cancelled) return
        setOverview(res)
        setLastUpdated(dayjs(res?.updatedAt || new Date()).format('YYYY-MM-DD HH:mm'))
      } catch (err) {
        if (cancelled) return
        setOverview(null)
        setLastUpdated(dayjs().format('YYYY-MM-DD HH:mm'))
        if (!warnedRef.current) {
          warnedRef.current = true
          message.warning('数据看板加载失败，已展示演示数据')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOverview()
    return () => {
      cancelled = true
    }
  }, [rangeQuery])

  const kpis = overview?.kpis || {
    views: 1280,
    searches: 860,
    compares: 320,
    quoteLeads: 140,
    signalClicks: 96,
    quoteConversionRate: 10.9,
  }

  const funnel = useMemo(() => {
    if (Array.isArray(overview?.funnel) && overview.funnel.length > 0) return overview.funnel
    const base = fallbackFunnel[0]?.value || 0
    return fallbackFunnel.map((item, index) => ({
      ...item,
      percent: index === 0 ? (base > 0 ? 100 : 0) : base > 0 ? Math.round((item.value / base) * 100) : 0,
    }))
  }, [fallbackFunnel, overview])

  const channels = Array.isArray(overview?.channels) && overview.channels.length > 0 ? overview.channels : fallbackChannels
  const topFilters = Array.isArray(overview?.topFilters) && overview.topFilters.length > 0 ? overview.topFilters : fallbackTopFilters

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="analytics-title-block">
          <Title level={2} className="analytics-title">
            数据看板
          </Title>
          <Paragraph className="analytics-subtitle">
            用于分析官网访问与线索转化（已接入埋点/接口，异常时展示演示数据）
          </Paragraph>
          <Text type="secondary" className="analytics-metric-note">
            口径：浏览=PV，筛选=筛选动作次数，对比=加入对比次数，询价转化率=提交询价/浏览
          </Text>
        </div>

        <div className="analytics-controls">
          <Space direction="vertical" size={8}>
            <Space wrap size={10} className="analytics-controls-row">
              <Text type="secondary">时间范围</Text>
              <Segmented
                value={rangePreset}
                options={[
                  { label: '今天', value: 'today' },
                  { label: '7天', value: '7d' },
                  { label: '30天', value: '30d' },
                  { label: '自定义', value: 'custom' },
                ]}
                onChange={handlePresetChange}
              />
              {rangePreset === 'custom' ? (
                <RangePicker
                  value={customRange}
                  onChange={handleCustomRangeChange}
                  allowClear
                  placeholder={['开始日期', '结束日期']}
                />
              ) : null}
            </Space>
            <div className="analytics-meta">
              <Text type="secondary">统计范围：{rangeText}</Text>
              <Text type="secondary">最后更新时间：{lastUpdated}</Text>
              <Text type="secondary">强意向行为数：{typeof kpis.signalClicks === 'number' ? kpis.signalClicks : '--'}</Text>
            </div>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} className="analytics-kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false} loading={loading}>
            <Statistic title="浏览（PV）" value={kpis.views} suffix="次" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false} loading={loading}>
            <Statistic title="筛选/搜索" value={kpis.searches} suffix="次" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false} loading={loading}>
            <Statistic title="对比次数" value={kpis.compares} suffix="次" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false} loading={loading}>
            <Statistic title="询价转化率" value={kpis.quoteConversionRate} suffix="%" precision={2} valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <div className="analytics-sections">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="漏斗表现" bordered={false} loading={loading}>
              <div className="analytics-funnel-list">
                {funnel.map((item: any) => {
                  const percent = Number.isFinite(item.percent) ? item.percent : 0
                  return (
                    <div key={item.stage} className="analytics-funnel-item">
                      <div className="analytics-funnel-meta">
                        <span className="analytics-funnel-stage">{item.stage}</span>
                        <span className="analytics-funnel-value">
                          {item.value}（{percent}%）
                        </span>
                      </div>
                      <Progress percent={percent} showInfo={false} strokeColor="#1677ff" />
                    </div>
                  )
                })}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="线索来源分布" bordered={false}>
              <Table
                columns={[
                  { title: '渠道', dataIndex: 'channel', key: 'channel' },
                  { title: '数量', dataIndex: 'count', key: 'count', width: 120 },
                  {
                    title: '占比',
                    dataIndex: 'rate',
                    key: 'rate',
                    width: 120,
                    render: (value: number) => `${Number.isFinite(value) ? value : 0}%`,
                  },
                ]}
                dataSource={channels}
                pagination={false}
                size="small"
                rowKey="channel"
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="热门筛选组合" bordered={false}>
              <Table
                columns={[
                  { title: '预设', dataIndex: 'name', key: 'name' },
                  { title: '使用次数', dataIndex: 'usage', key: 'usage', width: 140 },
                ]}
                dataSource={topFilters}
                pagination={false}
                size="small"
                rowKey="name"
                loading={loading}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="渠道服务水平" bordered={false} loading={loading}>
              <div className="analytics-service-list">
                <div className="analytics-service-item">
                  <div className="analytics-service-meta">
                    <span>电话响应</span>
                    <span>92%</span>
                  </div>
                  <Progress percent={92} status="active" />
                </div>
                <div className="analytics-service-item">
                  <div className="analytics-service-meta">
                    <span>微信转化</span>
                    <span>68%</span>
                  </div>
                  <Progress percent={68} status="active" strokeColor="#52c41a" />
                </div>
                <div className="analytics-service-item">
                  <div className="analytics-service-meta">
                    <span>表单跟进</span>
                    <span>74%</span>
                  </div>
                  <Progress percent={74} status="active" strokeColor="#faad14" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Analytics
