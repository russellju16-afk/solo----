/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Upload, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { companyService } from '../../services/company';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../../utils/upload';

const { TextArea } = Input;

const CompanyInfo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 图片上传配置（Logo 控制在 2MB 内）
  const logoUploadProps = {
    name: 'file',
    listType: 'picture-card' as const,
    className: 'avatar-uploader',
    showUploadList: true,
    accept: IMAGE_ACCEPT,
    beforeUpload: (file: any) => validateImageBeforeUpload(file, 2),
  };

  // Banner 图片可稍大，限制 5MB
  const bannerUploadProps = {
    ...logoUploadProps,
    beforeUpload: (file: any) => validateImageBeforeUpload(file, 5),
  };

  // 获取公司信息
  const fetchCompanyInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanyInfo();
      const data = (res as any)?.data || res || {};
      form.setFieldsValue({
        ...data,
        logo: data.logo ? [{ uid: '1', name: data.logo.split('/').pop(), status: 'done', url: data.logo }] : [],
        banner_image: data.banner_image ? [{ uid: '1', name: data.banner_image.split('/').pop(), status: 'done', url: data.banner_image }] : [],
      });
    } catch (error) {
      message.error('获取公司信息失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 初始加载
  useEffect(() => {
    fetchCompanyInfo();
  }, [fetchCompanyInfo]);

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 处理图片
      const logo = values.logo && values.logo[0]?.url;
      const bannerImage = values.banner_image && values.banner_image[0]?.url;
      const companyData = {
        ...values,
        logo,
        banner_image: bannerImage,
      };

      await companyService.updateCompanyInfo(companyData);
      message.success('更新成功');
    } catch (error) {
      console.error('[CompanyInfo] update error', (error as any)?.response?.data || error);
      message.error((error as any)?.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>公司信息管理</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24, maxWidth: 800 }}
      >
        <Form.Item
          name="company_name"
          label="公司名称"
          rules={[{ required: true, message: '请输入公司名称' }]}
        >
          <Input placeholder="请输入公司名称" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="公司Logo"
        >
          <Upload {...logoUploadProps}>
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传Logo</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="banner_image"
          label="首页Banner图片"
        >
          <Upload {...bannerUploadProps}>
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传Banner图片</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="short_description"
          label="公司简介"
          rules={[{ required: true, message: '请输入公司简介' }]}
        >
          <TextArea rows={4} placeholder="请输入公司简介" />
        </Form.Item>

        <Form.Item
          name="description"
          label="公司详细介绍"
        >
          <TextArea rows={8} placeholder="请输入公司详细介绍" />
        </Form.Item>

        <Form.Item
          name="address"
          label="公司地址"
          rules={[{ required: true, message: '请输入公司地址' }]}
        >
          <Input placeholder="请输入公司地址" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="联系电话"
          rules={[{ required: true, message: '请输入联系电话' }]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          name="email"
          label="电子邮箱"
          rules={[{ required: true, message: '请输入电子邮箱' }, { type: 'email', message: '请输入有效的电子邮箱' }]}
        >
          <Input placeholder="请输入电子邮箱" />
        </Form.Item>

        <Form.Item
          name="website"
          label="官方网站"
          rules={[{ type: 'url', message: '请输入有效的网址' }]}
        >
          <Input placeholder="请输入官方网站" />
        </Form.Item>

        <Form.Item
          name="contact_person"
          label="联系人"
        >
          <Input placeholder="请输入联系人姓名" />
        </Form.Item>

        <Form.Item
          name="business_hours"
          label="营业时间"
        >
          <Input placeholder="请输入营业时间" />
        </Form.Item>

        <Form.Item
          name="social_media"
          label="社交媒体"
          rules={[{ type: 'string', message: '请输入有效的JSON格式' }]}
        >
          <TextArea rows={4} placeholder='请输入社交媒体链接，JSON格式，如：{"wechat": "微信链接", "weibo": "微博链接"}' />
        </Form.Item>

        <Form.Item
          name="seo_title"
          label="SEO标题"
        >
          <Input placeholder="请输入SEO标题" />
        </Form.Item>

        <Form.Item
          name="seo_keywords"
          label="SEO关键词"
        >
          <Input placeholder="请输入SEO关键词，多个关键词用逗号分隔" />
        </Form.Item>

        <Form.Item
          name="seo_description"
          label="SEO描述"
        >
          <TextArea rows={4} placeholder="请输入SEO描述" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button onClick={() => fetchCompanyInfo()} loading={loading}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CompanyInfo;
