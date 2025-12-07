/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import http from '../../services/http'
import './index.css'
import { AUTH_TOKEN_KEY } from '../../constants/auth'

const { Title } = Typography

const Login: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const savedUsername = localStorage.getItem('admin-remembered-username')
    if (savedUsername) {
      form.setFieldsValue({
        username: savedUsername,
        remember: true,
      })
    }
    // 清理旧的含密码缓存
    localStorage.removeItem('admin-remembered-credentials')
  }, [form])

  // 登录表单提交
  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const { remember, ...loginValues } = values
      const response = await http.post('/auth/login', loginValues)
      // 响应拦截器已经返回了response.data，所以直接从response中解构
      const { token, userInfo } = response

      if (remember) {
        localStorage.setItem('admin-remembered-username', loginValues.username)
      } else {
        localStorage.removeItem('admin-remembered-username')
      }

      localStorage.setItem(AUTH_TOKEN_KEY, token)
      login(token, userInfo)
      // 跳转到首页
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      // 提取更具体的错误信息
      let errorMessage = '登录失败，请检查用户名和密码'
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      } else {
        errorMessage = '服务器错误，请稍后重试'
      }
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" title={<Title level={3} className="login-title">西安超群粮油贸易有限公司</Title>}>
        <Form
          name="login"
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" initialValue={false}>
            <Checkbox>记住密码（仅在可信设备使用）</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
