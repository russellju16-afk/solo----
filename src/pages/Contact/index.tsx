import React from 'react'
import { Helmet } from 'react-helmet-async'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined, WechatOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { LeadForm } from '@/components/forms/LeadForm'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'

const Contact: React.FC = () => {
  const { companyInfo } = useCompanyInfo()
  const companyName = companyInfo?.company_name || '西安超群粮油贸易有限公司'
  const companyAddress = companyInfo?.address || '西安市未央区粮油批发市场A区12号'
  const companyPhone = companyInfo?.phone || '029-86543210'
  const companyEmail = companyInfo?.email || 'info@chaoqun粮油.com'
  const businessHours = companyInfo?.business_hours || '周一至周五：8:00-18:00'
  const wechatQr = companyInfo?.wechat_qr_code
  return (
    <div className="py-12">
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
                  <Button 
                    type="primary" 
                    className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                    onClick={() => window.location.href = `tel:${companyPhone}`}
                  >
                    一键拨打电话
                  </Button>
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
                    <img src={wechatQr} alt="微信二维码" className="max-h-48 object-contain" />
                  ) : (
                    <WechatOutlined className="text-4xl text-gray-400" />
                  )}
                </div>
                <p className="text-center text-sm text-gray-600">扫码添加微信，获取更多优惠信息</p>
              </div>
            </div>
          </div>

          {/* 右侧联系表单 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <LeadForm
              source="contact_page"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
