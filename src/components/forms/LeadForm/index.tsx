import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Button,
  message,
  Card,
  Typography,
} from 'antd';
import { ChannelType, CategoryInterest, MonthlyVolumeSegment, LeadPayload } from '@/types/lead';
import { AxiosError } from 'axios';
import { submitLead } from '@/services/leads';
import RegionCascader from '@/components/common/RegionCascader';
import { track } from '@/utils/track';

const { Title } = Typography;

interface LeadFormProps {
  source: string;                  // 必填：线索来源标记
  defaultChannelType?: ChannelType;
  defaultProductId?: string;
  compact?: boolean;               // 是否简化版，例如首页底部快捷表单
  onSubmitted?: () => void;        // 提交成功回调（可选）
}

// 表单值类型定义
interface LeadFormValues {
  name: string;
  phone: string;
  companyName: string;
  city?: string | string[];
  channelType: ChannelType;
  interestedCategories?: CategoryInterest[];
  monthlyVolumeSegment?: MonthlyVolumeSegment;
  brandRequirement?: string;
  description?: string;
  additionalInfo?: string; // 简化版的补充说明
}

export const LeadForm: React.FC<LeadFormProps> = ({
  source,
  defaultChannelType = 'other',
  defaultProductId,
  compact = false,
  onSubmitted,
}) => {
  // 初始化表单
  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<LeadFormValues>({
    defaultValues: {
      channelType: defaultChannelType,
      interestedCategories: [],
    },
  });

  // 映射表单值到API请求格式
  const mapFormValuesToPayload = (values: LeadFormValues): LeadPayload => {
    const cityPath = values.city;
    const cityDisplay = Array.isArray(cityPath) ? cityPath.join('/') : cityPath;

    return {
      name: values.name,
      companyName: values.companyName,
      phone: values.phone,
      city: cityDisplay,
      channelType: values.channelType,
      interestedCategories: values.interestedCategories || [],
      monthlyVolumeSegment: values.monthlyVolumeSegment,
      brandRequirement: values.brandRequirement,
      description: compact ? values.additionalInfo : values.description,
      productId: defaultProductId,
      source,
    };
  };

  // 表单提交处理
  const onSubmit = async (values: LeadFormValues) => {
    const extractErrorMessage = (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string | string[] } | undefined>;
      const backendMsg = axiosError.response?.data?.message;
      if (Array.isArray(backendMsg)) return backendMsg.join('; ');
      if (typeof backendMsg === 'string') return backendMsg;
      if (axiosError.message) return axiosError.message;
      return '提交失败，请稍后重试';
    };

    try {
      await submitLead(mapFormValuesToPayload(values));
      message.success('提交成功，我们会尽快联系您');
      track('lead_submit', { source, productId: defaultProductId, channelType: values.channelType });
      reset();
      onSubmitted?.();
      // 可选：滚动到合适位置
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const axiosError = e as AxiosError;
      console.error('[LeadForm] submit error', axiosError?.response?.data || axiosError);
      message.error(extractErrorMessage(e));
    }
  };

  // 渠道类型选项
  const channelTypeOptions = [
    { label: '高校', value: 'university' },
    { label: '团餐公司', value: 'group_catering' },
    { label: '社会餐饮', value: 'social_restaurant' },
    { label: '商超', value: 'supermarket' },
    { label: '食品厂', value: 'food_factory' },
    { label: '社区团购平台', value: 'community_group_buying' },
    { label: '线上平台', value: 'online_platform' },
    { label: '其他', value: 'other' },
  ];

  // 意向品类选项
  const categoryInterestOptions = [
    { label: '大米', value: 'rice' },
    { label: '面粉', value: 'flour' },
    { label: '食用油', value: 'oil' },
    { label: '其他', value: 'other' },
  ];

  // 月采购量选项
  const monthlyVolumeOptions = [
    { label: '小于 5 吨', value: 'lt_5t' },
    { label: '5–20 吨', value: 'between_5_20t' },
    { label: '大于 20 吨', value: 'gt_20t' },
  ];

  const onInvalid = () => {
    message.error('请先填写必填信息');
  };

  return (
    <Card className="w-full">
      <Title level={3} className="text-center mb-4">获取报价</Title>
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit, onInvalid)}
        onFinishFailed={onInvalid}
        className={`space-y-4 ${compact ? 'max-w-md mx-auto' : ''}`}
      >
        {/* 姓名 */}
        <Form.Item
          label="姓名"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: '姓名不能为空' }}
            render={({ field }) => (
              <Input placeholder="请输入您的姓名" {...field} className="w-full" />
            )}
          />
        </Form.Item>

        {/* 手机号 */}
        <Form.Item
          label="手机号"
          validateStatus={errors.phone ? 'error' : ''}
          help={errors.phone?.message}
          required
        >
          <Controller
            name="phone"
            control={control}
            rules={{
              required: '手机号不能为空',
              pattern: {
                value: /^1[3-9]\d{9}$/,
                message: '请输入有效的11位手机号',
              },
            }}
            render={({ field }) => (
              <Input placeholder="请输入您的手机号" {...field} className="w-full" />
            )}
          />
        </Form.Item>

        {/* 公司名称 */}
        <Form.Item
          label="公司名称"
          validateStatus={errors.companyName ? 'error' : ''}
          help={errors.companyName?.message}
          required
        >
          <Controller
            name="companyName"
            control={control}
            rules={{ required: '公司名称不能为空' }}
            render={({ field }) => (
              <Input placeholder="请输入您的公司名称" {...field} className="w-full" />
            )}
          />
        </Form.Item>

        {/* 采购角色 */}
        <Form.Item
          label="采购角色"
          validateStatus={errors.channelType ? 'error' : ''}
          help={errors.channelType?.message}
          required
        >
          <Controller
            name="channelType"
            control={control}
            rules={{ required: '采购角色不能为空' }}
            render={({ field }) => (
              <Select
                placeholder="请选择您的采购角色"
                options={channelTypeOptions}
                {...field}
                className="w-full"
              />
            )}
          />
        </Form.Item>

        {!compact ? (
          // 完整版表单字段
          <>
            {/* 所在城市/区县 */}
            <Form.Item
              label="所在城市/区县"
              validateStatus={errors.city ? 'error' : ''}
              help={errors.city?.message}
              required
            >
              <Controller
                name="city"
                control={control}
                rules={{ required: '请选择所在城市/区县' }}
                render={({ field }) => (
                  <RegionCascader
                    {...field}
                    value={field.value as string[] | undefined}
                    onChange={(val) => field.onChange(val)}
                    className="w-full"
                  />
                )}
              />
            </Form.Item>

            {/* 感兴趣品类 */}
            <Form.Item
              label="感兴趣品类"
              validateStatus={errors.interestedCategories ? 'error' : ''}
              help={errors.interestedCategories?.message}
              required
            >
              <Controller
                name="interestedCategories"
                control={control}
                rules={{
                  validate: (value) => (value && value.length > 0 ? true : '请选择至少一个品类'),
                }}
                render={({ field }) => (
                  <Checkbox.Group options={categoryInterestOptions} {...field} className="w-full" />
                )}
              />
            </Form.Item>

            {/* 预计每月采购量 */}
            <Form.Item
              label="预计每月采购量"
              validateStatus={errors.monthlyVolumeSegment ? 'error' : ''}
              help={errors.monthlyVolumeSegment?.message}
              required
            >
              <Controller
                name="monthlyVolumeSegment"
                control={control}
                rules={{ required: '预计每月采购量不能为空' }}
                render={({ field }) => (
                  <Radio.Group options={monthlyVolumeOptions} {...field} className="w-full space-y-2 flex flex-col" />
                )}
              />
            </Form.Item>

            {/* 指定品牌/规格需求 */}
            <Form.Item label="指定品牌/规格需求">
              <Controller
                name="brandRequirement"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    placeholder="请输入您指定的品牌或规格需求"
                    rows={3}
                    {...field}
                    className="w-full"
                  />
                )}
              />
            </Form.Item>

            {/* 需求描述 */}
            <Form.Item label="需求描述">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    placeholder="请详细描述您的需求"
                    rows={4}
                    {...field}
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </>
        ) : (
          // 简化版表单字段
          <>
            {/* 补充说明 */}
            <Form.Item label="简要需求描述">
              <Controller
                name="additionalInfo"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    placeholder="请简要描述您的需求"
                    rows={3}
                    {...field}
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </>
        )}

        {/* 提交按钮 */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full md:w-auto"
            size="large"
          >
            获取报价
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
