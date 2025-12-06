import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';

import { productService, categoryService, brandService } from '../../services/product';
import ProductForm from '../../components/ProductForm';

const { Option } = Select;

const Products: React.FC = () => {

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [brandId, setBrandId] = useState<number | undefined>();
  const [status, setStatus] = useState<number | undefined>();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data);
      } catch (error) {
        message.error('获取分类失败');
      }
    };
    fetchCategories();
  }, []);

  // 获取品牌列表
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandService.getBrands();
        setBrands(res.data);
      } catch (error) {
        message.error('获取品牌失败');
      }
    };
    fetchBrands();
  }, []);

  // 获取产品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText,
        category_id: categoryId,
        brand_id: brandId,
        status,
      };
      const res = await productService.getProducts(params);
      setProducts(res.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      message.error('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选条件变化时重新获取产品列表
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchText, categoryId, brandId, status]);

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  // 重置搜索条件
  const handleReset = () => {
    setSearchText('');
    setCategoryId(undefined);
    setBrandId(undefined);
    setStatus(undefined);
    setCurrentPage(1);
    fetchProducts();
  };

  // 打开新增产品模态框
  const handleAdd = () => {
    setCurrentProduct(null);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  // 打开编辑产品模态框
  const handleEdit = (record: any) => {
    setCurrentProduct(record);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  // 打开查看产品模态框
  const handleView = (record: any) => {
    setCurrentProduct(record);
    setIsViewMode(true);
    setIsModalVisible(true);
  };

  // 删除产品
  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success('删除成功');
      fetchProducts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新产品状态
  const handleStatusChange = async (id: number, status: number) => {
    try {
      await productService.updateProductStatus(id, status);
      message.success('状态更新成功');
      fetchProducts();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 表单提交成功后关闭模态框并刷新列表
  const handleFormSuccess = () => {
    setIsModalVisible(false);
    fetchProducts();
    message.success('操作成功');
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
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => category?.name || '-',
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand: any) => brand?.name || '-',
    },
    {
      title: '规格',
      dataIndex: 'spec_weight',
      key: 'spec_weight',
    },
    {
      title: '包装类型',
      dataIndex: 'package_type',
      key: 'package_type',
    },
    {
      title: '适用场景',
      dataIndex: 'applicable_scenes',
      key: 'applicable_scenes',
      render: (scenes: string[]) => (
        <Space>
          {scenes?.map((scene, index) => (
            <Tag key={index}>{scene}</Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个产品吗？"
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
            onClick={() => handleStatusChange(record.id, record.status === 1 ? 0 : 1)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <h2>产品列表</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增产品
          </Button>
        </Space>
        <Space>
          <Input.Search
            placeholder="搜索产品名称"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择品类"
            style={{ width: 120 }}
            value={categoryId}
            onChange={setCategoryId}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择品牌"
            style={{ width: 120 }}
            value={brandId}
            onChange={setBrandId}
            allowClear
          >
            {brands.map((brand) => (
              <Option key={brand.id} value={brand.id}>
                {brand.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            style={{ width: 100 }}
            value={status}
            onChange={setStatus}
            allowClear
          >
            <Option value={1}>上架</Option>
            <Option value={0}>下架</Option>
          </Select>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={products}
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

      {/* 产品表单模态框 */}
      <Modal
        title={isViewMode ? '查看产品' : currentProduct ? '编辑产品' : '新增产品'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProductForm
          product={currentProduct}
          categories={categories}
          brands={brands}
          isViewMode={isViewMode}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default Products;