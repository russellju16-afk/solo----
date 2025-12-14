import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Carousel, Typography, Button, Row, Col, Space } from 'antd'
import { ArrowRightOutlined, ShoppingCartOutlined, SafetyOutlined, TruckOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LeadForm } from '@/components/forms/LeadForm'
import { fetchBanners, fetchCases, fetchNews } from '@/services/content'
import type { Banner as BannerType, CaseItem, NewsItem } from '@/types/content'
import { fetchProducts } from '@/services/products'
import type { Product } from '@/types/product'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'
import { useIsMobile } from '@/hooks/useIsMobile'
import ImageWithFallback from '@/components/ImageWithFallback'
import EmptyState from '@/components/EmptyState'

const { Title, Paragraph, Text } = Typography
const { Meta } = Card

const Home: React.FC = () => {
  const isMobile = useIsMobile()
  const { companyInfo, loading: loadingCompany } = useCompanyInfo()

  const [banners, setBanners] = useState<BannerType[]>([])
  const [loadingBanners, setLoadingBanners] = useState(false)

  const [hotProducts, setHotProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(false)

  const [latestCases, setLatestCases] = useState<CaseItem[]>([])
  const [loadingCases, setLoadingCases] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoadingBanners(true)
    fetchBanners()
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]))
      .finally(() => {
        if (!controller.signal.aborted) setLoadingBanners(false)
      })

    setLoadingProducts(true)
    fetchProducts({ page: 1, pageSize: 4, signal: controller.signal })
      .then((resp) => setHotProducts(resp?.data || []))
      .catch(() => setHotProducts([]))
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProducts(false)
      })

    setLoadingNews(true)
    fetchNews({ page: 1, pageSize: 3 }, { signal: controller.signal })
      .then((resp) => setLatestNews(resp?.data || []))
      .catch(() => setLatestNews([]))
      .finally(() => {
        if (!controller.signal.aborted) setLoadingNews(false)
      })

    setLoadingCases(true)
    fetchCases({ page: 1, pageSize: 3 }, { signal: controller.signal })
      .then((resp) => setLatestCases(resp?.data || []))
      .catch(() => setLatestCases([]))
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCases(false)
      })

    return () => controller.abort()
  }, [])

  const companyName = companyInfo?.company_name || '西安超群粮油贸易有限公司'
  const companyDescription = loadingCompany
    ? '公司信息加载中...'
    : companyInfo?.short_description || companyInfo?.introduction || '欢迎来到西安超群粮油贸易有限公司，我们为企业客户提供稳定可靠的粮油供应服务。'
  const companyAddress = loadingCompany ? '加载中...' : companyInfo?.address || '暂未配置'
  const companyPhone = loadingCompany ? '加载中...' : companyInfo?.phone || '暂未配置'
  const companyEmail = loadingCompany ? '加载中...' : companyInfo?.email || '暂未配置'

  const carouselItems = useMemo(
    () =>
      banners.map((banner) => ({
        id: banner.id,
        image: banner.image_url,
        title: banner.title || companyName,
        description: banner.sub_title || banner.title || companyDescription,
        link: banner.link_url,
      })),
    [banners, companyDescription, companyName],
  )

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
  ]

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{companyName} - 专业粮油贸易服务</title>
        <meta name="description" content={companyInfo?.introduction || '西安超群粮油贸易有限公司专业从事粮油产品经销批发，提供优质粮油产品和专业贸易服务。'} />
        <meta name="keywords" content="西安超群粮油, 粮油贸易, 粮油批发, 优质粮油" />
      </Helmet>

      {carouselItems.length > 0 ? (
        <Carousel autoplay className="w-full">
          {carouselItems.map((item, index) => (
            <div key={item.id} className="relative">
              <ImageWithFallback
                src={item.image}
                fallback="/assets/placeholder-banner.webp"
                alt={item.title}
                loading={index === 0 ? 'eager' : undefined}
                className="w-full h-[280px] md:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-35 flex flex-col justify-center items-center text-white p-4">
                <Title level={isMobile ? 3 : 2} className="mb-3 md:mb-4 text-white leading-tight text-center">
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
                    <Button type="primary" size="large" className={isMobile ? 'w-full bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}>
                      获取报价
                    </Button>
                  </Link>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={isMobile ? 'w-full' : ''}>
                      <Button size="large" className={isMobile ? 'w-full' : ''}>
                        了解更多
                      </Button>
                    </a>
                  ) : (
                    <Link to="/products" className={isMobile ? 'w-full' : ''}>
                      <Button size="large" className={isMobile ? 'w-full' : ''}>
                        查看产品
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      ) : (
        <section className="relative h-[280px] md:h-[400px] bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0">
            <ImageWithFallback
              src={companyInfo?.banner_image}
              fallback="/assets/placeholder-banner.webp"
              alt="首页主视觉"
              loading="eager"
              className="w-full h-full object-cover opacity-45"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-slate-950/70" />
          <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
            <Title level={isMobile ? 3 : 2} className="text-white mb-3 md:mb-4">
              {companyName}
            </Title>
            <Paragraph className="text-white/90 max-w-2xl mb-6" ellipsis={isMobile ? { rows: 2 } : false}>
              {companyDescription}
            </Paragraph>
            <div className={isMobile ? 'w-full flex flex-col gap-3' : 'flex items-center gap-4'}>
              <Link to="/contact#quote" className={isMobile ? 'w-full' : ''}>
                <Button type="primary" size="large" className={isMobile ? 'w-full bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}>
                  获取报价
                </Button>
              </Link>
              <Link to="/products" className={isMobile ? 'w-full' : ''}>
                <Button size="large" className={isMobile ? 'w-full' : ''}>
                  查看产品
                </Button>
              </Link>
            </div>
            {loadingBanners ? <Text className="text-white/70 mt-4">轮播图加载中...</Text> : null}
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            关于我们
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <ImageWithFallback
                src={companyInfo?.banner_image}
                fallback="/assets/placeholder-banner.webp"
                alt="公司简介"
                className="rounded-lg shadow-md w-full h-[240px] md:h-[320px] object-cover"
              />
            </div>
            <div>
              <Title level={3} className="mb-4">
                {companyName}
              </Title>
              <Paragraph className="mb-4">{companyDescription}</Paragraph>
              {companyInfo?.service_areas ? <Paragraph className="mb-4">服务区域：{companyInfo.service_areas}</Paragraph> : null}
              {companyInfo?.service_channels ? <Paragraph className="mb-6">服务渠道：{companyInfo.service_channels}</Paragraph> : null}
              <Link to="/about">
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  了解更多
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            核心优势
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="borderless" className="text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">{feature.icon}</div>
                <Meta title={feature.title} description={feature.description} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <Title level={2} className="mb-0">
              热门产品
            </Title>
            <Link to="/products">
              <Button type="link" icon={<ArrowRightOutlined />} className="text-blue-600">
                查看全部
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Col key={index} xs={24} sm={12} md={6}>
                  <Card loading className="h-full" />
                </Col>
              ))}
            </Row>
          ) : hotProducts.length === 0 ? (
            <EmptyState
              title="暂无产品"
              description="还没有发布产品内容，请在后台添加产品后再来查看。"
              actions={
                <Space>
                  <Link to="/contact#quote">
                    <Button type="primary">获取报价</Button>
                  </Link>
                </Space>
              }
            />
          ) : (
            <Row gutter={[16, 16]}>
              {hotProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={6}>
                  <Link to={`/products/${product.id}`}>
                    <Card
                      hoverable
                      className="h-full"
                      cover={
                        <ImageWithFallback
                          alt={product.name}
                          src={product.cover_image || product.images?.[0]?.url}
                          fallback="/assets/placeholder-product.webp"
                          className="w-full h-[160px] sm:h-[200px] object-cover"
                          loading="lazy"
                        />
                      }
                    >
                      <Meta title={product.name} description={product.description || '优质粮油产品'} />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <Title level={2} className="mb-0">
              最新资讯
            </Title>
            <Link to="/news">
              <Button type="link" icon={<ArrowRightOutlined />} className="text-blue-600">
                查看全部
              </Button>
            </Link>
          </div>

          {loadingNews ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Col key={index} xs={24} md={8}>
                  <Card loading className="h-full" />
                </Col>
              ))}
            </Row>
          ) : latestNews.length === 0 ? (
            <EmptyState title="暂无资讯" description="还没有发布新闻内容，请在后台完善后再来查看。" className="py-12 bg-white rounded-lg shadow-md" />
          ) : (
            <Row gutter={[16, 16]}>
              {latestNews.map((news) => (
                <Col key={news.id} xs={24} md={8}>
                  <Link to={`/news/${news.id}`}>
                    <Card
                      hoverable
                      className="h-full"
                      cover={
                        <ImageWithFallback
                          alt={news.title}
                          src={news.cover_image}
                          fallback="/assets/placeholder-card.webp"
                          className="w-full h-[180px] object-cover"
                          loading="lazy"
                        />
                      }
                    >
                      <Meta title={news.title} description={news.category || '新闻资讯'} />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <Title level={2} className="mb-0">
              成功案例
            </Title>
            <Link to="/cases">
              <Button type="link" icon={<ArrowRightOutlined />} className="text-blue-600">
                查看全部
              </Button>
            </Link>
          </div>

          {loadingCases ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Col key={index} xs={24} md={8}>
                  <Card loading className="h-full" />
                </Col>
              ))}
            </Row>
          ) : latestCases.length === 0 ? (
            <EmptyState title="暂无案例" description="还没有发布案例内容，请在后台完善后再来查看。" className="py-12 bg-white rounded-lg shadow-md" />
          ) : (
            <Row gutter={[16, 16]}>
              {latestCases.map((caseItem) => (
                <Col key={caseItem.id} xs={24} md={8}>
                  <Link to={`/cases/${caseItem.id}`}>
                    <Card
                      hoverable
                      className="h-full"
                      cover={
                        <ImageWithFallback
                          alt={caseItem.customer_name}
                          src={caseItem.cover_image}
                          fallback="/assets/placeholder-card.webp"
                          className="w-full h-[180px] object-cover"
                          loading="lazy"
                        />
                      }
                    >
                      <Meta title={caseItem.customer_name} description={caseItem.industry_type || '成功案例'} />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="text-white mb-6">
            联系我们
          </Title>
          <Paragraph className="mb-2 text-lg text-white/90">电话：{companyPhone}</Paragraph>
          <Paragraph className="mb-2 text-lg text-white/90">邮箱：{companyEmail}</Paragraph>
          <Paragraph className="mb-8 text-lg text-white/90">地址：{companyAddress}</Paragraph>
          <Link to="/contact">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} className="bg-white text-blue-600 hover:bg-gray-100">
              立即联系
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <LeadForm source="home_short_form" compact />
        </div>
      </section>
    </div>
  )
}

export default Home
