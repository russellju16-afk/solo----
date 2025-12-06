import React from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';
import { ArrowRightOutlined, BarChartOutlined, ShoppingCartOutlined, SafetyOutlined, TruckOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

interface Solution {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const Solutions: React.FC = () => {
  const solutions: Solution[] = [
    {
      id: 1,
      title: '粮油批发解决方案',
      description: '为大型餐饮企业、学校食堂、超市等提供专业的粮油批发服务，确保产品质量和供应稳定。',
      icon: <ShoppingCartOutlined className="text-4xl text-blue-600" />,
      features: [
        '批量采购，价格优惠',
        '定期配送，确保供应稳定',
        '多种产品组合，满足不同需求',
        '专业的售后服务',
      ],
    },
    {
      id: 2,
      title: '粮油供应链管理',
      description: '提供从采购、仓储到配送的完整供应链管理服务，优化您的运营效率，降低成本。',
      icon: <BarChartOutlined className="text-4xl text-green-600" />,
      features: [
        '优化供应链流程',
        '降低库存成本',
        '提高配送效率',
        '实时监控供应链状态',
      ],
    },
    {
      id: 3,
      title: '粮油质量检测服务',
      description: '严格的质量检测体系，确保所有产品符合国家食品安全标准，让您放心使用。',
      icon: <SafetyOutlined className="text-4xl text-orange-600" />,
      features: [
        '专业的检测设备',
        '严格的检测流程',
        '详细的检测报告',
        '符合国家食品安全标准',
      ],
    },
    {
      id: 4,
      title: '粮油配送服务',
      description: '完善的物流体系，确保产品及时送达，让您无需担心配送问题。',
      icon: <TruckOutlined className="text-4xl text-purple-600" />,
      features: [
        '覆盖范围广',
        '快速响应',
        '安全可靠',
        '实时追踪物流信息',
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <Helmet>
        <title>解决方案 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司提供专业的粮油批发、供应链管理、质量检测和配送服务，为您的企业提供全方位的解决方案。" />
        <meta name="keywords" content="西安超群粮油, 粮油解决方案, 粮油批发, 供应链管理, 质量检测" />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-16 text-center">
          <Title level={2}>解决方案</Title>
          <Paragraph className="max-w-3xl mx-auto">
            我们提供全方位的粮油贸易解决方案，从批发、供应链管理到质量检测和配送，满足您的不同需求。
          </Paragraph>
        </div>

        {/* 解决方案列表 */}
        <Row gutter={[24, 24]}>
          {solutions.map(solution => (
            <Col key={solution.id} xs={24} md={12}>
              <Card
                hoverable
                className="h-full transition-all hover:shadow-xl"
                cover={<div className="h-[200px] bg-gray-50 flex items-center justify-center">{solution.icon}</div>}
              >
                <Meta
                  title={solution.title}
                  description={
                    <div className="space-y-4">
                      <Paragraph ellipsis={{ rows: 2 }}>{solution.description}</Paragraph>
                      <ul className="space-y-2">
                        {solution.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-2 mr-2 flex-shrink-0"></span>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to={`/solutions/${solution.id}`}>
                        <Button
                          type="link"
                          icon={<ArrowRightOutlined />}
                          className="p-0"
                        >
                          了解更多
                        </Button>
                      </Link>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 服务优势 */}
        <section className="py-16 bg-gray-50 mt-20 rounded-lg">
          <div className="container mx-auto px-4">
            <Title level={3} className="text-center mb-12">我们的服务优势</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCartOutlined className="text-blue-600 text-2xl" />
                  </div>
                  <Title level={4} className="mb-2">丰富的产品种类</Title>
                  <Paragraph className="text-sm">提供各类粮油产品，满足您的不同需求。</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SafetyOutlined className="text-green-600 text-2xl" />
                  </div>
                  <Title level={4} className="mb-2">严格的质量控制</Title>
                  <Paragraph className="text-sm">所有产品均经过严格的质量检测，确保安全。</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TruckOutlined className="text-orange-600 text-2xl" />
                  </div>
                  <Title level={4} className="mb-2">高效的配送服务</Title>
                  <Paragraph className="text-sm">完善的物流体系，确保产品及时送达。</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChartOutlined className="text-purple-600 text-2xl" />
                  </div>
                  <Title level={4} className="mb-2">专业的服务团队</Title>
                  <Paragraph className="text-sm">经验丰富的团队，为您提供专业的服务。</Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* 联系我们 */}
        <section className="py-16 mt-20 text-center">
          <Title level={3} className="mb-6">需要定制解决方案？</Title>
          <Paragraph className="max-w-2xl mx-auto mb-8">
            我们可以根据您的具体需求，为您定制专属的粮油贸易解决方案。
          </Paragraph>
          <Link to="/contact">
            <Button 
              type="primary" 
              size="large" 
              icon={<ArrowRightOutlined />} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              联系我们
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Solutions;