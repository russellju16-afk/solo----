/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import http from '../../services/http'
import './index.css'

const { Title } = Typography

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = React.useState(false)

  // 登录表单提交
  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const response = await http.post('/auth/login', values)
      // 响应拦截器已经返回了response.data，所以直接从response中解构
      const { token, userInfo } = response
      
      // 保存token到localStorage
      localStorage.setItem('token', token)
      // 更新状态管理
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
