/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd'
import {
  AppstoreAddOutlined,
  BarChartOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuthStore } from '../../store/auth'
import { leadService } from '../../services/lead'
import { productService } from '../../services/product'
import { newsService } from '../../services/content'
import type { LeadListItem } from '../../types/lead'
import { CHANNEL_LABEL_MAP, formatDate, STATUS_LABEL_MAP, STATUS_TAG_COLOR_MAP } from '../../utils/lead'
import './index.css'

const { Title, Paragraph, Text } = Typography

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const warnedRef = React.useRef(false)
  const warnOnce = (content: string) => {
    if (warnedRef.current) return
    warnedRef.current = true
    message.warning(content)
  }

  const [statsLoading, setStatsLoading] = React.useState(false)
  const [todayLeads, setTodayLeads] = React.useState<number | null>(null)
  const [monthLeads, setMonthLeads] = React.useState<number | null>(null)
  const [todayFormLeads, setTodayFormLeads] = React.useState<number | null>(null)
  const [todaySignalLeads, setTodaySignalLeads] = React.useState<number | null>(null)
  const [monthFormLeads, setMonthFormLeads] = React.useState<number | null>(null)
  const [monthSignalLeads, setMonthSignalLeads] = React.useState<number | null>(null)
  const [productTotal, setProductTotal] = React.useState<number | null>(null)
  const [news7dTotal, setNews7dTotal] = React.useState<number | null>(null)

  const [recentLeads, setRecentLeads] = React.useState<LeadListItem[]>([])
  const [recentLeadsLoading, setRecentLeadsLoading] = React.useState(false)
  const [recentNews, setRecentNews] = React.useState<any[]>([])
  const [recentNewsLoading, setRecentNewsLoading] = React.useState(false)

  const statCards = React.useMemo(
    () => [
      {
        key: 'todayLeads',
        title: '今日新增线索',
        value: todayLeads,
        suffix: '条',
        icon: <FieldTimeOutlined />,
        onView: () => navigate('/leads'),
        footer:
          statsLoading
            ? '数据加载中…'
            : typeof todayFormLeads === 'number' && typeof todaySignalLeads === 'number'
              ? `表单 ${todayFormLeads} / 行为 ${todaySignalLeads}`
              : '数据来自后台接口统计',
      },
      {
        key: 'monthLeads',
        title: '本月线索',
        value: monthLeads,
        suffix: '条',
        icon: <BarChartOutlined />,
        onView: () => navigate('/leads'),
        footer:
          statsLoading
            ? '数据加载中…'
            : typeof monthFormLeads === 'number' && typeof monthSignalLeads === 'number'
              ? `表单 ${monthFormLeads} / 行为 ${monthSignalLeads}`
              : '数据来自后台接口统计',
      },
      {
        key: 'products',
        title: '产品数量',
        value: productTotal,
        suffix: '个',
        icon: <AppstoreAddOutlined />,
        onView: () => navigate('/products'),
        footer: statsLoading ? '数据加载中…' : '数据来自后台接口统计',
      },
      {
        key: 'news',
        title: '近7天内容更新',
        value: news7dTotal,
        suffix: '篇',
        icon: <ReadOutlined />,
        onView: () => navigate('/news'),
        footer: statsLoading ? '数据加载中…' : '数据来自后台接口统计',
      },
    ],
    [monthFormLeads, monthLeads, monthSignalLeads, navigate, news7dTotal, productTotal, statsLoading, todayFormLeads, todayLeads, todaySignalLeads],
  )

  React.useEffect(() => {
    let cancelled = false

    const fetchStats = async () => {
      setStatsLoading(true)

      const today = dayjs().format('YYYY-MM-DD')
      const monthStart = dayjs().startOf('month').format('YYYY-MM-DD')
      const newsFrom = dayjs().subtract(6, 'day').format('YYYY-MM-DD')

      const results = await Promise.allSettled([
        leadService.getLeads({ page: 1, pageSize: 1, dateFrom: today, dateTo: today, leadType: 'form' }),
        leadService.getLeads({ page: 1, pageSize: 1, dateFrom: today, dateTo: today, leadType: 'signal' }),
        leadService.getLeads({ page: 1, pageSize: 1, dateFrom: monthStart, dateTo: today, leadType: 'form' }),
        leadService.getLeads({ page: 1, pageSize: 1, dateFrom: monthStart, dateTo: today, leadType: 'signal' }),
        productService.getProducts({ page: 1, pageSize: 1 }),
        newsService.getNews({ page: 1, pageSize: 1, date_from: newsFrom, date_to: today }),
      ])

      if (cancelled) return

      const [todayFormRes, todaySignalRes, monthFormRes, monthSignalRes, productsRes, newsRes] = results

      let hasFailure = false

      const todayForm = todayFormRes.status === 'fulfilled' ? (todayFormRes.value?.total ?? 0) : null
      const todaySignal = todaySignalRes.status === 'fulfilled' ? (todaySignalRes.value?.total ?? 0) : null
      const monthForm = monthFormRes.status === 'fulfilled' ? (monthFormRes.value?.total ?? 0) : null
      const monthSignal = monthSignalRes.status === 'fulfilled' ? (monthSignalRes.value?.total ?? 0) : null

      if (todayForm === null || todaySignal === null) {
        hasFailure = true
        setTodayFormLeads(todayForm)
        setTodaySignalLeads(todaySignal)
        setTodayLeads(null)
      } else {
        setTodayFormLeads(todayForm)
        setTodaySignalLeads(todaySignal)
        setTodayLeads(todayForm + todaySignal)
      }

      if (monthForm === null || monthSignal === null) {
        hasFailure = true
        setMonthFormLeads(monthForm)
        setMonthSignalLeads(monthSignal)
        setMonthLeads(null)
      } else {
        setMonthFormLeads(monthForm)
        setMonthSignalLeads(monthSignal)
        setMonthLeads(monthForm + monthSignal)
      }

      if (productsRes.status === 'fulfilled') setProductTotal((productsRes.value as any)?.total ?? null)
      else {
        hasFailure = true
        setProductTotal(null)
      }

      if (newsRes.status === 'fulfilled') setNews7dTotal((newsRes.value as any)?.total ?? null)
      else {
        hasFailure = true
        setNews7dTotal(null)
      }

      if (hasFailure) {
        warnOnce('部分统计数据加载失败，已展示可用数据')
      }

      setStatsLoading(false)
    }

    const fetchRecent = async () => {
      setRecentLeadsLoading(true)
      setRecentNewsLoading(true)

      const [leadsRes, newsRes] = await Promise.allSettled([
        leadService.getLeads({ page: 1, pageSize: 5 }),
        newsService.getNews({ page: 1, pageSize: 5 }),
      ])

      if (cancelled) return

      if (leadsRes.status === 'fulfilled') setRecentLeads(leadsRes.value?.items || [])
      else {
        setRecentLeads([])
        warnOnce('部分列表数据加载失败，已展示可用数据')
      }

      if (newsRes.status === 'fulfilled') setRecentNews((newsRes.value as any)?.data || [])
      else {
        setRecentNews([])
        warnOnce('部分列表数据加载失败，已展示可用数据')
      }

      setRecentLeadsLoading(false)
      setRecentNewsLoading(false)
    }

    fetchStats()
    fetchRecent()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <div>
            <Title level={2} className="dashboard-title">
              运营工作台
            </Title>
            <Paragraph className="dashboard-subtitle">
              你好，{user?.name || '管理员'}。这里汇总线索、产品与内容更新概览，支持快捷操作与最近动态（统计卡片已接入后台接口）。
            </Paragraph>
          </div>
          <Button type="primary" icon={<BarChartOutlined />} onClick={() => navigate('/analytics')}>
            去数据看板
          </Button>
        </div>
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
                <Button type="link" size="small" onClick={stat.onView} className="stat-view-button">
                  查看
                </Button>
              </div>
              <Statistic
                value={stat.value ?? '--'}
                suffix={stat.suffix}
                valueStyle={{ fontSize: 30, fontWeight: 700 }}
              />
              <div className="stat-footer">{stat.footer}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="dashboard-sections">
        <Card title="快捷操作" className="dashboard-actions-card" bordered={false}>
          <Space wrap size={12}>
            <Button icon={<PlusOutlined />} onClick={() => navigate('/leads')}>
              新增线索
            </Button>
            <Button icon={<AppstoreAddOutlined />} onClick={() => navigate('/products')}>
              新增产品
            </Button>
            <Button icon={<FileTextOutlined />} onClick={() => navigate('/news')}>
              发布新闻
            </Button>
            <Button type="primary" icon={<BarChartOutlined />} onClick={() => navigate('/analytics')}>
              打开数据看板
            </Button>
          </Space>
          <Text type="secondary" className="dashboard-actions-hint">
            提示：数据看板包含漏斗、渠道与转化分析；仪表盘侧重管理视角的概览与待办。
          </Text>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="最近线索" className="dashboard-list-card" bordered={false}>
              <div className="dashboard-table-container">
                <Table
                  loading={recentLeadsLoading}
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={recentLeads}
                  columns={[
                    {
                      title: '创建时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      width: 170,
                      render: (value: string) => formatDate(value),
                    },
                    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
                    {
                      title: '公司',
                      dataIndex: 'companyName',
                      key: 'companyName',
                      ellipsis: true,
                    },
                    {
                      title: '渠道',
                      key: 'channel',
                      width: 110,
                      render: (_: any, record: LeadListItem) => {
                        if (record.leadType === 'signal') {
                          if (record.channel === 'phone') return '电话'
                          if (record.channel === 'wechat') return '微信'
                          if (record.channel === 'email') return '邮件'
                          return '行为'
                        }
                        return record.channelType ? CHANNEL_LABEL_MAP[record.channelType] : '-'
                      },
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (value: any) => (
                        <Tag color={STATUS_TAG_COLOR_MAP[value] || 'default'}>{STATUS_LABEL_MAP[value] || value}</Tag>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 80,
                      render: (record: LeadListItem) => (
                        <Button type="link" size="small" onClick={() => navigate(`/leads/${record.id}`)}>
                          查看
                        </Button>
                      ),
                    },
                  ]}
                  scroll={{ x: 720 }}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="最近内容更新（新闻）" className="dashboard-list-card" bordered={false}>
              <div className="dashboard-table-container">
                <Table
                  loading={recentNewsLoading}
                  size="small"
                  pagination={false}
                  rowKey={(record: any) => record?.id || record?.title}
                  dataSource={recentNews}
                  columns={[
                    {
                      title: '发布时间',
                      key: 'time',
                      width: 170,
                      render: (record: any) => {
                        const value = record?.published_at || record?.created_at
                        if (!value) return '-'
                        return new Date(value).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      },
                    },
                    {
                      title: '标题',
                      dataIndex: 'title',
                      key: 'title',
                      ellipsis: true,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 110,
                      render: (value: any) => (
                        <Tag color={value === 'published' ? 'green' : 'orange'}>
                          {value === 'published' ? '已发布' : '草稿'}
                        </Tag>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 80,
                      render: () => (
                        <Button type="link" size="small" onClick={() => navigate('/news')}>
                          进入
                        </Button>
                      ),
                    },
                  ]}
                  scroll={{ x: 680 }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Dashboard
