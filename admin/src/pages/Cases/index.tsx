/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag, Form, Upload, Image, DatePicker } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { caseService } from '../../services/content';
import dayjs from 'dayjs';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../../utils/upload';

const { Option } = Select;

const Cases: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [casesList, setCasesList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [industryType, setIndustryType] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  // 分类选项
  const categoryOptions = [
    { label: '高校', value: '高校' },
    { label: '团餐', value: '团餐' },
    { label: '商超', value: '商超' },
    { label: '食品加工', value: '食品加工' },
    { label: '其他', value: '其他' },
  ];

  // 状态选项
  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已发布', value: 'published' },
  ];

  // 获取案例列表
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText,
        industry_type: industryType,
        status,
      };
      const res = await caseService.getCases(params);
      setCasesList(res.data || []);
      setTotal(res.total || 0);
    } catch (error) {
      message.error('获取案例列表失败');
    } finally {
      setLoading(false);
    }
  }, [industryType, currentPage, pageSize, searchText, status]);

  // 初始加载
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCases();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setIndustryType(undefined);
    setStatus(undefined);
    setCurrentPage(1);
    fetchCases();
  };

  // 打开新增案例模态框
  const handleAdd = () => {
    setCurrentCase(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑案例模态框
  const handleEdit = (record: any) => {
    setCurrentCase(record);
    form.setFieldsValue({
      ...record,
      published_at: record.published_at ? dayjs(record.published_at) : null,
      cover_image: record.cover_image ? [{ uid: '1', name: record.cover_image.split('/').pop(), status: 'done', url: record.cover_image }] : [],
    });
    setIsModalVisible(true);
  };

  // 打开查看案例模态框
  const handleView = (record: any) => {
    setCurrentCase(record);
    form.setFieldsValue({
      ...record,
      published_at: record.published_at ? dayjs(record.published_at) : null,
      cover_image: record.cover_image ? [{ uid: '1', name: record.cover_image.split('/').pop(), status: 'done', url: record.cover_image }] : [],
    });
    setIsModalVisible(true);
  };

  // 删除案例
  const handleDelete = async (id: number) => {
    try {
      await caseService.deleteCase(id);
      message.success('删除成功');
      fetchCases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 处理图片
      const coverImage = values.cover_image && values.cover_image[0]?.url;
      const caseData = {
        ...values,
        cover_image: coverImage,
        published_at: values.published_at ? values.published_at.format('YYYY-MM-DD HH:mm:ss') : null,
      };
      
      if (currentCase) {
        // 更新案例
        await caseService.updateCase(currentCase.id, caseData);
        message.success('更新成功');
      } else {
        // 创建案例
        await caseService.createCase(caseData);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      fetchCases();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 图片上传配置
  const uploadProps = {
    name: 'file',
    listType: 'picture-card' as const,
    className: 'avatar-uploader',
    showUploadList: true,
    accept: IMAGE_ACCEPT,
    beforeUpload: (file: any) => validateImageBeforeUpload(file, 5),
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
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
      ellipsis: true,
    },
    {
      title: '行业类型',
      dataIndex: 'industry_type',
      key: 'industry_type',
      render: (industry: string) => {
        const option = categoryOptions.find(opt => opt.value === industry);
        return <Tag color="blue">{option?.label || industry}</Tag>;
      },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: '封面图',
      dataIndex: 'cover_image',
      key: 'cover_image',
      render: (coverImage: string) => (
        <Image width={80} src={coverImage} alt="案例封面" />
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'published_at',
      key: 'published_at',
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const option = statusOptions.find(opt => opt.value === status);
        return <Tag color={status === 'published' ? 'green' : 'orange'}>{option?.label || status}</Tag>;
      },
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
            title="确定要删除这个案例吗？"
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
          <h2>案例管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增案例
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
          <Input.Search
            placeholder="搜索案例标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
        </Form.Item>

        <Form.Item label="行业类型">
          <Select
            placeholder="选择行业类型"
            allowClear
            size="middle"
            style={{ width: 120 }}
            value={industryType}
            onChange={(value) => setIndustryType(value)}
          >
            {categoryOptions.map(option => (
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
            value={status}
            onChange={(value) => setStatus(value)}
          >
            {statusOptions.map(option => (
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
        dataSource={casesList}
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

      {/* 案例表单模态框 */}
      <Modal
        title={currentCase ? '编辑案例' : '新增案例'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'draft' }}
        >
          <Form.Item
            name="customer_name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>

          <Form.Item
            name="industry_type"
            label="行业类型"
            rules={[{ required: true, message: '请选择行业类型' }]}
          >
            <Select placeholder="请选择行业类型">
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cover_image"
            label="封面图片"
          >
            <Upload {...uploadProps}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传封面图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="summary"
            label="摘要"
          >
            <Input.TextArea rows={3} placeholder="请输入案例摘要" />
          </Form.Item>

          <Form.Item
            name="detail"
            label="案例详情"
            rules={[{ required: true, message: '请输入案例详情' }]}
          >
            <Input.TextArea rows={10} placeholder="请输入案例详情" />
          </Form.Item>

          <Form.Item
            name="published_at"
            label="发布时间"
          >
            <DatePicker showTime placeholder="请选择发布时间" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择案例状态' }]}
          >
            <Select placeholder="请选择案例状态">
              {statusOptions.map(option => (
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

export default Cases;
