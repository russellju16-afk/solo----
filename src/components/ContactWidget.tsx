import React from 'react'
import { FloatButton, message, Tooltip } from 'antd'
import { PhoneOutlined, WechatOutlined, MailOutlined, CopyOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'
import { signalLead, track } from '@/utils/track'

const CONTACT_PRESET_QR = 'https://via.placeholder.com/240x240.png?text=WeChat'

const ContactWidget: React.FC = () => {
  const { companyInfo } = useCompanyInfo()
  const phone = companyInfo?.phone || '029-86543210'
  const email = companyInfo?.email || 'info@chaoqun粮油.com'
  const wechatQr = companyInfo?.wechat_qr_code || CONTACT_PRESET_QR

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success('联系方式已复制')
      return true
    } catch (error) {
      console.error(error)
      message.error('复制失败，请稍后重试')
      return false
    }
  }

  const handleWechat = () => {
    signalLead('wechat', {})
    track('contact_wechat_open', {})
    if (wechatQr) {
      window.open(wechatQr, '_blank', 'noopener')
    } else {
      message.info('暂未提供微信二维码')
    }
  }

  return (
    <FloatButton.Group
      trigger="hover"
      type="primary"
      shape="circle"
      style={{ right: 24 }}
      icon={<CustomerServiceOutlined />}
      description="联系"
    >
      <Tooltip title="一键拨号" placement="left">
        <FloatButton
          icon={<PhoneOutlined />}
          onClick={() => {
            signalLead('phone', { phone })
            track('contact_phone_click', { phone })
            window.location.href = `tel:${phone}`
          }}
        />
      </Tooltip>
      <Tooltip title="复制电话" placement="left">
        <FloatButton icon={<CopyOutlined />} onClick={() => handleCopy(phone)} />
      </Tooltip>
      <Tooltip title="复制邮箱" placement="left">
        <FloatButton
          icon={<MailOutlined />}
          onClick={async () => {
            const ok = await handleCopy(email)
            if (ok) {
              signalLead('email', { email })
              track('contact_email_copy', { email })
            }
          }}
        />
      </Tooltip>
      <Tooltip title="微信联系" placement="left">
        <FloatButton icon={<WechatOutlined />} onClick={handleWechat} />
      </Tooltip>
    </FloatButton.Group>
  )
}

export default ContactWidget
