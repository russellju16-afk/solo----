import React, { useEffect, useState, useCallback } from 'react'
import { Card, Row, Col, Typography, Form, Input, Button, Space, Tag, Divider, message } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined, IdcardOutlined } from '@ant-design/icons'
import { authService, userService } from '../../services/user'
import { useAuthStore } from '../../store/auth'
import { redirectToLogin } from '../../utils/authRedirect'
import './index.css'

const { Title, Paragraph, Text } = Typography

type ProfileInfo = {
  id?: number
  username?: string
  name?: string
  phone?: string
  email?: string
  role?: string
  status?: number
}

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore()
  const [profile, setProfile] = useState<ProfileInfo | null>(user || null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const unwrapData = (value: unknown) => {
    if (!value || typeof value !== 'object') return value
    if (!('data' in value)) return value
    return (value as Record<string, unknown>).data
  }

  const normalizeUser = (data?: unknown): ProfileInfo | null => {
    if (!data || typeof data !== 'object') return null
    const obj = data as Record<string, unknown>
    const roleValue = obj.role
    let role: string | undefined
    if (typeof roleValue === 'string') {
      role = roleValue
    } else if (roleValue && typeof roleValue === 'object') {
      const roleName = (roleValue as Record<string, unknown>).name
      role = typeof roleName === 'string' ? roleName : undefined
    }
    return {
      id: typeof obj.id === 'number' ? obj.id : undefined,
      username: typeof obj.username === 'string' ? obj.username : undefined,
      name: typeof obj.name === 'string' ? obj.name : undefined,
      phone: typeof obj.phone === 'string' ? obj.phone : undefined,
      email: typeof obj.email === 'string' ? obj.email : undefined,
      role,
      status: typeof obj.status === 'number' ? obj.status : undefined,
    }
  }

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true)
    try {
      const res = (await userService.getCurrentUser()) as unknown
      const info = normalizeUser(unwrapData(res))
      if (info) {
        setProfile(info)
        profileForm.setFieldsValue({
          name: info.name,
          username: info.username,
          phone: info.phone,
          email: info.email,
          role: info.role,
        })
        // 同步到全局 store，避免头部昵称不同步
        useAuthStore.setState((state) => {
          const prev = state.user
          const nextId = info.id ?? prev?.id
          const nextUsername = info.username ?? prev?.username
          if (!nextId || !nextUsername) return state
          return {
            ...state,
            user: {
              id: nextId,
              username: nextUsername,
              name: info.name ?? prev?.name ?? '',
              phone: info.phone ?? prev?.phone ?? '',
              role: info.role ?? prev?.role ?? '',
              status: info.status ?? prev?.status ?? 1,
            },
          }
        })
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const msg = err?.response?.data?.message || err?.message || '获取个人信息失败'
      message.error(msg)
    } finally {
      setLoadingProfile(false)
    }
  }, [profileForm])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      setSavingProfile(true)
      const payload = {
        name: values.name,
        phone: values.phone,
        email: values.email,
      }
      const res = (await userService.updateCurrentUser(payload)) as unknown
      const info = normalizeUser(unwrapData(res))
      setProfile(info)
      if (info) {
        useAuthStore.setState((state) => {
          const prev = state.user
          const nextId = info.id ?? prev?.id
          const nextUsername = info.username ?? prev?.username
          if (!nextId || !nextUsername) return state
          return {
            ...state,
            user: {
              id: nextId,
              username: nextUsername,
              name: info.name ?? prev?.name ?? '',
              phone: info.phone ?? prev?.phone ?? '',
              role: info.role ?? prev?.role ?? '',
              status: info.status ?? prev?.status ?? 1,
            },
          }
        })
      }
      message.success('个人信息已更新')
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown; response?: { data?: { message?: string } }; message?: string }
      if (err?.errorFields) return // 表单校验错误
      const msg = err?.response?.data?.message || err?.message || '更新个人信息失败'
      message.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setSavingPwd(true)
      await authService.resetPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      message.success('密码修改成功，请使用新密码重新登录')
      logout('reset password success')
      redirectToLogin('password reset')
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown; response?: { data?: { message?: string } }; message?: string }
      if (err?.errorFields) return
      const msg = err?.response?.data?.message || err?.message || '修改密码失败'
      message.error(msg)
    } finally {
      setSavingPwd(false)
    }
  }

  const displayName = profile?.name || profile?.username || '用户'

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <Title level={3} className="profile-title">
            个人中心
          </Title>
          <Paragraph className="profile-desc">
            查看和更新个人信息，及时修改密码保障账号安全。
          </Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card className="profile-card" bordered={false} loading={loadingProfile}>
            <Space align="center" size={14} className="profile-avatar-block">
              <div className="profile-avatar">
                {displayName.slice(0, 1)}
              </div>
              <div>
                <div className="profile-name">{displayName}</div>
                <div className="profile-meta">
                  <Tag color="blue" bordered={false}>
                    {profile?.role || '未分配角色'}
                  </Tag>
                </div>
              </div>
            </Space>

            <Divider />

            <div className="profile-list">
              <div className="profile-item">
                <span className="profile-label"><UserOutlined /> 用户名</span>
                <Text strong>{profile?.username || '--'}</Text>
              </div>
              <div className="profile-item">
                <span className="profile-label"><IdcardOutlined /> 姓名</span>
                <Text>{profile?.name || '--'}</Text>
              </div>
              <div className="profile-item">
                <span className="profile-label"><PhoneOutlined /> 手机</span>
                <Text>{profile?.phone || '未填写'}</Text>
              </div>
              <div className="profile-item">
                <span className="profile-label"><MailOutlined /> 邮箱</span>
                <Text>{profile?.email || '未填写'}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card className="profile-card" bordered={false} title="基本信息" extra={<Text type="secondary">可编辑姓名 / 手机 / 邮箱</Text>}>
            <Form
              layout="vertical"
              form={profileForm}
              requiredMark={false}
              initialValues={{
                username: profile?.username,
                name: profile?.name,
                phone: profile?.phone,
                email: profile?.email,
                role: profile?.role,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="用户名" name="username">
                    <Input prefix={<UserOutlined />} disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="角色" name="role">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="手机号"
                    name="phone"
                    rules={[
                      { pattern: /^1[3-9]\\d{9}$/, message: '请输入有效手机号' },
                    ]}
                  >
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { type: 'email', message: '请输入有效邮箱' },
                    ]}
                  >
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
              </Row>

              <Space>
                <Button type="primary" onClick={handleSaveProfile} loading={savingProfile}>
                  保存信息
                </Button>
                <Button onClick={fetchProfile} disabled={loadingProfile}>
                  重新获取
                </Button>
              </Space>
            </Form>
          </Card>

          <Card
            className="profile-card"
            bordered={false}
            title="修改密码"
            style={{ marginTop: 16 }}
            extra={<Text type="secondary">建议定期更新密码提升安全性</Text>}
          >
            <Form
              layout="vertical"
              form={passwordForm}
              requiredMark={false}
            >
              <Form.Item
                label="当前密码"
                name="oldPassword"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password placeholder="请输入当前密码" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少 6 位' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" prefix={<SafetyCertificateOutlined />} />
              </Form.Item>
              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" prefix={<LockOutlined />} />
              </Form.Item>

              <Space>
                <Button type="primary" onClick={handleChangePassword} loading={savingPwd}>
                  更新密码
                </Button>
                <Button onClick={() => passwordForm.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
