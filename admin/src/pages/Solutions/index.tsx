/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag, Form, Upload, Image, DatePicker } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { solutionService } from '../../services/content';
import dayjs from 'dayjs';

const { Option } = Select;

const Solutions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [solutionsList, setSolutionsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  // 分类选项
  const categoryOptions = [
    { label: '粮油贸易解决方案', value: 'grain_trade' },
    { label: '物流配送解决方案', value: 'logistics' },
    { label: '仓储管理解决方案', value: 'warehousing' },
    { label: '供应链金融解决方案', value: 'finance' },
    { label: '其他解决方案', value: 'other' },
  ];

  // 状态选项
  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已发布', value: 'published' },
  ];

  // 获取解决方案列表
  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText,
        category,
        status,
      };
      const res = await solutionService.getSolutions(params);
      setSolutionsList(res.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      message.error('获取解决方案列表失败');
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, pageSize, searchText, status]);

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
    setCategory(undefined);
    setStatus(undefined);
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
      published_at: record.published_at ? dayjs(record.published_at) : null,
      cover_image: record.cover_image ? [{ uid: '1', name: record.cover_image.split('/').pop(), status: 'done', url: record.cover_image }] : [],
    });
    setIsModalVisible(true);
  };

  // 打开查看解决方案模态框
  const handleView = (record: any) => {
    setCurrentSolution(record);
    form.setFieldsValue({
      ...record,
      published_at: record.published_at ? dayjs(record.published_at) : null,
      cover_image: record.cover_image ? [{ uid: '1', name: record.cover_image.split('/').pop(), status: 'done', url: record.cover_image }] : [],
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
      // 处理图片
      const coverImage = values.cover_image && values.cover_image[0]?.url;
      const solutionData = {
        ...values,
        cover_image: coverImage,
        published_at: values.published_at ? values.published_at.format('YYYY-MM-DD HH:mm:ss') : null,
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
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    beforeUpload: () => false, // 手动上传
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const option = categoryOptions.find(opt => opt.value === category);
        return <Tag color="blue">{option?.label || category}</Tag>;
      },
    },
    {
      title: '封面图',
      dataIndex: 'cover_image',
      key: 'cover_image',
      render: (coverImage: string) => (
        <Image width={80} src={coverImage} alt="解决方案封面" />
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
          <Input.Search
            placeholder="搜索解决方案标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
        </Form.Item>

        <Form.Item label="分类">
          <Select
            placeholder="选择分类"
            allowClear
            size="middle"
            style={{ width: 150 }}
            value={category}
            onChange={(value) => setCategory(value)}
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
          initialValues={{ status: 'draft' }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入解决方案标题' }]}
          >
            <Input placeholder="请输入解决方案标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择解决方案分类' }]}
          >
            <Select placeholder="请选择解决方案分类">
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
            rules={[{ required: true, message: '请上传封面图片' }]}
          >
            <Upload {...uploadProps}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传封面图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入解决方案内容' }]}
          >
            <Input.TextArea rows={10} placeholder="请输入解决方案内容" />
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
            rules={[{ required: true, message: '请选择解决方案状态' }]}
          >
            <Select placeholder="请选择解决方案状态">
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

export default Solutions;
