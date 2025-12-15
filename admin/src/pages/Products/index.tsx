/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Typography, message, Input } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, TagsOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { brandService, categoryService, productService } from '../../services/product';
import ProductForm from '../../components/ProductForm';
import CategoriesPanel, { type CategoryPanelRef } from './CategoriesPanel';
import BrandPanel, { type BrandPanelRef } from './BrandPanel';
import './index.css';

const { Title, Paragraph } = Typography;

type ProductsTabKey = 'products' | 'categories' | 'brand';

const normalizeTab = (value: string | null): ProductsTabKey => {
  if (value === 'categories') return 'categories';
  if (value === 'brand') return 'brand';
  return 'products';
};

const ProductsPage: React.FC = () => {
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
  const [headerRefreshing, setHeaderRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const categoryPanelRef = useRef<CategoryPanelRef | null>(null);
  const brandPanelRef = useRef<BrandPanelRef | null>(null);

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

  const categorySelectOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category?.name,
        value: category?.id,
      })),
    [categories],
  );

  const brandSelectOptions = useMemo(
    () =>
      brands.map((brand) => ({
        label: brand?.name,
        value: brand?.id,
      })),
    [brands],
  );

  const statusSelectOptions = useMemo(
    () => [
      { label: '上架', value: 1 },
      { label: '下架', value: 0 },
    ],
    [],
  );

  useEffect(() => {
    if (!categoryId) return;
    const exists = categories.some((category: any) => category?.id === categoryId);
    if (exists) return;
    setCategoryId(undefined);
    message.warning('当前选择的品类已被删除，已自动清空筛选条件');
  }, [categories, categoryId]);

  useEffect(() => {
    if (!brandId) return;
    const exists = brands.some((brand: any) => brand?.id === brandId);
    if (exists) return;
    setBrandId(undefined);
    message.warning('当前选择的品牌已被删除，已自动清空筛选条件');
  }, [brands, brandId]);

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

  const handleHeaderRefresh = useCallback(async () => {
    if (activeTab === 'products') {
      await fetchProducts();
      return;
    }

    setHeaderRefreshing(true);
    try {
      if (activeTab === 'categories') {
        await categoryPanelRef.current?.refresh();
      }
      if (activeTab === 'brand') {
        await brandPanelRef.current?.refresh();
      }
    } finally {
      setHeaderRefreshing(false);
    }
  }, [activeTab, fetchProducts]);

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

  const ActionCell: React.FC<{ record: any }> = ({ record }) => {
    const [open, setOpen] = useState(false);
    const nextStatus = record?.status === 1 ? 0 : 1;
    const statusLabel = record?.status === 1 ? '下架' : '上架';

    return (
      <Space size={6} wrap>
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          查看
        </Button>
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>
        <Dropdown
          trigger={['click']}
          open={open}
          onOpenChange={setOpen}
          placement="bottomRight"
          popupRender={() => (
            <div className="products-action-dropdown" onClick={(event) => event.stopPropagation()}>
              <Button
                type="text"
                block
                onClick={() => {
                  handleStatusChange(record.id, nextStatus);
                  setOpen(false);
                }}
              >
                {statusLabel}
              </Button>
              <Popconfirm
                title="确定要删除这个产品吗？"
                onConfirm={() => {
                  handleDelete(record.id);
                  setOpen(false);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button type="text" danger block icon={<DeleteOutlined />} onClick={(event) => event.stopPropagation()}>
                  删除
                </Button>
              </Popconfirm>
            </div>
          )}
        >
          <Button type="link" icon={<MoreOutlined />} aria-label="更多操作">
            更多
          </Button>
        </Dropdown>
      </Space>
    );
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
      width: 240,
      ellipsis: true,
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      ellipsis: true,
      render: (category: any) => category?.name || '-',
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 160,
      ellipsis: true,
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
      width: 240,
      render: (scenes: string[]) => (
        <Space wrap size={[4, 4]}>
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
      width: 300,
      fixed: 'right' as const,
      render: (record: any) => <ActionCell record={record} />,
    },
  ];

  return (
    <div>
      <div className="products-header">
        <div>
          <Title level={3} className="products-header-title">
            产品管理
          </Title>
          <Paragraph className="products-header-subtitle">
            在同一页面管理产品列表、产品分类与品牌。
          </Paragraph>
        </div>
        <Space>
          {activeTab === 'products' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增产品
            </Button>
          ) : null}
          {activeTab === 'brand' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => brandPanelRef.current?.openCreate()}>
              新增品牌
            </Button>
          ) : null}
          <Button
            icon={<ReloadOutlined />}
            onClick={handleHeaderRefresh}
            loading={activeTab === 'products' ? loading : headerRefreshing}
          >
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
                      showSearch
                      optionFilterProp="label"
                      options={categorySelectOptions}
                    />
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
                      showSearch
                      optionFilterProp="label"
                      options={brandSelectOptions}
                    />
                    <Select
                      placeholder="选择状态"
                      style={{ width: 160, minWidth: 140 }}
                      value={status}
                      onChange={setStatus}
                      allowClear
                      options={statusSelectOptions}
                    />
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
                  scroll={{ x: 'max-content' }}
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
                ref={categoryPanelRef}
                onChanged={() => {
                  refreshCategories();
                }}
              />
            ),
          },
          {
            key: 'brand',
            label: '品牌管理',
            children: <BrandPanel ref={brandPanelRef} brands={brands} onRefresh={refreshBrands} />,
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
          onRefreshCategories={refreshCategories}
          onRefreshBrands={refreshBrands}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage;
