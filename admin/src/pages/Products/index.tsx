/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Typography, message, Input } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, TagsOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { brandService, categoryService, productService } from '../../services/product';
import ProductForm from '../../components/ProductForm';
import CategoriesPanel from './CategoriesPanel';
import './index.css';

const { Option } = Select;
const { Title, Paragraph } = Typography;

type ProductsTabKey = 'products' | 'categories';

const normalizeTab = (value: string | null): ProductsTabKey => {
  if (value === 'categories') return 'categories';
  return 'products';
};

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: ProductsTabKey = useMemo(() => normalizeTab(searchParams.get('tab')), [searchParams]);

  const setTab = (nextTab: ProductsTabKey) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', nextTab);
    setSearchParams(next);
  };

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

  const refreshCategories = useCallback(async () => {
    try {
      const res: any = await categoryService.getCategories();
      const list = Array.isArray(res) ? res : res?.data || [];
      setCategories(list);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '获取分类失败';
      message.error(msg);
    }
  }, []);

  const refreshBrands = useCallback(async () => {
    try {
      const res: any = await brandService.getBrands();
      const list = Array.isArray(res) ? res : res?.data || [];
      setBrands(list);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '获取品牌失败';
      message.error(msg);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
    refreshBrands();
  }, [refreshBrands, refreshCategories]);

  useEffect(() => {
    if (!categoryId) return;
    const exists = categories.some((category: any) => category?.id === categoryId);
    if (exists) return;
    setCategoryId(undefined);
    message.warning('当前选择的品类已被删除，已自动清空筛选条件');
  }, [categories, categoryId]);

  // 获取产品列表
  const fetchProducts = useCallback(async () => {
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
      const res: any = await productService.getProducts(params);
      setProducts(res?.data || []);
      setTotal(res?.total || 0);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '获取产品列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [brandId, categoryId, currentPage, pageSize, searchText, status]);

  // 初始加载和筛选条件变化时重新获取产品列表
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleReset = () => {
    setSearchText('');
    setCategoryId(undefined);
    setBrandId(undefined);
    setStatus(undefined);
    setCurrentPage(1);
    fetchProducts();
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setCurrentProduct(record);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  const handleView = (record: any) => {
    setCurrentProduct(record);
    setIsViewMode(true);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success('删除成功');
      fetchProducts();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '删除失败';
      message.error(msg);
    }
  };

  const handleStatusChange = async (id: number, nextStatus: number) => {
    try {
      await productService.updateProductStatus(id, nextStatus);
      message.success('状态更新成功');
      fetchProducts();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '状态更新失败';
      message.error(msg);
    }
  };

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    fetchProducts();
    message.success('操作成功');
  };

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
      width: 120,
    },
    {
      title: '包装类型',
      dataIndex: 'package_type',
      key: 'package_type',
      width: 140,
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
      width: 120,
      render: (value: number) => <Tag color={value === 1 ? 'green' : 'red'}>{value === 1 ? '上架' : '下架'}</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (time: string) => (time ? new Date(time).toLocaleString() : '--'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
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
          <Button type="link" onClick={() => handleStatusChange(record.id, record.status === 1 ? 0 : 1)}>
            {record.status === 1 ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="products-header">
        <div>
          <Title level={3} className="products-header-title">
            产品库
          </Title>
          <Paragraph className="products-header-subtitle">
            在同一页面管理产品列表与产品分类。
          </Paragraph>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增产品
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchProducts} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        className="products-tabs"
        activeKey={activeTab}
        onChange={(key) => setTab(key as ProductsTabKey)}
        destroyOnHidden={false}
        items={[
          {
            key: 'products',
            label: '产品列表',
            children: (
              <>
                <div className="products-filters">
                  <Space size="middle" wrap>
                    <Space.Compact style={{ width: 320, minWidth: 260 }}>
                      <Input
                        placeholder="搜索产品名称"
                        allowClear
                        size="middle"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                      />
                      <Button size="middle" icon={<SearchOutlined />} onClick={handleSearch} aria-label="搜索" />
                    </Space.Compact>
                    <Select
                      placeholder="选择品类"
                      style={{ width: 180, minWidth: 160 }}
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
                    <Button
                      type="link"
                      icon={<TagsOutlined />}
                      onClick={() => setTab('categories')}
                      style={{ paddingInline: 4 }}
                    >
                      管理分类
                    </Button>
                    <Select
                      placeholder="选择品牌"
                      style={{ width: 180, minWidth: 160 }}
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
                      style={{ width: 160, minWidth: 140 }}
                      value={status}
                      onChange={setStatus}
                      allowClear
                    >
                      <Option value={1}>上架</Option>
                      <Option value={0}>下架</Option>
                    </Select>
                    <Button onClick={handleReset} disabled={loading}>
                      重置
                    </Button>
                  </Space>
                </div>

                <Table
                  className="products-table"
                  columns={columns}
                  dataSource={products}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    onChange: (page, nextPageSize) => {
                      setCurrentPage(page);
                      setPageSize(nextPageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (totalCount, range) => `第${range[0]}-${range[1]}条，共${totalCount}条`,
                    position: ['bottomRight'],
                  }}
                />
              </>
            ),
          },
          {
            key: 'categories',
            label: '产品分类',
            children: (
              <CategoriesPanel
                onChanged={() => {
                  refreshCategories();
                }}
              />
            ),
          },
        ]}
      />

      <Modal
        title={isViewMode ? '查看产品' : currentProduct ? '编辑产品' : '新增产品'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
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
