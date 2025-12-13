import React, { useMemo, useState } from 'react'
import { Card, Col, DatePicker, Progress, Row, Segmented, Space, Statistic, Table, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
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
  const funnelData = useMemo(
    () => [
      { stage: '产品浏览', value: 1280 },
      { stage: '筛选/搜索', value: 860 },
      { stage: '添加对比', value: 320 },
      { stage: '提交询价', value: 140 },
      { stage: '销售跟进', value: 88 },
    ],
    [],
  )

  const channelData = useMemo(
    () => [
      { key: 'tel', channel: '电话直拨', leads: 52, rate: '37%' },
      { key: 'wechat', channel: '微信', leads: 28, rate: '20%' },
      { key: 'form', channel: '表单提交', leads: 44, rate: '31%' },
      { key: 'email', channel: '邮件', leads: 16, rate: '12%' },
    ],
    [],
  )

  const topFilters = useMemo(
    () => [
      { key: 1, name: '大米 + 25kg', usage: 192 },
      { key: 2, name: '小麦粉 + 散装', usage: 148 },
      { key: 3, name: '非转基因 + 食用油', usage: 116 },
    ],
    [],
  )

  const [rangePreset, setRangePreset] = useState<RangePreset>('7d')
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [lastUpdated, setLastUpdated] = useState(() => dayjs().format('YYYY-MM-DD HH:mm'))

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

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="analytics-title-block">
          <Title level={2} className="analytics-title">
            数据看板
          </Title>
          <Paragraph className="analytics-subtitle">
            用于分析官网访问与线索转化（当前为演示数据，后续接入埋点/接口）
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
            </div>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} className="analytics-kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false}>
            <Statistic title="浏览（PV）" value={1280} suffix="次" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false}>
            <Statistic title="筛选动作" value={860} suffix="次" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false}>
            <Statistic title="对比次数" value={320} suffix="次" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="analytics-kpi-card" bordered={false}>
            <Statistic title="询价转化率" value={10.9} suffix="%" precision={1} valueStyle={{ fontSize: 28, fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <div className="analytics-sections">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="漏斗表现" bordered={false}>
              <div className="analytics-funnel-list">
                {funnelData.map((item, index) => {
                  const percent =
                    index === 0 ? 100 : Math.round((item.value / funnelData[0].value) * 100)
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
                  { title: '线索数', dataIndex: 'leads', key: 'leads', width: 120 },
                  { title: '占比', dataIndex: 'rate', key: 'rate', width: 120 },
                ]}
                dataSource={channelData}
                pagination={false}
                size="small"
                rowKey="key"
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
                rowKey="key"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="渠道服务水平" bordered={false}>
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

