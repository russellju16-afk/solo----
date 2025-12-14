import React, { useMemo, useState } from 'react'
import { Button, Drawer, FloatButton, message, Space, Tooltip, Typography } from 'antd'
import {
  CustomerServiceOutlined,
  MailOutlined,
  PhoneOutlined,
  WechatOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'
import { signalLead, track } from '@/utils/track'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useNavigate } from 'react-router-dom'
import ImageWithFallback from '@/components/ImageWithFallback'

const CONTACT_PRESET_QR = '/assets/placeholder-qr.webp'

const ContactWidget: React.FC = () => {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { companyInfo } = useCompanyInfo()
  const phone = companyInfo?.phone || '029-86543210'
  const email = companyInfo?.email || 'info@chaoqun粮油.com'
  const wechatQr = companyInfo?.wechat_qr_code || CONTACT_PRESET_QR

  const [contactDrawerOpen, setContactDrawerOpen] = useState(false)
  const [contactDrawerTab, setContactDrawerTab] = useState<'phone' | 'wechat'>('phone')

  const openContactDrawer = (tab: 'phone' | 'wechat') => {
    setContactDrawerTab(tab)
    setContactDrawerOpen(true)
  }

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

  const drawerTitle = useMemo(() => (contactDrawerTab === 'phone' ? '电话联系' : '微信联系'), [contactDrawerTab])

  const handleQuote = () => {
    navigate('/contact#quote')
  }

  const handleWechat = () => {
    signalLead('wechat', {})
    track('contact_wechat_open', {})
    openContactDrawer('wechat')
  }

  if (isMobile) {
    return (
      <>
        <div className="cq-mobile-contactbar">
          <Button
            icon={<PhoneOutlined />}
            onClick={() => {
              signalLead('phone', { phone })
              track('contact_phone_click', { phone })
              openContactDrawer('phone')
            }}
          >
            电话
          </Button>
          <Button icon={<WechatOutlined />} onClick={handleWechat}>
            微信
          </Button>
          <Button type="primary" icon={<CustomerServiceOutlined />} onClick={handleQuote}>
            获取报价
          </Button>
        </div>

        <Drawer
          placement="bottom"
          height={contactDrawerTab === 'wechat' ? 420 : 320}
          title={drawerTitle}
          open={contactDrawerOpen}
          onClose={() => setContactDrawerOpen(false)}
          extra={
            <Space size={8}>
              <Button
                type={contactDrawerTab === 'phone' ? 'primary' : 'default'}
                size="small"
                onClick={() => setContactDrawerTab('phone')}
              >
                电话
              </Button>
              <Button
                type={contactDrawerTab === 'wechat' ? 'primary' : 'default'}
                size="small"
                onClick={() => setContactDrawerTab('wechat')}
              >
                微信
              </Button>
            </Space>
          }
        >
          {contactDrawerTab === 'phone' ? (
            <div>
              <Typography.Text type="secondary">客服电话</Typography.Text>
              <Typography.Title level={4} style={{ marginTop: 6 }}>
                {phone}
              </Typography.Title>
              <Space wrap size={10} style={{ marginTop: 12 }}>
                <Button type="primary" size="large" onClick={() => (window.location.href = `tel:${phone}`)}>
                  一键拨打
                </Button>
                <Button size="large" icon={<CopyOutlined />} onClick={() => handleCopy(phone)}>
                  复制号码
                </Button>
              </Space>
              <div style={{ marginTop: 14 }}>
                <Typography.Text type="secondary">也可前往</Typography.Text>
                <Button type="link" onClick={handleQuote}>
                  获取报价表单
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary">长按二维码保存或添加微信</Typography.Text>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <ImageWithFallback
                  src={wechatQr}
                  alt="微信二维码"
                  fallback={CONTACT_PRESET_QR}
                  style={{
                    width: 240,
                    height: 240,
                    objectFit: 'contain',
                    borderRadius: 12,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: '#fff',
                  }}
                />
              </div>
              <Space wrap size={10} style={{ marginTop: 14, justifyContent: 'center' }}>
                <Button size="large" onClick={() => window.open(wechatQr, '_blank', 'noopener')}>
                  打开图片
                </Button>
                <Button size="large" type="primary" onClick={handleQuote}>
                  获取报价
                </Button>
              </Space>
            </div>
          )}
        </Drawer>
      </>
    )
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
        <FloatButton
          icon={<WechatOutlined />}
          onClick={() => {
            signalLead('wechat', {})
            track('contact_wechat_open', {})
            if (wechatQr) {
              window.open(wechatQr, '_blank', 'noopener')
            } else {
              message.info('暂未提供微信二维码')
            }
          }}
        />
      </Tooltip>
    </FloatButton.Group>
  )
}

export default ContactWidget
