/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag, Form, InputNumber, Upload, Image } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { bannerService } from '../../services/content';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../../utils/upload';

const { Option } = Select;

interface BannerItem {
  id?: number;
  title?: string;
  sub_title?: string;
  image_url?: string;
  position?: string;
  enabled?: number;
  [key: string]: unknown;
}

const Banners: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [position, setPosition] = useState<string | undefined>();
  const [enabled, setEnabled] = useState<number | undefined>();

  // 位置选项
  const positionOptions = [
    { label: '首页顶部', value: 'home_top' },
    { label: '首页中部', value: 'home_middle' },
    { label: '首页底部', value: 'home_bottom' },
    { label: '产品页顶部', value: 'products_top' },
  ];

  // 获取Banner列表
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        position,
        enabled,
      };
      const res = await bannerService.getBanners(params);
      setBanners((res.data as BannerItem[]) || []);
    } catch (error) {
      message.error('获取Banner列表失败');
    } finally {
      setLoading(false);
    }
  }, [position, enabled]);

  // 初始加载
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // 搜索
  const handleSearch = () => {
    // 本地搜索（实际项目中可以通过API搜索）
    const filteredBanners = banners.filter(banner => 
      banner.title?.includes(searchText) || banner.sub_title?.includes(searchText)
    );
    setBanners(filteredBanners);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setPosition(undefined);
    setEnabled(undefined);
    fetchBanners();
  };

  // 打开新增Banner模态框
  const handleAdd = () => {
    setCurrentBanner(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑Banner模态框
  const handleEdit = (record: BannerItem) => {
    setCurrentBanner(record);
    form.setFieldsValue({
      ...record,
      image_url: record.image_url ? [{ uid: '1', name: record.image_url.split('/').pop(), status: 'done', url: record.image_url }] : [],
    });
    setIsModalVisible(true);
  };

  // 打开查看Banner模态框
  const handleView = (record: BannerItem) => {
    setCurrentBanner(record);
    form.setFieldsValue({
      ...record,
      image_url: record.image_url ? [{ uid: '1', name: record.image_url.split('/').pop(), status: 'done', url: record.image_url }] : [],
    });
    setIsModalVisible(true);
  };

  // 删除Banner
  const handleDelete = async (id: number) => {
    try {
      await bannerService.deleteBanner(id);
      message.success('删除成功');
      fetchBanners();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新Banner状态
  const handleStatusChange = async (id: number, enabled: number) => {
    try {
      await bannerService.updateBannerStatus(id, enabled);
      message.success('状态更新成功');
      fetchBanners();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 处理图片
      const imageUrl = values.image_url && values.image_url[0]?.url;
      const bannerData = {
        ...values,
        image_url: imageUrl,
      };
      
      if (currentBanner) {
        // 更新Banner
        await bannerService.updateBanner(currentBanner.id, bannerData);
        message.success('更新成功');
      } else {
        // 创建Banner
        await bannerService.createBanner(bannerData);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      fetchBanners();
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
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      render: (position: string) => {
        const option = positionOptions.find(opt => opt.value === position);
        return option?.label || position;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '副标题',
      dataIndex: 'sub_title',
      key: 'sub_title',
      ellipsis: true,
    },
    {
      title: '图片',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (imageUrl: string) => (
        <Image width={80} src={imageUrl} alt="Banner图片" />
      ),
    },
    {
      title: '链接',
      dataIndex: 'link_url',
      key: 'link_url',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: number) => (
        <Tag color={enabled === 1 ? 'green' : 'red'}>
          {enabled === 1 ? '启用' : '禁用'}
        </Tag>
      ),
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
            title="确定要删除这个Banner吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
          <Button
            type="link"
            onClick={() => handleStatusChange(record.id, record.enabled === 1 ? 0 : 1)}
          >
            {record.enabled === 1 ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <h2>Banner管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增Banner
          </Button>
        </Space>
        <Space>
          <Input.Search
            placeholder="搜索标题/副标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择位置"
            allowClear
            size="middle"
            style={{ width: 120 }}
            value={position}
            onChange={(value) => setPosition(value)}
          >
            {positionOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            size="middle"
            style={{ width: 100 }}
            value={enabled}
            onChange={(value) => setEnabled(value)}
          >
            <Option value={1}>启用</Option>
            <Option value={0}>禁用</Option>
          </Select>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Banner表单模态框 */}
      <Modal
        title={currentBanner ? '编辑Banner' : '新增Banner'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="position"
            label="位置"
            rules={[{ required: true, message: '请选择位置' }]}
          >
            <Select placeholder="请选择位置">
              {positionOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="sub_title"
            label="副标题"
          >
            <Input placeholder="请输入副标题" />
          </Form.Item>

          <Form.Item
            name="image_url"
            label="图片"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <Upload {...uploadProps}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="link_url"
            label="链接地址"
          >
            <Input placeholder="请输入链接地址" />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={0} max={1000} placeholder="请输入排序" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
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

export default Banners;
