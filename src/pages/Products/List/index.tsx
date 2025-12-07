import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Typography, Row, Col, Pagination, Select, Input, Button, Space, message, Spin, Tag } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { fetchProducts } from '@/services/products';
import { Product } from '@/types/product';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { Search } = Input;

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions = useMemo(() => {
    const options = new Map<number, string>();
    products.forEach((product) => {
      if (product.category?.id && product.category?.name) {
        options.set(product.category.id, product.category.name);
      }
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [products]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchProducts({ page, pageSize, categoryId, keyword });
      setProducts(resp?.data || []);
      setTotal(resp?.total || 0);
    } catch (error) {
      message.error('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  }, [categoryId, keyword, page, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (value: string) => {
    setKeyword(value.trim());
    setPage(1);
  };

  const handleCategoryChange = (value: number | undefined) => {
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
        <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
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
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
          </Space>
        </div>

        {/* 产品列表 */}
        <Spin spinning={loading} tip="加载产品中...">
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col key={product.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  cover={<img alt={product.name} src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200/FFFFFF/333333?text=%E4%BA%A7%E5%93%81'} className="h-[200px] object-cover" />}
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
                    title={product.name}
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
