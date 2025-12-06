import React, { useState } from 'react';
import { Card, Typography, Row, Col, Pagination, Select, Input, Button, Space } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const { Title, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { Search } = Input;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ProductsList: React.FC = () => {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: '优质大米',
      description: '精选优质大米，口感细腻，营养丰富',
      price: 50,
      image: 'https://via.placeholder.com/300x200/FFFFFF/333333?text=优质大米',
      category: '粮食',
    },
    {
      id: 2,
      name: '纯正花生油',
      description: '纯正花生油，香味浓郁，营养健康',
      price: 80,
      image: 'https://via.placeholder.com/300x200/FFFFFF/333333?text=纯正花生油',
      category: '食用油',
    },
    {
      id: 3,
      name: '高筋面粉',
      description: '高筋面粉，适合制作面包、面条等',
      price: 40,
      image: 'https://via.placeholder.com/300x200/FFFFFF/333333?text=高筋面粉',
      category: '粮食',
    },
    {
      id: 4,
      name: '调和油',
      description: '营养调和油，均衡营养，健康之选',
      price: 60,
      image: 'https://via.placeholder.com/300x200/FFFFFF/333333?text=调和油',
      category: '食用油',
    },
    {
      id: 5,
      name: '糯米',
      description: '优质糯米，适合制作粽子、汤圆等',
      price: 55,
      image: 'https://via.placeholder.com/300x200/FFFFFF/333333?text=糯米',
      category: '粮食',
    },
    {
      id: 6,
      name: '大豆油',
      description: '优质大豆油，富含不饱和脂肪酸',
      price: 50,
      image: 'https://via.placeholder.com/300x200/FFFFFF/333333?text=大豆油',
      category: '食用油',
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');

  const categories = ['粮食', '食用油', '其他'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = category ? product.category === category : true;
    const matchesSearch = searchText ? product.name.includes(searchText) || product.description.includes(searchText) : true;
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
              onChange={handleCategoryChange}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
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
        <Row gutter={[16, 16]}>
          {paginatedProducts.map(product => (
            <Col key={product.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                cover={<img alt={product.name} src={product.image} className="h-[200px] object-cover" />}
                actions={[
                  <ShoppingCartOutlined key="add" />,
                  <Link to={`/products/detail/${product.id}`}>
                  <Button 
                    key="detail" 
                    type="link"
                  >
                    查看详情
                  </Button>
                </Link>
                ]}
              >
                <Meta
                  title={product.name}
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 2 }}>{product.description}</Paragraph>
                      <div className="text-red-600 font-bold text-lg">¥{product.price}/件</div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 分页 */}
        {filteredProducts.length > pageSize && (
          <div className="mt-12 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredProducts.length}
              onChange={setCurrentPage}
              onShowSizeChange={(_, size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              showSizeChanger
              pageSizeOptions={['6', '12', '24']}
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            />
          </div>
        )}

        {/* 空状态 */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Paragraph className="text-gray-500 text-lg">未找到符合条件的产品</Paragraph>
            <Button 
              type="primary" 
              onClick={() => {
                setCategory('');
                setSearchText('');
                setCurrentPage(1);
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