import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Switch, Space } from 'antd';
import { feishuService } from '../../services/company';

const FeishuConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取飞书配置
  const fetchFeishuConfig = async () => {
    setLoading(true);
    try {
      const res = await feishuService.getFeishuConfig();
      form.setFieldsValue(res);
    } catch (error) {
      message.error('获取飞书配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchFeishuConfig();
  }, []);

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await feishuService.updateFeishuConfig(values);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试飞书连接
  const testConnection = async () => {
    setLoading(true);
    try {
      await feishuService.testFeishuConnection();
      message.success('飞书连接测试成功');
    } catch (error) {
      message.error('飞书连接测试失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>飞书配置</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24, maxWidth: 600 }}
      >
        <Form.Item
          name="enabled"
          label="启用飞书集成"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="app_id"
          label="飞书App ID"
          rules={[{ required: true, message: '请输入飞书App ID' }]}
        >
          <Input placeholder="请输入飞书App ID" />
        </Form.Item>

        <Form.Item
          name="app_secret"
          label="飞书App Secret"
          rules={[{ required: true, message: '请输入飞书App Secret' }]}
        >
          <Input.Password placeholder="请输入飞书App Secret" />
        </Form.Item>

        <Form.Item
          name="webhook_url"
          label="飞书Webhook URL"
          rules={[{ required: true, message: '请输入飞书Webhook URL' }]}
        >
          <Input placeholder="请输入飞书Webhook URL" />
        </Form.Item>

        <Form.Item
          name="bot_name"
          label="飞书机器人名称"
        >
          <Input placeholder="请输入飞书机器人名称" />
        </Form.Item>

        <Form.Item
          name="department_id"
          label="飞书部门ID"
        >
          <Input placeholder="请输入飞书部门ID" />
        </Form.Item>

        <Form.Item
          name="user_ids"
          label="飞书用户ID列表"
          help="多个用户ID用逗号分隔"
        >
          <Input placeholder="请输入飞书用户ID列表，多个用逗号分隔" />
        </Form.Item>

        <Form.Item
          name="message_template"
          label="消息模板"
          help="飞书消息模板，支持变量：{name}, {phone}, {email}, {content}, {created_at}"
        >
          <Input.TextArea rows={4} placeholder="请输入飞书消息模板" />
        </Form.Item>

        <Form.Item
          name="lead_notification_enabled"
          label="启用线索通知"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="operation_notification_enabled"
          label="启用操作通知"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button onClick={() => fetchFeishuConfig()} loading={loading}>
              重置
            </Button>
            <Button type="dashed" onClick={testConnection} loading={loading}>
              测试连接
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FeishuConfig;