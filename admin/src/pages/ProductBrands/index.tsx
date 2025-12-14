/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Modal, message, Popconfirm, Form, InputNumber } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { brandService } from '../../services/product';
import { getErrorMessage } from '../../utils/errorMessage';

const ProductBrands: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // 获取品牌列表
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await brandService.getBrands();
      setBrands(res.data || []);
    } catch (error) {
      message.error('获取品牌列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchBrands();
  }, []);

  // 搜索
  const handleSearch = () => {
    // 本地搜索（实际项目中可以通过API搜索）
    const filteredBrands = brands.filter(brand => 
      brand.name.includes(searchText)
    );
    setBrands(filteredBrands);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    fetchBrands();
  };

  // 打开新增品牌模态框
  const handleAdd = () => {
    setCurrentBrand(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑品牌模态框
  const handleEdit = (record: any) => {
    setCurrentBrand(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 删除品牌
  const handleDelete = async (id: number) => {
    try {
      await brandService.deleteBrand(id);
      message.success('删除成功');
      fetchBrands();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表单提交
  const onFinish = async (values: any) => {
    if (saving) return
    setSaving(true);
    try {
      if (currentBrand) {
        // 更新品牌
        await brandService.updateBrand(currentBrand.id, values);
        message.success('更新成功');
      } else {
        // 创建品牌
        await brandService.createBrand(values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      fetchBrands();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
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
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
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
      width: 150,
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个品牌吗？"
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
          <h2>品牌管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增品牌
          </Button>
        </Space>
        <Space>
          <Space.Compact style={{ width: 300 }}>
            <Input
              placeholder="搜索品牌名称"
              allowClear
              size="middle"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button size="middle" icon={<SearchOutlined />} onClick={handleSearch} aria-label="搜索" />
          </Space.Compact>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* 品牌表单模态框 */}
      <Modal
        title={currentBrand ? '编辑品牌' : '新增品牌'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ sort_order: 0 }}
        >
          <Form.Item
            name="name"
            label="品牌名称"
            rules={[
              { required: true, message: '请输入品牌名称' },
              { min: 1, max: 50, message: '品牌名称长度为1-50个字符' },
            ]}
          >
            <Input placeholder="请输入品牌名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{
              max: 200, message: '描述长度不超过200个字符',
            }]}
          >
            <Input.TextArea rows={3} placeholder="请输入品牌描述" />
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
              <Button type="primary" htmlType="submit" loading={saving} disabled={saving}>
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

export default ProductBrands;
