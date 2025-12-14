/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { UploadProps } from 'antd';
import { Form, Input, Button, message, Upload, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { companyService } from '../../services/company';
import { uploadImage } from '../../services/upload';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../../utils/upload';
import { normalizeUploadFileList } from '../../utils/uploadForm';

const { TextArea } = Input;

function getDefaultCompanyInfoTemplate() {
  return {
    company_name: '西安超群粮油贸易有限公司',
    short_description: '西安本地仓储配送的粮油批发服务商，服务高校、团餐、商超、食品厂等客户。',
    introduction:
      '我们专注于大米、面粉、食用油等粮油产品的批发供应与仓储配送服务，为客户提供稳定、可追溯的采购体验。',
    description:
      '西安超群粮油贸易有限公司长期深耕粮油供应链，建立了标准化选品、仓储管理与配送体系。我们与多家优质产地与品牌建立合作，提供多规格大米/面粉/食用油及相关配套产品，支持定制化供货、阶段性备货与到店/到仓配送。\n\n服务优势：\n- 供应稳定：常备核心SKU，支持批量/周期供货\n- 质量可控：严格把控进货与存储条件，保障品质安全\n- 配送高效：西安及周边区域支持当日/次日配送\n- 响应及时：专属对接，报价与售后更高效',
    service_areas: '西安市及周边区域（可按项目需求扩展）',
    service_channels: '高校,团餐公司,社会餐饮,商超,食品厂,社区团购平台,线上平台',
    address: '陕西省西安市未央区（示例地址，可在后台修改）',
    phone: '029-86543210',
    email: 'info@chaoqun-liangyou.com',
    website: 'https://www.chaoqun-liangyou.com',
    contact_person: '市场部',
    business_hours: '周一至周六 08:30-18:00（节假日可预约）',
    social_media: JSON.stringify({ wechat: '超群粮油', weibo: '', douyin: '' }),
    seo_title: '西安超群粮油贸易有限公司 - 粮油批发 / 仓储配送',
    seo_keywords: '西安粮油批发,大米批发,食用油批发,团餐供应,高校食材配送',
    seo_description:
      '西安超群粮油贸易有限公司，提供大米、面粉、食用油等粮油批发与仓储配送服务，支持高校、团餐、商超、食品厂等客户。',
    logo: '',
    banner_image: '',
    wechat_qr_code: '',
  };
}

const CompanyInfo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const isDev = import.meta.env.DEV;

  const defaultTemplate = useMemo(() => getDefaultCompanyInfoTemplate(), []);

  const uploadRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      const resp = await uploadImage(file as File, {
        onProgress: (percent) => onProgress?.({ percent }, file as any),
      });
      onSuccess?.(resp as any);
    } catch (error) {
      onError?.(error as any);
    }
  };

  // 图片上传配置（Logo 控制在 2MB 内）
  const logoUploadProps = {
    name: 'file',
    listType: 'picture-card' as const,
    className: 'avatar-uploader',
    showUploadList: true,
    accept: IMAGE_ACCEPT,
    beforeUpload: (file: any) => validateImageBeforeUpload(file, 2),
    maxCount: 1,
    customRequest: uploadRequest,
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
        logo: data.logo ? [{ uid: 'logo', name: data.logo.split('/').pop(), status: 'done', url: data.logo }] : [],
        banner_image: data.banner_image ? [{ uid: 'banner', name: data.banner_image.split('/').pop(), status: 'done', url: data.banner_image }] : [],
        wechat_qr_code: data.wechat_qr_code
          ? [{ uid: 'wechat', name: data.wechat_qr_code.split('/').pop(), status: 'done', url: data.wechat_qr_code }]
          : [],
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
      const logo = values.logo?.[0]?.url || '';
      const bannerImage = values.banner_image?.[0]?.url || '';
      const wechatQr = values.wechat_qr_code?.[0]?.url || '';
      const companyData = {
        ...values,
        logo,
        banner_image: bannerImage,
        wechat_qr_code: wechatQr,
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

  const handleInitTemplate = async () => {
    if (!isDev) return;
    const ok = window.confirm('将使用默认模板覆盖并保存公司信息（可在保存后继续编辑），是否继续？');
    if (!ok) return;

    setLoading(true);
    try {
      await companyService.updateCompanyInfo(defaultTemplate);
      message.success('已初始化公司信息模板');
      await fetchCompanyInfo();
    } catch (error: any) {
      console.error('[CompanyInfo] init template error', error?.response?.data || error);
      message.error(error?.response?.data?.message || '初始化失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0 }}>公司信息管理</h2>
        {isDev ? (
          <Button onClick={handleInitTemplate} disabled={loading}>
            一键填充默认模板（dev）
          </Button>
        ) : null}
      </div>
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
          valuePropName="fileList"
          getValueFromEvent={(e) => normalizeUploadFileList(e, { maxCount: 1 })}
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
          valuePropName="fileList"
          getValueFromEvent={(e) => normalizeUploadFileList(e, { maxCount: 1 })}
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

        <Form.Item name="introduction" label="公司介绍（用于 About / SEO）">
          <TextArea rows={4} placeholder="用于关于我们页的简短介绍（可选）" />
        </Form.Item>

        <Form.Item
          name="description"
          label="公司详细介绍"
        >
          <TextArea rows={8} placeholder="请输入公司详细介绍" />
        </Form.Item>

        <Form.Item name="service_areas" label="服务区域">
          <TextArea rows={3} placeholder="示例：西安及周边区域（可按项目需求扩展）" />
        </Form.Item>

        <Form.Item name="service_channels" label="服务渠道（逗号分隔）">
          <Input placeholder="示例：高校,团餐公司,商超,食品厂" />
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
          name="wechat_qr_code"
          label="微信二维码"
          valuePropName="fileList"
          getValueFromEvent={(e) => normalizeUploadFileList(e, { maxCount: 1 })}
        >
          <Upload {...bannerUploadProps}>
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传二维码</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="social_media"
          label="社交媒体"
          rules={[
            {
              validator: async (_, value) => {
                if (!value) return Promise.resolve();
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch (err) {
                  return Promise.reject(new Error('请输入有效的 JSON 格式'));
                }
              },
            },
          ]}
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
