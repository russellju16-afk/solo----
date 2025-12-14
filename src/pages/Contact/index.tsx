import React from 'react'
import { Helmet } from 'react-helmet-async'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined, WechatOutlined, CopyOutlined } from '@ant-design/icons'
import { Button, message, Space, Card, Typography } from 'antd'
import { LeadForm } from '@/components/forms/LeadForm'
import ImageWithFallback from '@/components/ImageWithFallback'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'
import { fetchFaqs } from '@/services/content'
import { FaqItem } from '@/types/content'
import { useLocation } from 'react-router-dom'

const { Title, Paragraph } = Typography

const Contact: React.FC = () => {
  const { companyInfo } = useCompanyInfo()
  const location = useLocation()
  const formRef = React.useRef<HTMLDivElement | null>(null)
  const [faqs, setFaqs] = React.useState<FaqItem[]>([])
  const companyName = companyInfo?.company_name || '西安超群粮油贸易有限公司'
  const companyAddress = companyInfo?.address || '西安市未央区粮油批发市场A区12号'
  const companyPhone = companyInfo?.phone || '029-86543210'
  const companyEmail = companyInfo?.email || 'info@chaoqun粮油.com'
  const businessHours = companyInfo?.business_hours || '周一至周五：8:00-18:00'
  const wechatQr = companyInfo?.wechat_qr_code

  React.useEffect(() => {
    const controller = new AbortController()
    const loadFaqs = async () => {
      try {
        const result = await fetchFaqs({ pageSize: 4 }, { signal: controller.signal })
        setFaqs(result.slice(0, 4))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('load faqs failed', error)
        }
      }
    }
    loadFaqs()
    return () => controller.abort()
  }, [])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  React.useEffect(() => {
    if (location.hash === '#quote') {
      // 等待首屏渲染完成再滚动，避免移动端抖动
      window.setTimeout(() => scrollToForm(), 0)
    }
  }, [location.hash])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success('联系方式已复制')
    } catch (err) {
      console.error('Copy failed', err)
      message.error('复制失败，请稍后重试')
    }
  }

  const handleWechatJump = () => {
    if (wechatQr) {
      window.open(wechatQr, '_blank', 'noopener')
      return
    }
    message.info('暂未提供微信二维码')
  }
  return (
    <div className="py-8 md:py-12">
      <Helmet>
        <title>联系我们 - {companyName}</title>
        <meta name="description" content={companyInfo?.seo_description || `${companyName}联系方式，地址：${companyAddress}，电话：${companyPhone}`} />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title">联系我们</h1>
          <p className="section-subtitle">如果您有任何需求或疑问，欢迎通过以下方式联系我们，我们将竭诚为您服务</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧公司信息 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">公司信息</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <EnvironmentOutlined className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">公司地址</h3>
                  <p className="text-gray-600">{companyAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <PhoneOutlined className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">联系电话</h3>
                  <p className="text-gray-600 mb-2">{companyPhone}</p>
                  <Space size="middle" wrap>
                    <Button
                      type="primary"
                      className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                      onClick={() => window.location.href = `tel:${companyPhone}`}
                    >
                      一键拨打电话
                    </Button>
                    <Button icon={<CopyOutlined />} onClick={() => handleCopy(companyPhone)}>
                      复制号码
                    </Button>
                    <Button icon={<WechatOutlined />} onClick={handleWechatJump}>
                      微信联系
                    </Button>
                  </Space>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <MailOutlined className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">电子邮箱</h3>
                  <p className="text-gray-600">{companyEmail}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <ClockCircleOutlined className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">工作时间</h3>
                  <p className="text-gray-600">{businessHours}</p>
                  <p className="text-gray-600">周六至周日：休息</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">微信二维码</h3>
                <div className="w-48 h-48 bg-light rounded-md flex items-center justify-center mx-auto mb-4">
                  {wechatQr ? (
                    <ImageWithFallback src={wechatQr} alt="微信二维码" fallback="/assets/placeholder-qr.webp" className="max-h-48 object-contain" />
                  ) : (
                    <WechatOutlined className="text-4xl text-gray-400" />
                  )}
                </div>
                <p className="text-center text-sm text-gray-600">扫码添加微信，获取更多优惠信息</p>
              </div>
            </div>
          </div>

          {/* 右侧联系表单 */}
          <div ref={formRef} className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">立即咨询</h2>
              <Button type="link" onClick={scrollToTop}>返回顶部</Button>
            </div>
            <LeadForm
              source="contact_page"
            />
          </div>
        </div>

        {faqs.length > 0 && (
          <div className="mt-10">
            <Card title="常见问题与指南">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqs.map((item) => (
                  <div key={item.id} className="p-3 rounded-md bg-gray-50">
                    <Title level={5}>{item.question}</Title>
                    <Paragraph className="mb-0 text-gray-700">{item.answer}</Paragraph>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <div className="text-center mt-10">
          <Space size="large" wrap>
            <Button type="primary" size="large" onClick={() => window.location.href = `tel:${companyPhone}`}>
              立即拨打
            </Button>
            <Button size="large" onClick={() => handleCopy(companyPhone)} icon={<CopyOutlined />}>复制电话</Button>
            <Button size="large" icon={<WechatOutlined />} onClick={handleWechatJump}>微信咨询</Button>
            <Button size="large" type="dashed" onClick={scrollToForm}>填写咨询表单</Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default Contact
