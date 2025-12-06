import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Row, Col, Button, Space, Carousel } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { LeadForm } from '@/components/forms/LeadForm';

const { Title, Paragraph, Text } = Typography;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  specifications: {
    [key: string]: string;
  };
  features: string[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '1');

  // 模拟产品数据
  const product: Product = {
    id: productId,
    name: '优质大米',
    description: '精选优质大米，来自肥沃的黑土地，经过严格的质量检测，确保每一粒大米都饱满、香甜、营养丰富。适合家庭食用，也可用于餐饮行业。',
    price: 50,
    images: [
      'https://via.placeholder.com/800x600/FFFFFF/333333?text=优质大米1',
      'https://via.placeholder.com/800x600/FFFFFF/333333?text=优质大米2',
      'https://via.placeholder.com/800x600/FFFFFF/333333?text=优质大米3',
    ],
    category: '粮食',
    specifications: {
      '品牌': '超群粮油',
      '产地': '黑龙江',
      '净含量': '5kg',
      '保质期': '12个月',
      '储存条件': '阴凉干燥处',
      '等级': '一级',
    },
    features: [
      '精选优质稻谷，颗粒饱满',
      '采用先进加工工艺，保留营养成分',
      '严格的质量检测，确保食品安全',
      '口感细腻，香甜可口',
      '适合各种烹饪方式',
    ],
  };

  return (
    <div className="min-h-screen py-12">
      <Helmet>
        <title>{product.name} - 西安超群粮油贸易有限公司</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={`${product.name}, 西安超群粮油, 粮油产品, ${product.category}`} />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link to="/products">
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              className="text-gray-700"
            >
              返回产品列表
            </Button>
          </Link>
        </div>

        {/* 产品详情卡片 */}
        <Card bordered={false} className="shadow-lg">
          <Row gutter={[24, 24]}>
            {/* 产品图片 */}
            <Col xs={24} md={12}>
              <Carousel 
                autoplay 
                className="rounded-lg overflow-hidden"
                dotPosition="bottom"
              >
                {product.images.map((image, index) => (
                  <div key={index} className="h-[400px] bg-gray-100 flex items-center justify-center">
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </Carousel>
            </Col>

            {/* 产品信息 */}
            <Col xs={24} md={12}>
              <div className="space-y-6">
                <div>
                  <Title level={3}>{product.name}</Title>
                  <Text type="secondary" className="text-sm">{product.category}</Text>
                </div>

                <div className="flex items-center space-x-4">
                  <Text className="text-3xl font-bold text-red-600">¥{product.price}</Text>
                  <Text type="secondary" className="line-through">¥{product.price + 10}</Text>
                  <Text className="text-green-600 bg-green-50 px-2 py-1 rounded">热卖中</Text>
                </div>

                <Paragraph>{product.description}</Paragraph>

                {/* 产品特性 */}
                <div>
                  <Title level={4} className="mb-3">产品特性</Title>
                  <div className="space-y-2">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-2 mr-2 flex-shrink-0"></span>
                        <Text>{feature}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="pt-4">
                  <Space size="large">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<ShoppingCartOutlined />} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      加入购物车
                    </Button>
                    <Button 
                      size="large" 
                      icon={<PhoneOutlined />} 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      立即咨询
                    </Button>
                  </Space>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 产品规格 */}
        <Card 
          bordered={false} 
          className="shadow-lg mt-8"
          title={<Title level={4} className="m-0">产品规格</Title>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">{key}：</Text>
                <Text strong>{value}</Text>
              </div>
            ))}
          </div>
        </Card>

        {/* 联系信息 */}
        <Card 
          bordered={false} 
          className="shadow-lg mt-8 bg-blue-50"
          title={<Title level={4} className="m-0">联系我们</Title>}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <PhoneOutlined className="text-blue-600 text-xl" />
                </div>
                <Title level={5} className="mb-1">联系电话</Title>
                <Text>138-0000-0000</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <MailOutlined className="text-blue-600 text-xl" />
                </div>
                <Title level={5} className="mb-1">电子邮箱</Title>
                <Text>info@chaoqun粮油.com</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <EnvironmentOutlined className="text-blue-600 text-xl" />
                </div>
                <Title level={5} className="mb-1">公司地址</Title>
                <Text>陕西省西安市未央区粮油批发市场</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 获取报价表单 */}
        <div className="mt-8">
          <LeadForm
            source="product_detail"
            defaultProductId={productId.toString()}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;