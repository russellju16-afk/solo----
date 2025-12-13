import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Card, Typography, Row, Col, Pagination, Select, Input, Button, Space, message, Spin, Tag, Drawer, Checkbox } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, CopyOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { fetchProducts } from '@/services/products';
import { Product } from '@/types/product';
import { track } from '@/utils/track';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { Search } = Input;

const ProductsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('pageSize')) || 6);
  const [categoryId, setCategoryId] = useState<number | undefined>(() => {
    const value = searchParams.get('categoryId');
    return value ? Number(value) : undefined;
  });
  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') || '');
  const [loading, setLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [filterPresets, setFilterPresets] = useState<{ name: string; categoryId?: number; keyword: string }[]>(() => {
    try {
      const stored = localStorage.getItem('product_filter_presets');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse filter presets', error);
      return [];
    }
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const categoryOptions = useMemo(() => {
    const options = new Map<number, string>();
    products.forEach((product) => {
      if (product.category?.id && product.category?.name) {
        options.set(product.category.id, product.category.name);
      }
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [products]);

  const persistPresets = (presets: { name: string; categoryId?: number; keyword: string }[]) => {
    setFilterPresets(presets);
    localStorage.setItem('product_filter_presets', JSON.stringify(presets));
  };

  const loadProducts = useCallback(async () => {
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const resp = await fetchProducts({ page, pageSize, categoryId, keyword, signal: controller.signal });
      if (requestIdRef.current !== currentRequestId || controller.signal.aborted) {
        return;
      }
      setProducts(resp?.data || []);
      setTotal(resp?.total || 0);
    } catch (error) {
      if (controller.signal.aborted || axios.isCancel(error)) {
        return;
      }
      message.error('获取产品列表失败');
    } finally {
      if (requestIdRef.current === currentRequestId && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [categoryId, keyword, page, pageSize]);

  const handleSavePreset = () => {
    const name = window.prompt('为当前筛选命名（示例：大米+25kg）');
    if (!name) return;
    const exists = filterPresets.find((preset) => preset.name === name);
    const newPreset = { name, categoryId, keyword };
    const next = exists
      ? filterPresets.map((preset) => preset.name === name ? newPreset : preset)
      : [...filterPresets, newPreset];
    persistPresets(next);
    message.success(exists ? '预设已更新' : '预设已保存');
  };

  const handleApplyPreset = (name: string) => {
    const preset = filterPresets.find((item) => item.name === name);
    if (!preset) return;
    track('product_filter', { presetName: preset.name, categoryId: preset.categoryId, keyword: preset.keyword });
    setCategoryId(preset.categoryId);
    setKeyword(preset.keyword);
    setPage(1);
  };

  const handleCopyShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      message.success('筛选链接已复制，可直接分享');
    } catch (error) {
      console.error(error);
      message.error('复制失败，请稍后重试');
    }
  };

  const toggleSelectProduct = (productId: number) => {
    const next = new Set(selectedProductIds);
    if (next.has(productId)) {
      next.delete(productId);
    } else {
      next.add(productId);
      track('product_compare_add', { productId });
    }
    setSelectedProductIds(next);
  };

  const selectedProducts = useMemo(
    () => products.filter((item) => selectedProductIds.has(item.id)),
    [products, selectedProductIds]
  );

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    };
    if (categoryId) {
      params.categoryId = String(categoryId);
    }
    if (keyword) {
      params.keyword = keyword;
    }
    setSearchParams(params, { replace: true });
  }, [categoryId, keyword, page, pageSize, setSearchParams]);

  useEffect(() => {
    loadProducts();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadProducts]);

  const handleSearch = (value: string) => {
    const nextKeyword = value.trim();
    track('product_search', { keyword: nextKeyword, categoryId });
    setKeyword(nextKeyword);
    setPage(1);
  };

  const handleCategoryChange = (value: number | undefined) => {
    track('product_filter', { categoryId: value, keyword: keyword.trim() || undefined });
    setCategoryId(value);
    setPage(1);
  };

  const handlePageChange = (current: number, size?: number) => {
    setPage(current);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <Helmet>
        <title>产品中心 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司产品中心，提供各类优质粮油产品。" />
        <meta name="keywords" content="西安超群粮油, 粮油产品, 粮食, 食用油, 批发" />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <Title level={2}>产品中心</Title>
          <Paragraph className="max-w-3xl mx-auto">
            我们提供各类优质粮油产品，满足您的不同需求。所有产品均经过严格的质量检测，确保品质安全。
          </Paragraph>
        </div>

        {/* 筛选和搜索 */}
        <div className="mb-12 bg-white p-6 rounded-lg shadow-md space-y-4">
          <Space size="large" wrap className="justify-center">
            <Select
              placeholder="选择产品类别"
              style={{ width: 200 }}
              value={categoryId}
              onChange={handleCategoryChange}
              allowClear
            >
              {categoryOptions.length === 0 && <Option key="all" value={undefined}>全部类别</Option>}
              {categoryOptions.map((cat) => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>

            <Search
              placeholder="搜索产品名称或描述"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={keyword}
              onSearch={handleSearch}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 320 }}
            />

            <Select
              allowClear
              placeholder="应用保存的预设"
              style={{ width: 200 }}
              onChange={(value) => value && handleApplyPreset(value)}
              options={filterPresets.map((preset) => ({ label: preset.name, value: preset.name }))}
            />

            <Button icon={<AppstoreAddOutlined />} onClick={handleSavePreset}>
              保存为预设
            </Button>

            <Button icon={<CopyOutlined />} onClick={handleCopyShareLink}>
              复制筛选链接
            </Button>
          </Space>

          <div className="flex justify-between items-center flex-wrap gap-3">
            <Text type="secondary">已选 {selectedProductIds.size} 项用于对比</Text>
            <Space size="middle" wrap>
              <Button
                type="primary"
                disabled={selectedProductIds.size < 2}
                onClick={() => {
                  track('product_compare_open', { count: selectedProductIds.size });
                  setIsCompareOpen(true);
                }}
              >
                打开对比抽屉
              </Button>
              <Button
                disabled={selectedProductIds.size === 0}
                onClick={() => setSelectedProductIds(new Set())}
              >
                清空选择
              </Button>
            </Space>
          </div>
        </div>

        {/* 产品列表 */}
        <Spin spinning={loading} tip="加载产品中...">
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col key={product.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  cover={<img alt={product.name} src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200/FFFFFF/333333?text=%E4%BA%A7%E5%93%81'} className="h-[200px] object-cover" />}
                  extra={(
                    <Checkbox
                      checked={selectedProductIds.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                    >
                      对比
                    </Checkbox>
                  )}
                  actions={[
                    <ShoppingCartOutlined key="add" />,
                    <Link to={`/products/${product.id}`} key="detail">
                      <Button
                        type="link"
                      >
                        查看详情
                      </Button>
                    </Link>,
                  ]}
                >
                  <Meta
                    title={
                      <div className="flex items-center justify-between gap-2">
                        <span>{product.name}</span>
                        {product.price && (
                          <Tag color="red">¥{product.price}</Tag>
                        )}
                      </div>
                    }
                    description={
                      <>
                        <Paragraph ellipsis={{ rows: 2 }}>{product.description || '暂无产品描述'}</Paragraph>
                        <div className="text-gray-600 text-sm space-y-1">
                          {product.spec_weight && (
                            <Text className="block">规格：{product.spec_weight}</Text>
                          )}
                          {product.package_type && (
                            <Text className="block">包装：{product.package_type}</Text>
                          )}
                        </div>
                        {product.applicable_scenes && product.applicable_scenes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {product.applicable_scenes.map((scene) => (
                              <Tag key={scene}>{scene}</Tag>
                            ))}
                          </div>
                        )}
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>

        <Drawer
          title={`产品对比（${selectedProducts.length}）`}
          placement="right"
          width={480}
          onClose={() => setIsCompareOpen(false)}
          open={isCompareOpen}
        >
          {selectedProducts.length === 0 ? (
            <Paragraph type="secondary">选择至少两款产品后即可进行对比。</Paragraph>
          ) : (
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <Card key={product.id} size="small" title={product.name} extra={<Tag>{product.category?.name || '通用'}</Tag>}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>规格：{product.spec_weight || '—'}</div>
                    <div>包装：{product.package_type || '—'}</div>
                    <div>价格：{product.price ? `¥${product.price}` : product.latest_price_note || '联系获取报价'}</div>
                    <div>地区：{product.supply_area || '全国'}</div>
                  </div>
                  {product.features && product.features.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">亮点：{product.features.slice(0, 3).join(' / ')}</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Drawer>

        {/* 分页 */}
        {total > pageSize && (
          <div className="mt-12 flex justify-center">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              onShowSizeChange={(_, size) => handlePageChange(1, size)}
              showSizeChanger
              pageSizeOptions={['6', '12', '24']}
              showTotal={(t, range) => `第 ${range[0]}-${range[1]} 条，共 ${t} 条`}
            />
          </div>
        )}

        {/* 空状态 */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Paragraph className="text-gray-500 text-lg">未找到符合条件的产品</Paragraph>
            <Button 
              type="primary" 
              onClick={() => {
                setCategoryId(undefined);
                setKeyword('');
                setPage(1);
              }}
            >
              重置筛选条件
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
