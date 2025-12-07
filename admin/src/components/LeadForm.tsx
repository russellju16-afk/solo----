/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { leadService } from '../services/lead';

const { Option } = Select;

interface LeadFormProps {
  lead?: any;
  isViewMode: boolean;
  onSuccess: () => void;
}

const channelTypeOptions = [
  { label: '高校', value: '高校' },
  { label: '团餐', value: '团餐' },
  { label: '社会餐饮', value: '社会餐饮' },
  { label: '商超', value: '商超' },
  { label: '食品厂', value: '食品厂' },
  { label: '平台', value: '平台' },
  { label: '其他', value: '其他' },
];

const interestedCategoriesOptions = [
  { label: '大米', value: '大米' },
  { label: '面粉', value: '面粉' },
  { label: '食用油', value: '食用油' },
  { label: '其他', value: '其他' },
];

const monthlyVolumeSegmentOptions = [
  { label: '0-10吨', value: '0-10' },
  { label: '10-50吨', value: '10-50' },
  { label: '50-100吨', value: '50-100' },
  { label: '100吨以上', value: '100+' },
];

const statusOptions = [
  { label: '未处理', value: 'pending' },
  { label: '跟进中', value: 'processing' },
  { label: '已成交', value: 'closed' },
  { label: '无效', value: 'invalid' },
];

const sourceOptions = [
  { label: '首页表单', value: 'home_short_form' },
  { label: '联系我们', value: 'contact_page' },
  { label: '产品详情', value: 'product_detail' },
  { label: '其他', value: 'other' },
];

const LeadForm: React.FC<LeadFormProps> = ({ lead, isViewMode, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (lead) {
      form.setFieldsValue({
        ...lead,
      });
    } else {
      form.resetFields();
    }
  }, [lead, form]);

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (lead) {
        // 更新线索
        await leadService.updateLead(lead.id, values);
      } else {
        // 创建线索
        await leadService.createLead(values);
      }
      onSuccess();
    } catch (error) {
      // 错误处理由http拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={isViewMode}
    >
      {/* 基本信息 */}
      <h3>基本信息</h3>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="company_name"
          label="公司名称"
        >
          <Input placeholder="请输入公司名称" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="电话"
          rules={[
            { required: true, message: '请输入电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
          ]}
        >
          <Input placeholder="请输入电话" />
        </Form.Item>

        <Form.Item
          name="city"
          label="城市"
        >
          <Input placeholder="请输入城市" />
        </Form.Item>

        <Form.Item
          name="channel_type"
          label="渠道类型"
          rules={[{ required: true, message: '请选择渠道类型' }]}
        >
          <Select placeholder="请选择渠道类型">
            {channelTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="source"
          label="来源"
          rules={[{ required: true, message: '请选择来源' }]}
        >
          <Select placeholder="请选择来源">
            {sourceOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Space>

      {/* 业务信息 */}
      <h3 style={{ marginTop: 24 }}>业务信息</h3>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="interested_categories"
          label="意向品类"
          rules={[{ required: true, message: '请选择意向品类' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择意向品类"
          >
            {interestedCategoriesOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="monthly_volume_segment"
          label="月度用量区间"
        >
          <Select placeholder="请选择月度用量区间">
            {monthlyVolumeSegmentOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="brand_requirement"
          label="品牌要求"
        >
          <Input placeholder="请输入品牌要求" />
        </Form.Item>

        <Form.Item
          name="description"
          label="需求描述"
        >
          <Input.TextArea rows={4} placeholder="请输入需求描述" />
        </Form.Item>

        <Form.Item
          name="product_id"
          label="关联产品ID"
        >
          <Input type="number" placeholder="请输入关联产品ID" />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="owner_id"
          label="负责人ID"
        >
          <Input type="number" placeholder="请输入负责人ID" />
        </Form.Item>
      </Space>

      {/* 提交按钮 */}
      {!isViewMode && (
        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
            <Button htmlType="reset">重置</Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

export default LeadForm;
