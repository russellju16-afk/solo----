import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Row, Col, Button, Space, Carousel, Spin, Result, Tag } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CopyOutlined, WechatOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { LeadForm } from '@/components/forms/LeadForm';
import { Product } from '@/types/product';
import { fetchProductDetail, fetchRecommendedProducts } from '@/services/products';
import { message } from 'antd';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { fetchFaqs } from '@/services/content';
import { FaqItem } from '@/types/content';
import { track } from '@/utils/track';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Title, Paragraph, Text } = Typography;

const ProductDetail: React.FC = () => {
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const { companyInfo } = useCompanyInfo();
  const formRef = useRef<HTMLDivElement | null>(null);
  const trackedProductRef = useRef<number | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('未找到对应的产品');
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const loadDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchProductDetail(productId, { signal: controller.signal });
        setProduct(data);
        setError(null);
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const responseStatus = (err as { response?: { status?: number } })?.response?.status;
        const isNotFound = responseStatus === 404;
        const msg = isNotFound ? '产品不存在或已下架' : '获取产品详情失败';
        setError(msg);
        message.error(msg);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDetail();
    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    if (trackedProductRef.current !== product.id) {
      trackedProductRef.current = product.id;
      track('product_view', { productId: product.id, categoryId: product.category?.id });
    }
    const controller = new AbortController();

    const loadRecommendations = async () => {
      try {
        const data = await fetchRecommendedProducts(product.id, { categoryId: product.category?.id, signal: controller.signal });
        setRecommendedProducts(data.filter((item) => item.id !== product.id));
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn('recommendations fallback', err);
          setRecommendedProducts([]);
        }
      }
    };

    const loadFaqs = async () => {
      try {
        const result = await fetchFaqs({ categoryId: product.category?.id, limit: 4 }, { signal: controller.signal });
        setFaqs(result.slice(0, 4));
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn('faq load failed', err);
          setFaqs([]);
        }
      }
    };

    loadRecommendations();
    loadFaqs();

    return () => controller.abort();
  }, [product]);

  const imageUrls = useMemo(
    () => product?.images?.map((img) => img.url).filter(Boolean) || [],
    [product]
  );

  const specificationEntries = useMemo(() => {
    if (!product) return [] as Array<[string, string]>;

    const entries: Array<[string, string]> = [];
    if (product.specifications) {
      entries.push(...Object.entries(product.specifications));
    }
    if (product.spec_weight) entries.push(['规格', product.spec_weight]);
    if (product.package_type) entries.push(['包装', product.package_type]);
    if (product.moq) entries.push(['起订量', product.moq]);
    if (product.supply_area) entries.push(['供应区域', product.supply_area]);
    if (product.brand?.name) entries.push(['品牌', product.brand.name]);
    if (product.category?.name) entries.push(['类别', product.category.name]);
    return entries;
  }, [product]);

  const featureList = useMemo(
    () => product?.features || product?.applicable_scenes || [],
    [product]
  );

  const companyPhone = companyInfo?.phone || '029-86543210';
  const companyEmail = companyInfo?.email || 'info@chaoqun粮油.com';
  const companyAddress = companyInfo?.address || '陕西省西安市未央区粮油批发市场';
  const wechatQr = companyInfo?.wechat_qr_code;

  const handleConsult = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('联系方式已复制');
    } catch (err) {
      console.error('Copy failed', err);
      message.error('复制失败，请稍后重试');
    }
  };

  const handleWechatJump = () => {
    if (wechatQr) {
      window.open(wechatQr, '_blank', 'noopener');
      return;
    }
    message.info('暂未提供微信二维码');
  };

  const renderFaqs = () => {
    if (faqs.length === 0) return null;
    return (
      <Card bordered={false} className="shadow-lg mt-8" title={<Title level={4} className="m-0">常见问题</Title>}>
        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.id}>
              <Text strong>{item.question}</Text>
              <Paragraph className="mb-0 text-gray-700">{item.answer}</Paragraph>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载产品详情中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Result
          status="warning"
          title={error}
          extra={(
            <Link to="/products">
              <Button type="primary" icon={<ArrowLeftOutlined />}>返回产品列表</Button>
            </Link>
          )}
        />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const priceText = product.price ? `¥${product.price}` : product.latest_price_note || '联系客服获取报价';

  return (
    <div className="min-h-screen py-8 md:py-12">
      <Helmet>
        <title>{product.name} - 西安超群粮油贸易有限公司</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={`${product.name}, 西安超群粮油, 粮油产品, ${product.category?.name || ''}`} />
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
	                {(imageUrls.length ? imageUrls : ['https://via.placeholder.com/800x600/FFFFFF/333333?text=产品图片']).map((image, index) => (
	                  <div key={index} className="h-[260px] sm:h-[340px] md:h-[400px] bg-gray-100 flex items-center justify-center">
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
                  <Text type="secondary" className="text-sm">{product.category?.name || '粮油产品'}</Text>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                  <Text className="text-3xl font-bold text-red-600">{priceText}</Text>
                  {product.latest_price_updated_at && (
                    <Text type="secondary">更新于 {product.latest_price_updated_at}</Text>
                  )}
                  {product.status !== 0 && (
                    <Text className="text-green-600 bg-green-50 px-2 py-1 rounded">在售</Text>
                  )}
                </div>

                <Paragraph>{product.description || '暂无产品描述'}</Paragraph>

                {/* 产品特性 */}
                {featureList.length > 0 && (
                  <div>
                    <Title level={4} className="mb-3">产品特性</Title>
                    <div className="space-y-2">
                      {featureList.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-2 mr-2 flex-shrink-0"></span>
                          <Text>{feature}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.applicable_scenes && product.applicable_scenes.length > 0 && (
                  <Space size={[8, 8]} wrap>
                    {product.applicable_scenes.map((scene) => (
                      <Tag key={scene} color="blue">{scene}</Tag>
                    ))}
                  </Space>
                )}

	                {/* 操作按钮 */}
	                <div className="pt-4">
	                  <Space size={12} wrap direction={isMobile ? 'vertical' : 'horizontal'} style={isMobile ? { width: '100%' } : undefined}>
	                    <Button
	                      type="primary"
	                      size="large"
	                      icon={<ShoppingCartOutlined />}
	                      className="bg-blue-600 hover:bg-blue-700"
	                      style={isMobile ? { width: '100%' } : undefined}
	                    >
	                      加入购物车
	                    </Button>
	                    <Button
	                      size="large"
	                      icon={<PhoneOutlined />}
	                      className="bg-orange-500 hover:bg-orange-600 text-white"
	                      onClick={handleConsult}
	                      style={isMobile ? { width: '100%' } : undefined}
	                    >
	                      立即咨询
	                    </Button>
	                    <Button size="large" icon={<CopyOutlined />} onClick={() => handleCopy(companyPhone)} style={isMobile ? { width: '100%' } : undefined}>
	                      复制电话
	                    </Button>
	                    <Button size="large" icon={<WechatOutlined />} onClick={handleWechatJump} style={isMobile ? { width: '100%' } : undefined}>
	                      微信咨询
	                    </Button>
	                  </Space>
	                </div>
	              </div>
            </Col>
          </Row>
        </Card>

        {/* 产品规格 */}
        {specificationEntries.length > 0 && (
          <Card
            bordered={false}
            className="shadow-lg mt-8"
            title={<Title level={4} className="m-0">产品规格</Title>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specificationEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600">{key}：</Text>
                  <Text strong>{value}</Text>
                </div>
              ))}
            </div>
          </Card>
        )}

        {recommendedProducts.length > 0 && (
          <Card
            bordered={false}
            className="shadow-lg mt-8"
            title={<Title level={4} className="m-0">相关推荐</Title>}
            extra={<Text type="secondary">基于同类目与浏览行为</Text>}
          >
	            <Row gutter={[16, 16]}>
	              {recommendedProducts.map((item) => (
	                <Col xs={24} md={12} key={item.id}>
	                  <Card size="small" hoverable>
	                    <div className="flex items-start justify-between gap-2 mb-2">
	                      <Text strong className="cq-clamp-2">{item.name}</Text>
	                      {item.price && <Tag color="red">¥{item.price}</Tag>}
	                    </div>
	                    <Paragraph ellipsis={{ rows: 2 }}>{item.description || '暂无描述'}</Paragraph>
	                    <Space size="small" wrap>
	                      <Link to={`/products/${item.id}`}>
	                        <Button type="link" size="small">查看详情</Button>
	                      </Link>
	                      <Button size="small" onClick={() => handleCopy(companyPhone)}>咨询报价</Button>
	                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {renderFaqs()}

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
	                <Text className="mb-2">{companyPhone}</Text>
	                <Space wrap>
	                  <Button type="primary" onClick={() => window.location.href = `tel:${companyPhone}`}>
	                    拨打电话
	                  </Button>
	                  <Button icon={<CopyOutlined />} onClick={() => handleCopy(companyPhone)}>
	                    复制
                  </Button>
                </Space>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <MailOutlined className="text-blue-600 text-xl" />
                </div>
                <Title level={5} className="mb-1">电子邮箱</Title>
                <Text className="mb-2">{companyEmail}</Text>
                <Button icon={<CopyOutlined />} onClick={() => handleCopy(companyEmail)}>
                  复制邮箱
                </Button>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <EnvironmentOutlined className="text-blue-600 text-xl" />
                </div>
                <Title level={5} className="mb-1">公司地址</Title>
                <Text className="mb-2 text-center">{companyAddress}</Text>
                <Button icon={<WechatOutlined />} onClick={handleWechatJump}>
                  微信联系
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 获取报价表单 */}
        <div ref={formRef} className="mt-8">
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
