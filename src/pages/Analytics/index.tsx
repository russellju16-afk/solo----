import React, { useMemo } from 'react'
import { Card, Col, Progress, Row, Statistic, Table, Typography } from 'antd'
import { Helmet } from 'react-helmet-async'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const AnalyticsDashboard: React.FC = () => {
  const funnelData = useMemo(() => [
    { stage: '产品浏览', value: 1280 },
    { stage: '筛选/搜索', value: 860 },
    { stage: '添加对比', value: 320 },
    { stage: '提交询价', value: 140 },
    { stage: '销售跟进', value: 88 },
  ], [])

  const channelData = useMemo(() => [
    { key: 'tel', channel: '电话直拨', leads: 52, rate: '37%' },
    { key: 'wechat', channel: '微信', leads: 28, rate: '20%' },
    { key: 'form', channel: '表单提交', leads: 44, rate: '31%' },
    { key: 'email', channel: '邮件', leads: 16, rate: '12%' },
  ], [])

  const topFilters = useMemo(() => [
    { key: 1, name: '大米 + 25kg', usage: 192 },
    { key: 2, name: '小麦粉 + 散装', usage: 148 },
    { key: 3, name: '非转基因 + 食用油', usage: 116 },
  ], [])

  return (
    <div className="py-10 bg-light min-h-screen">
      <Helmet>
        <title>数据看板 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="监测产品浏览、筛选、对比与线索转化的数据看板" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Title level={2}>数据看板（演示）</Title>
          <Paragraph>实时了解产品浏览、筛选、对比与线索转化表现，为运营优化提供依据。</Paragraph>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="本周产品浏览"
                value={1280}
                prefix={<ArrowUpOutlined className="text-green-500" />}
                suffix="次"
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="筛选/搜索次数"
                value={860}
                prefix={<ArrowUpOutlined className="text-green-500" />}
                suffix="次"
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="对比操作"
                value={320}
                prefix={<ArrowUpOutlined className="text-green-500" />}
                suffix="次"
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="询价转化率"
                value={10.9}
                prefix={<ArrowDownOutlined className="text-orange-500" />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
            <Card title="漏斗表现">
              <div className="space-y-3">
                {funnelData.map((item, index) => {
                  const percent = index === 0 ? 100 : Math.round((item.value / funnelData[0].value) * 100)
                  return (
                    <div key={item.stage}>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{item.stage}</span>
                        <span>{item.value}（{percent}%）</span>
                      </div>
                      <Progress percent={percent} showInfo={false} strokeColor="#1677ff" />
                    </div>
                  )
                })}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="线索来源分布">
              <Table
                columns={[
                  { title: '渠道', dataIndex: 'channel', key: 'channel' },
                  { title: '线索数', dataIndex: 'leads', key: 'leads' },
                  { title: '占比', dataIndex: 'rate', key: 'rate' },
                ]}
                dataSource={channelData}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
            <Card title="热门筛选组合">
              <Table
                columns={[
                  { title: '预设', dataIndex: 'name', key: 'name' },
                  { title: '使用次数', dataIndex: 'usage', key: 'usage' },
                ]}
                dataSource={topFilters}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="渠道服务水平">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600"><span>电话响应</span><span>92%</span></div>
                  <Progress percent={92} status="active" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600"><span>微信转化</span><span>68%</span></div>
                  <Progress percent={68} status="active" strokeColor="#52c41a" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600"><span>表单跟进</span><span>74%</span></div>
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

export default AnalyticsDashboard
