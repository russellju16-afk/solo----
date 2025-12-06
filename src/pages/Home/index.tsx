import React from 'react';
import { Card, Carousel, Typography, Button } from 'antd';
import { ArrowRightOutlined, ShoppingCartOutlined, SafetyOutlined, TruckOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { LeadForm } from '@/components/forms/LeadForm';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const Home: React.FC = () => {
  const carouselItems = [
    {
      image: 'https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=西安超群粮油贸易有限公司',
      title: '专业粮油贸易服务',
      description: '为您提供优质的粮油产品和专业的贸易服务',
    },
    {
      image: 'https://via.placeholder.com/1200x400/50E3C2/FFFFFF?text=优质粮油产品',
      title: '优质粮油产品',
      description: '精选优质粮油产品，确保食品安全和品质',
    },
    {
      image: 'https://via.placeholder.com/1200x400/F5A623/FFFFFF?text=专业贸易服务',
      title: '专业贸易服务',
      description: '多年行业经验，为您提供专业的贸易解决方案',
    },
  ];

  const features = [
    {
      icon: <SafetyOutlined className="text-4xl text-blue-600" />,
      title: '品质保证',
      description: '严格的质量控制体系，确保产品品质',
    },
    {
      icon: <TruckOutlined className="text-4xl text-green-600" />,
      title: '高效配送',
      description: '完善的物流体系，确保及时送达',
    },
    {
      icon: <ShoppingCartOutlined className="text-4xl text-orange-600" />,
      title: '丰富品类',
      description: '多样化的粮油产品，满足不同需求',
    },
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>西安超群粮油贸易有限公司 - 专业粮油贸易服务</title>
        <meta name="description" content="西安超群粮油贸易有限公司专业从事粮油产品经销批发，提供优质粮油产品和专业贸易服务。" />
        <meta name="keywords" content="西安超群粮油, 粮油贸易, 粮油批发, 优质粮油" />
      </Helmet>

      {/* 轮播图 */}
      <Carousel autoplay className="w-full">
        {carouselItems.map((item, index) => (
          <div key={index} className="relative">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-white p-4">
              <Title level={2} className="mb-4 text-white">{item.title}</Title>
              <Paragraph className="text-lg mb-6 max-w-2xl text-center">{item.description}</Paragraph>
              <Link to="/products">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ArrowRightOutlined />} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  了解产品
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 公司简介 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">关于我们</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://via.placeholder.com/600x400/EEEEEE/333333?text=公司简介" 
                alt="公司简介" 
                className="rounded-lg shadow-md"
              />
            </div>
            <div>
              <Title level={3} className="mb-4">西安超群粮油贸易有限公司</Title>
              <Paragraph className="mb-4">
                西安超群粮油贸易有限公司成立于2005年，是一家专业从事粮油产品经销批发的企业。公司主要经营各种粮油产品，包括大米、面粉、食用油等，产品远销全国各地。
              </Paragraph>
              <Paragraph className="mb-4">
                公司始终坚持"质量第一、客户至上"的经营理念，以优质的产品和专业的服务赢得了广大客户的信赖和支持。
              </Paragraph>
              <Paragraph className="mb-6">
                我们致力于为客户提供最优质的粮油产品和最专业的贸易服务，期待与您携手合作，共创美好未来！
              </Paragraph>
              <Link to="/about">
                <Button 
                  type="primary" 
                  icon={<ArrowRightOutlined />} 
                >
                  了解更多
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 核心优势 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">核心优势</Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} bordered={false} className="text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">{feature.icon}</div>
                <Meta title={feature.title} description={feature.description} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 产品展示 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <Title level={2}>热门产品</Title>
            <Link to="/products">
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  className="text-blue-600"
                >
                  查看全部
                </Button>
              </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card 
                key={item} 
                hoverable 
                className="h-full"
                cover={<img alt={`产品 ${item}`} src={`https://via.placeholder.com/300x200/FFFFFF/333333?text=产品${item}`} />}
                onClick={() => window.location.href = `/products/detail/${item}`}
              >
                <Meta title={`产品 ${item}`} description="优质粮油产品" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="text-white mb-6">联系我们</Title>
          <Paragraph className="mb-8 text-lg">
            如果您有任何需求或疑问，欢迎随时联系我们，我们将竭诚为您服务！
          </Paragraph>
          <Link to="/contact">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ArrowRightOutlined />} 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  立即联系
                </Button>
              </Link>
        </div>
      </section>

      {/* 快捷表单 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <LeadForm
            source="home_short_form"
            compact
          />
        </div>
      </section>
    </div>
  );
};

export default Home;