/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { categoryService } from '../../services/product';

const { Title, Paragraph } = Typography;

type Props = {
  onChanged?: () => void;
};

const CategoriesPanel: React.FC<Props> = ({ onChanged }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await categoryService.getCategories();
      const list = Array.isArray(res) ? res : res?.data || [];
      setCategories(list);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '获取分类列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const keyword = searchText.trim();
    if (!keyword) return categories;
    return categories.filter(category => String(category?.name || '').includes(keyword));
  }, [categories, searchText]);

  const handleAdd = () => {
    setCurrentCategory(null);
    form.resetFields();
    form.setFieldsValue({ sort_order: 0 });
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setCurrentCategory(record);
    form.setFieldsValue({
      name: record?.name,
      description: record?.description,
      sort_order: record?.sort_order ?? 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
      onChanged?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '删除失败';
      message.error(msg);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      if (currentCategory?.id) {
        await categoryService.updateCategory(currentCategory.id, values);
        message.success('更新成功');
      } else {
        await categoryService.createCategory(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      setCurrentCategory(null);
      form.resetFields();
      fetchCategories();
      onChanged?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '操作失败';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？删除后相关产品筛选将失效。"
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
      <div className="products-panel-header">
        <div>
          <Title level={4} className="products-panel-title">
            产品分类
          </Title>
          <Paragraph className="products-panel-subtitle">
            维护产品分类，用于产品筛选与归类展示。
          </Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增分类
          </Button>
        </Space>
      </div>

      <div className="products-filters">
        <Space size="middle" wrap>
          <Input
            placeholder="搜索分类名称"
            allowClear
            style={{ width: 300, minWidth: 240 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Button onClick={() => setSearchText('')} disabled={!searchText}>
            重置
          </Button>
        </Space>
      </div>

      <Table
        className="products-table"
        columns={columns}
        dataSource={filteredCategories}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={currentCategory ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setCurrentCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ sort_order: 0 }}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { min: 1, max: 50, message: '分类名称长度为1-50个字符' },
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item name="description" label="描述" rules={[{ max: 100, message: '描述长度不超过100个字符' }]}>
            <Input.TextArea rows={3} placeholder="请输入分类描述（选填）" />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
            rules={[
              { required: true, message: '请输入排序' },
              { type: 'number', message: '请输入数字' },
            ]}
          >
            <InputNumber min={0} max={1000} placeholder="请输入排序" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                提交
              </Button>
              <Button
                onClick={() => {
                  if (currentCategory) {
                    handleEdit(currentCategory);
                  } else {
                    form.resetFields();
                    form.setFieldsValue({ sort_order: 0 });
                  }
                }}
                disabled={saving}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPanel;
