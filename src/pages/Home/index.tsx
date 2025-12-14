import React, { useEffect, useMemo, useState } from 'react';
import { Card, Carousel, Typography, Button } from 'antd';
import { ArrowRightOutlined, ShoppingCartOutlined, SafetyOutlined, TruckOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { LeadForm } from '@/components/forms/LeadForm';
import { fetchBanners } from '@/services/content';
import { Banner as BannerType } from '@/types/content';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const Home: React.FC = () => {
  const isMobile = useIsMobile();
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const { companyInfo, loading: loadingCompany } = useCompanyInfo();

  useEffect(() => {
    const loadBanners = async () => {
      setLoadingBanners(true);
      try {
        const data = await fetchBanners();
        setBanners(Array.isArray(data) ? data : []);
      } catch (error) {
        setBanners([]);
      } finally {
        setLoadingBanners(false);
      }
    };

    loadBanners();
  }, []);

  const carouselItems = useMemo(() => banners.map((banner) => ({
    image: banner.image_url,
    title: banner.title || companyInfo?.company_name || '超群粮油贸易',
    description: banner.sub_title || banner.title || companyInfo?.introduction || '西安超群粮油贸易有限公司官网后台',
  })), [banners, companyInfo]);

  const companyName = companyInfo?.company_name || '西安超群粮油贸易有限公司';
  const companyDescription = loadingCompany
    ? '公司信息加载中...'
    : (companyInfo?.introduction || companyInfo?.short_description || '暂时没有配置信息，请稍后查看。');
  const companyAddress = loadingCompany ? '加载中...' : (companyInfo?.address || '暂未配置');
  const companyPhone = loadingCompany ? '加载中...' : (companyInfo?.phone || '暂未配置');
  const companyEmail = loadingCompany ? '加载中...' : (companyInfo?.email || '暂未配置');

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
        <title>{companyName} - 专业粮油贸易服务</title>
        <meta name="description" content={companyInfo?.introduction || '西安超群粮油贸易有限公司专业从事粮油产品经销批发，提供优质粮油产品和专业贸易服务。'} />
        <meta name="keywords" content="西安超群粮油, 粮油贸易, 粮油批发, 优质粮油" />
      </Helmet>

      {/* 轮播图 */}
      <Carousel autoplay className="w-full">
        {loadingBanners ? (
          <div className="relative h-[280px] md:h-[400px] flex items-center justify-center bg-gray-100">
            <Paragraph className="text-lg mb-0">轮播图加载中...</Paragraph>
          </div>
        ) : carouselItems.length > 0 ? (
          carouselItems.map((item, index) => (
            <div key={index} className="relative">
              <img 
                src={item.image || 'https://via.placeholder.com/1200x400/EEF2FF/111111?text=%E8%B6%85%E7%BE%A4%E7%B2%AE%E6%B2%B9'} 
                alt={item.title} 
                className="w-full h-[280px] md:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-white p-4">
                <Title
                  level={isMobile ? 3 : 2}
                  className="mb-3 md:mb-4 text-white leading-tight text-center"
                >
                  {item.title}
                </Title>
                <Paragraph
                  className="text-base md:text-lg mb-5 md:mb-6 max-w-2xl text-center text-white/90"
                  ellipsis={isMobile ? { rows: 2 } : false}
                >
                  {item.description}
                </Paragraph>
                <div className={isMobile ? 'w-full flex flex-col gap-3' : 'flex items-center gap-4'}>
                  <Link to="/contact#quote" className={isMobile ? 'w-full' : ''}>
                    <Button
                      type="primary"
                      size="large"
                      className={isMobile ? 'w-full bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      获取报价
                    </Button>
                  </Link>
                  <Link to="/products" className={isMobile ? 'w-full' : ''}>
                    <Button
                      size="large"
                      icon={<ArrowRightOutlined />}
                      className={isMobile ? 'w-full bg-white/90 hover:bg-white text-blue-700' : 'bg-white/90 hover:bg-white text-blue-700'}
                    >
                      查看产品
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative h-[280px] md:h-[400px] flex items-center justify-center bg-gray-100">
            <Paragraph className="text-lg mb-0">暂时没有配置轮播图</Paragraph>
          </div>
        )}
      </Carousel>

      {/* 公司简介 */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">关于我们</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src={companyInfo?.banner_image || 'https://via.placeholder.com/600x400/EEEEEE/333333?text=%E5%85%AC%E5%8F%B8%E7%AE%80%E4%BB%8B'} 
                alt="公司简介" 
                className="rounded-lg shadow-md"
              />
            </div>
            <div>
              <Title level={3} className="mb-4">{companyName}</Title>
              <Paragraph className="mb-4">
                {companyDescription}
              </Paragraph>
              {companyInfo?.service_areas && (
                <Paragraph className="mb-4">
                  服务区域：{companyInfo.service_areas}
                </Paragraph>
              )}
              {companyInfo?.service_channels && (
                <Paragraph className="mb-6">
                  服务渠道：{companyInfo.service_channels}
                </Paragraph>
              )}
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
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">核心优势</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
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
      <section className="py-12 md:py-16 bg-gray-50">
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
                cover={<img alt={`产品 ${item}`} src={`https://via.placeholder.com/300x200/FFFFFF/333333?text=%E4%BA%A7%E5%93%81${item}`} />}
                onClick={() => window.location.href = `/products/${item}`}
              >
                <Meta title={`产品 ${item}`} description="优质粮油产品" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="py-12 md:py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="text-white mb-6">联系我们</Title>
          <Paragraph className="mb-2 text-lg">
            电话：{companyPhone}
          </Paragraph>
          <Paragraph className="mb-2 text-lg">
            邮箱：{companyEmail}
          </Paragraph>
          <Paragraph className="mb-8 text-lg">
            地址：{companyAddress}
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
      <section className="py-12 md:py-16 bg-gray-50">
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
