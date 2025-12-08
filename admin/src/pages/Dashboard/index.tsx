import React from 'react'
import { Card, Typography, Space, Row, Col, Statistic, Tag } from 'antd'
import { FieldTimeOutlined, BarChartOutlined, AppstoreAddOutlined, ReadOutlined, SmileOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/auth'
import './index.css'

const { Title, Paragraph, Text } = Typography

const statCards = [
  {
    key: 'todayLeads',
    title: '今日新增线索',
    value: 0, // TODO: 接入接口数据
    suffix: '条',
    icon: <FieldTimeOutlined />,
  },
  {
    key: 'monthLeads',
    title: '本月线索',
    value: 0, // TODO: 接入接口数据
    suffix: '条',
    icon: <BarChartOutlined />,
  },
  {
    key: 'products',
    title: '产品数量',
    value: 0, // TODO: 接入接口数据
    suffix: '个',
    icon: <AppstoreAddOutlined />,
  },
  {
    key: 'news',
    title: '内容更新',
    value: 0, // TODO: 接入接口数据
    suffix: '篇',
    icon: <ReadOutlined />,
  },
]

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          超群粮油统一后台
        </Title>
        <Paragraph className="dashboard-subtitle">
          已开放线索管理、产品管理、内容管理、公司信息配置、飞书配置、用户与操作日志等模块，后续新增能力会在此同步集中管理。
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} className="dashboard-stat-row">
        {statCards.map(stat => (
          <Col xs={24} sm={12} lg={6} key={stat.key}>
            <Card className="stat-card" bordered={false}>
              <div className="stat-card-header">
                <div className="stat-card-title">
                  <span className="stat-icon">{stat.icon}</span>
                  <span>{stat.title}</span>
                </div>
                <Tag color="blue">概览</Tag>
              </div>
              <Statistic value={stat.value} suffix={stat.suffix} valueStyle={{ fontSize: 30, fontWeight: 700 }} />
              <div className="stat-footer">数据将与后台接口接入后自动更新</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="welcome-card" bordered={false}>
        <Space direction="vertical" size={12}>
          <div className="welcome-header">
            <span className="welcome-icon">
              <SmileOutlined />
            </span>
            <Title level={4} className="welcome-title">
              欢迎登录，{user?.name || '管理员'}
            </Title>
          </div>
          <Paragraph className="welcome-desc">
            快速查看最新线索、产品与内容数据，或通过左侧导航进入对应模块进行管理。建议优先检查线索跟进情况与产品信息，保持官网与销售线索同步更新。
          </Paragraph>
          <Text type="secondary" className="welcome-meta">
            如需调整权限或新增模块，请联系系统管理员。
          </Text>
        </Space>
      </Card>
    </div>
  )
}

export default Dashboard
