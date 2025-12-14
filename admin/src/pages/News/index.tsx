/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import type { UploadProps } from 'antd';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag, Form, DatePicker, Upload } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { newsService } from '../../services/content';
import { uploadImage } from '../../services/upload';
import dayjs from 'dayjs';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../../utils/upload';
import { normalizeUploadFileList } from '../../utils/uploadForm';
import ImageWithFallback from '../../components/ImageWithFallback';

const { Option } = Select;
const { RangePicker } = DatePicker;

const News: React.FC = () => {
  const placeholderCover = '/assets/placeholder-card.webp';
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentNews, setCurrentNews] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // 分类选项
  const categoryOptions = [
    { label: '公司新闻', value: '公司新闻' },
    { label: '行业资讯', value: '行业资讯' },
    { label: '行情分析', value: '行情分析' },
  ];

  // 状态选项
  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已发布', value: 'published' },
  ];

  // 获取新闻列表
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText,
        category,
        status,
        date_from: dateRange[0]?.format('YYYY-MM-DD'),
        date_to: dateRange[1]?.format('YYYY-MM-DD'),
      };
      const res = await newsService.getNews(params);
      setNewsList(res.data || []);
      setTotal(res.total || 0);
    } catch (error) {
      message.error('获取新闻列表失败');
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, dateRange, pageSize, searchText, status]);

  // 初始加载
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchNews();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setCategory(undefined);
    setStatus(undefined);
    setDateRange([null, null]);
    setCurrentPage(1);
    fetchNews();
  };

  // 打开新增新闻模态框
  const handleAdd = () => {
    setCurrentNews(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑新闻模态框
  const handleEdit = (record: any) => {
    setCurrentNews(record);
    form.setFieldsValue({
      ...record,
      published_at: record.published_at ? dayjs(record.published_at) : null,
      cover_image: record.cover_image ? [{ uid: '1', name: record.cover_image.split('/').pop(), status: 'done', url: record.cover_image }] : [],
    });
    setIsModalVisible(true);
  };

  // 打开查看新闻模态框
  const handleView = (record: any) => {
    setCurrentNews(record);
    form.setFieldsValue({
      ...record,
      published_at: record.published_at ? dayjs(record.published_at) : null,
      cover_image: record.cover_image ? [{ uid: '1', name: record.cover_image.split('/').pop(), status: 'done', url: record.cover_image }] : [],
    });
    setIsModalVisible(true);
  };

  // 删除新闻
  const handleDelete = async (id: number) => {
    try {
      await newsService.deleteNews(id);
      message.success('删除成功');
      fetchNews();
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
      const newsData = {
        ...values,
        cover_image: coverImage,
        published_at: values.published_at ? values.published_at.format('YYYY-MM-DD HH:mm:ss') : null,
      };
      
      if (currentNews) {
        // 更新新闻
        await newsService.updateNews(currentNews.id, newsData);
        message.success('更新成功');
      } else {
        // 创建新闻
        await newsService.createNews(newsData);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      fetchNews();
    } catch (error) {
      message.error('操作失败');
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

  // 图片上传配置
  const uploadProps = {
    name: 'file',
    listType: 'picture-card' as const,
    className: 'avatar-uploader',
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
        <ImageWithFallback width={80} src={coverImage} fallbackSrc={placeholderCover} alt="新闻封面" />
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
            title="确定要删除这篇新闻吗？"
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
          <h2>新闻管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增新闻
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
            placeholder="搜索新闻标题"
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
            style={{ width: 120 }}
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

        <Form.Item label="时间段">
          <RangePicker
            size="middle"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
          />
        </Form.Item>

        <Form.Item>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={newsList}
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

      {/* 新闻表单模态框 */}
      <Modal
        title={currentNews ? '编辑新闻' : '新增新闻'}
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
            rules={[{ required: true, message: '请输入新闻标题' }]}
          >
            <Input placeholder="请输入新闻标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择新闻分类' }]}
          >
            <Select placeholder="请选择新闻分类">
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
            valuePropName="fileList"
            getValueFromEvent={(e) => normalizeUploadFileList(e, { maxCount: 1 })}
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
            rules={[{ required: true, message: '请输入新闻内容' }]}
          >
            <Input.TextArea rows={10} placeholder="请输入新闻内容" />
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
            rules={[{ required: true, message: '请选择新闻状态' }]}
          >
            <Select placeholder="请选择新闻状态">
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

export default News;
