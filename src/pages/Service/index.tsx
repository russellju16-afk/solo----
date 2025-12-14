import React from 'react';
import { Card, Typography, Row, Col, Button, Timeline } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

interface Service {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
}

const Service: React.FC = () => {
  const services: Service[] = [
    {
      id: 1,
      title: '粮油咨询服务',
      description: '为您提供专业的粮油市场咨询、产品选择建议等服务，帮助您做出更明智的决策。',
      icon: <CheckCircleOutlined className="text-4xl text-blue-600" />,
      steps: [
        '需求沟通',
        '市场分析',
        '产品推荐',
        '方案制定',
        '后续跟进',
      ],
    },
    {
      id: 2,
      title: '粮油采购服务',
      description: '根据您的需求，为您采购优质的粮油产品，确保产品质量和价格优惠。',
      icon: <CheckCircleOutlined className="text-4xl text-green-600" />,
      steps: [
        '采购需求确认',
        '供应商筛选',
        '价格谈判',
        '合同签订',
        '产品验收',
      ],
    },
    {
      id: 3,
      title: '粮油配送服务',
      description: '提供快速、安全、可靠的粮油配送服务，确保产品及时送达。',
      icon: <CheckCircleOutlined className="text-4xl text-orange-600" />,
      steps: [
        '配送需求确认',
        '路线规划',
        '货物装车',
        '实时配送',
        '送达确认',
      ],
    },
    {
      id: 4,
      title: '售后服务',
      description: '提供专业的售后服务，解决您在使用过程中遇到的问题。',
      icon: <CheckCircleOutlined className="text-4xl text-purple-600" />,
      steps: [
        '问题反馈',
        '问题分析',
        '解决方案制定',
        '方案实施',
        '满意度调查',
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <Helmet>
        <title>服务中心 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司提供专业的粮油咨询、采购、配送和售后服务，为您的业务提供全方位支持。" />
        <meta name="keywords" content="西安超群粮油, 粮油服务, 咨询服务, 采购服务, 配送服务, 售后服务" />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-16 text-center">
          <Title level={2}>服务中心</Title>
          <Paragraph className="max-w-3xl mx-auto">
            我们提供专业的粮油服务，从咨询、采购到配送和售后，为您的业务提供全方位支持。
          </Paragraph>
        </div>

        {/* 服务列表 */}
        <Row gutter={[24, 24]}>
          {services.map(service => (
            <Col key={service.id} xs={24} md={12}>
              <Card
                hoverable
                className="h-full transition-all hover:shadow-xl"
                cover={<div className="h-[200px] bg-gray-50 flex items-center justify-center">{service.icon}</div>}
              >
                <Meta
                  title={service.title}
                  description={
                    <div className="space-y-4">
                      <Paragraph ellipsis={{ rows: 2 }}>{service.description}</Paragraph>
                      <div>
                        <Title level={5} className="mb-2">服务流程</Title>
                        <Timeline className="text-sm">
                          {service.steps.map((step, index) => (
                            <Timeline.Item key={index}>{step}</Timeline.Item>
                          ))}
                        </Timeline>
                      </div>
                      <Link to={`/service/${service.id}`}>
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

        {/* 服务保障 */}
        <section className="py-16 bg-gray-50 mt-20 rounded-lg">
          <div className="container mx-auto px-4">
            <Title level={3} className="text-center mb-12">我们的服务保障</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircleOutlined className="text-blue-600 text-xl" />
                  </div>
                  <Title level={4} className="mb-2">品质保障</Title>
                  <Paragraph className="text-sm">所有产品均经过严格的质量检测，确保品质安全。</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <ClockCircleOutlined className="text-green-600 text-xl" />
                  </div>
                  <Title level={4} className="mb-2">时效保障</Title>
                  <Paragraph className="text-sm">快速响应，及时送达，确保您的业务顺利进行。</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <PhoneOutlined className="text-orange-600 text-xl" />
                  </div>
                  <Title level={4} className="mb-2">服务保障</Title>
                  <Paragraph className="text-sm">专业的服务团队，为您提供全方位的支持。</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <MailOutlined className="text-purple-600 text-xl" />
                  </div>
                  <Title level={4} className="mb-2">售后保障</Title>
                  <Paragraph className="text-sm">完善的售后服务体系，解决您的后顾之忧。</Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* 联系信息 */}
        <section className="py-16 mt-20 bg-blue-600 text-white rounded-lg">
          <div className="container mx-auto px-4">
            <Title level={3} className="text-center mb-12 text-white">联系我们</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneOutlined className="text-white text-2xl" />
                  </div>
                  <Title level={5} className="mb-2 text-white">联系电话</Title>
                  <Text className="block mb-1">138-0000-0000</Text>
                  <Text className="block text-sm opacity-80">周一至周日 8:00-18:00</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MailOutlined className="text-white text-2xl" />
                  </div>
                  <Title level={5} className="mb-2 text-white">电子邮箱</Title>
                  <Text className="block">info@chaoqun粮油.com</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EnvironmentOutlined className="text-white text-2xl" />
                  </div>
                  <Title level={5} className="mb-2 text-white">公司地址</Title>
                  <Text className="block">陕西省西安市未央区粮油批发市场</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockCircleOutlined className="text-white text-2xl" />
                  </div>
                  <Title level={5} className="mb-2 text-white">营业时间</Title>
                  <Text className="block">周一至周日 8:00-18:00</Text>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* 在线咨询 */}
        <section className="py-16 mt-20 text-center">
          <Title level={3} className="mb-6">需要服务支持？</Title>
          <Paragraph className="max-w-2xl mx-auto mb-8">
            无论您有任何问题或需求，都可以随时联系我们，我们将竭诚为您服务。
          </Paragraph>
          <Link to="/contact">
            <Button 
              type="primary" 
              size="large" 
              icon={<ArrowRightOutlined />} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              在线咨询
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Service;
