/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import type { UploadProps } from 'antd';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag, Form, InputNumber, Upload } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { solutionService } from '../../services/content';
import { uploadImage } from '../../services/upload';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../../utils/upload';
import { getSingleUploadUrl, normalizeUploadFileList, toSingleImageFileList } from '../../utils/uploadForm';
import ImageWithFallback from '../../components/ImageWithFallback';
import { getErrorMessage } from '../../utils/errorMessage';

const { Option } = Select;

const Solutions: React.FC = () => {
  const placeholderCover = '/assets/placeholder-card.webp';
  const [loading, setLoading] = useState(false);
  const [solutionsList, setSolutionsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [channelType, setChannelType] = useState<string | undefined>();
  const [enabled, setEnabled] = useState<number | undefined>();

  // 分类选项
  const channelOptions = [
    { label: '粮油贸易解决方案', value: 'grain_trade' },
    { label: '物流配送解决方案', value: 'logistics' },
    { label: '仓储管理解决方案', value: 'warehousing' },
    { label: '供应链金融解决方案', value: 'finance' },
    { label: '其他解决方案', value: 'other' },
  ];

  // 状态选项
  const enabledOptions = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ];

  // 获取解决方案列表
  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText,
        channel_type: channelType,
        enabled,
      };
      const res = await solutionService.getSolutions(params);
      setSolutionsList(res.data || []);
      setTotal(res.total || 0);
    } catch (error) {
      message.error('获取解决方案列表失败');
    } finally {
      setLoading(false);
    }
  }, [channelType, currentPage, pageSize, searchText, enabled]);

  // 初始加载
  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchSolutions();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setChannelType(undefined);
    setEnabled(undefined);
    setCurrentPage(1);
    fetchSolutions();
  };

  // 打开新增解决方案模态框
  const handleAdd = () => {
    setCurrentSolution(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑解决方案模态框
  const handleEdit = (record: any) => {
    setCurrentSolution(record);
    form.setFieldsValue({
      ...record,
      cover_image: toSingleImageFileList(record.cover_image, `cover-${record.id}`),
      pain_points: record.pain_points?.join('\n'),
      solutions: record.solutions?.join('\n'),
      product_ids: record.product_ids?.join(','),
    });
    setIsModalVisible(true);
  };

  // 打开查看解决方案模态框
  const handleView = (record: any) => {
    setCurrentSolution(record);
    form.setFieldsValue({
      ...record,
      cover_image: toSingleImageFileList(record.cover_image, `cover-${record.id}`),
      pain_points: record.pain_points?.join('\n'),
      solutions: record.solutions?.join('\n'),
      product_ids: record.product_ids?.join(','),
    });
    setIsModalVisible(true);
  };

  // 删除解决方案
  const handleDelete = async (id: number) => {
    try {
      await solutionService.deleteSolution(id);
      message.success('删除成功');
      fetchSolutions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const coverImage = getSingleUploadUrl(values.cover_image);
      const solutionData = {
        ...values,
        cover_image: coverImage,
        pain_points: values.pain_points
          ? values.pain_points.split('\n').map((item: string) => item.trim()).filter((item: string) => item)
          : [],
        solutions: values.solutions
          ? values.solutions.split('\n').map((item: string) => item.trim()).filter((item: string) => item)
          : [],
        product_ids: values.product_ids
          ? values.product_ids.split(',').map((id: string) => Number(id.trim())).filter((id: number) => !Number.isNaN(id))
          : [],
      };
      
      if (currentSolution) {
        // 更新解决方案
        await solutionService.updateSolution(currentSolution.id, solutionData);
        message.success('更新成功');
      } else {
        // 创建解决方案
        await solutionService.createSolution(solutionData);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      fetchSolutions();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

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

  const uploadProps = {
    name: 'file',
    listType: 'picture-card' as const,
    showUploadList: true,
    accept: IMAGE_ACCEPT,
    beforeUpload: (file: any) => validateImageBeforeUpload(file, 5),
    maxCount: 1,
    customRequest: uploadRequest,
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '封面',
      dataIndex: 'cover_image',
      key: 'cover_image',
      width: 110,
      render: (coverImage: string) => (
        <ImageWithFallback width={80} src={coverImage} fallbackSrc={placeholderCover} alt="封面" />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '渠道类型',
      dataIndex: 'channel_type',
      key: 'channel_type',
      render: (channel: string) => {
        const option = channelOptions.find(opt => opt.value === channel);
        return <Tag color="blue">{option?.label || channel}</Tag>;
      },
    },
    {
      title: '简介',
      dataIndex: 'intro',
      key: 'intro',
      ellipsis: true,
    },
    {
      title: '痛点',
      dataIndex: 'pain_points',
      key: 'pain_points',
      render: (painPoints: string[]) => (
        <Space wrap>
          {painPoints?.map((item, index) => (
            <Tag key={index} color="volcano">{item}</Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (status: number) => {
        const option = enabledOptions.find(opt => opt.value === status);
        return <Tag color={status === 1 ? 'green' : 'red'}>{option?.label || status}</Tag>;
      },
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个解决方案吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <h2>解决方案管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增解决方案
          </Button>
        </Space>
      </div>

      {/* 筛选表单 */}
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="搜索">
          <Space.Compact style={{ width: 300 }}>
            <Input
              placeholder="搜索解决方案标题"
              allowClear
              size="middle"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button size="middle" icon={<SearchOutlined />} onClick={handleSearch} aria-label="搜索" />
          </Space.Compact>
        </Form.Item>

        <Form.Item label="渠道类型">
          <Select
            placeholder="选择渠道类型"
            allowClear
            size="middle"
            style={{ width: 150 }}
            value={channelType}
            onChange={(value) => setChannelType(value)}
          >
            {channelOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="状态">
          <Select
            placeholder="选择状态"
            allowClear
            size="middle"
            style={{ width: 120 }}
            value={enabled}
            onChange={(value) => setEnabled(value)}
          >
            {enabledOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={solutionsList}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
      />

      {/* 解决方案表单模态框 */}
      <Modal
        title={currentSolution ? '编辑解决方案' : '新增解决方案'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ enabled: 1, sort_order: 0 }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入解决方案标题' }]}
          >
            <Input placeholder="请输入解决方案标题" />
          </Form.Item>

          <Form.Item
            name="channel_type"
            label="渠道类型"
            rules={[{ required: true, message: '请选择渠道类型' }]}
          >
            <Select placeholder="请选择渠道类型">
              {channelOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cover_image"
            label="封面图"
            valuePropName="fileList"
            getValueFromEvent={(e) => normalizeUploadFileList(e, { maxCount: 1 })}
          >
            <Upload {...uploadProps}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传封面</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="intro"
            label="简介"
          >
            <Input.TextArea rows={4} placeholder="请输入解决方案简介" />
          </Form.Item>

          <Form.Item
            name="pain_points"
            label="客户痛点（每行一条）"
          >
            <Input.TextArea rows={4} placeholder="请输入痛点，一行一条" />
          </Form.Item>

          <Form.Item
            name="solutions"
            label="解决方案（每行一条）"
          >
            <Input.TextArea rows={4} placeholder="请输入解决方案要点，一行一条" />
          </Form.Item>

          <Form.Item
            name="product_ids"
            label="关联产品ID（逗号分隔，可选）"
          >
            <Input placeholder="例如：1,2,3" />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="排序值，数字越小越靠前" />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="状态"
            rules={[{ required: true, message: '请选择解决方案状态' }]}
          >
            <Select placeholder="请选择解决方案状态">
              {enabledOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Solutions;
