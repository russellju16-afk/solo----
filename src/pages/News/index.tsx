import React, { useState } from 'react';
import { Card, Typography, Row, Col, Button, Pagination, Select, List, Space, Tag } from 'antd';
import { ArrowRightOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;

interface News {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  views: number;
}

const News: React.FC = () => {
  const isMobile = useIsMobile();
  const news: News[] = [
    {
      id: 1,
      title: '2023年粮油市场行情分析',
      description: '分析2023年粮油市场的行情走势，包括价格波动、供应情况、需求变化等方面。',
      image: 'https://via.placeholder.com/400x200/FFFFFF/333333?text=市场行情',
      category: '市场动态',
      date: '2023-11-01',
      views: 1234,
    },
    {
      id: 2,
      title: '如何选择优质粮油产品',
      description: '介绍如何选择优质的粮油产品，包括看外观、闻气味、查标签等方法。',
      image: 'https://via.placeholder.com/400x200/FFFFFF/333333?text=产品选择',
      category: '选购指南',
      date: '2023-10-15',
      views: 987,
    },
    {
      id: 3,
      title: '公司参加2023年粮油博览会',
      description: '公司参加了2023年全国粮油博览会，展示了公司的优质产品和服务。',
      image: 'https://via.placeholder.com/400x200/FFFFFF/333333?text=博览会',
      category: '公司新闻',
      date: '2023-09-20',
      views: 765,
    },
    {
      id: 4,
      title: '粮油储存小常识',
      description: '介绍粮油储存的小常识，包括储存温度、湿度、容器选择等方面。',
      image: 'https://via.placeholder.com/400x200/FFFFFF/333333?text=储存常识',
      category: '实用技巧',
      date: '2023-08-10',
      views: 1543,
    },
    {
      id: 5,
      title: '新一批优质大米到货',
      description: '公司新到一批优质大米，来自黑龙江肥沃的黑土地，质量优良，欢迎选购。',
      image: 'https://via.placeholder.com/400x200/FFFFFF/333333?text=新货到',
      category: '产品动态',
      date: '2023-07-25',
      views: 1023,
    },
    {
      id: 6,
      title: '食品安全知识讲座',
      description: '公司举办食品安全知识讲座，提高员工的食品安全意识和操作规范。',
      image: 'https://via.placeholder.com/400x200/FFFFFF/333333?text=知识讲座',
      category: '公司新闻',
      date: '2023-06-18',
      views: 876,
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [category, setCategory] = useState('');

  const categories = ['市场动态', '选购指南', '公司新闻', '实用技巧', '产品动态'];

  const filteredNews = news.filter(newsItem => {
    const matchesCategory = category ? newsItem.category === category : true;
    return matchesCategory;
  });

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);
  const visibleNews = isMobile ? filteredNews.slice(0, currentPage * pageSize) : paginatedNews;

  return (
    <div className="min-h-screen py-8 md:py-12">
      <Helmet>
        <title>新闻资讯 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司新闻资讯，包括市场动态、选购指南、公司新闻、实用技巧和产品动态。" />
        <meta name="keywords" content="西安超群粮油, 新闻资讯, 市场动态, 选购指南, 公司新闻, 实用技巧" />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-10 md:mb-16 text-center">
          <Title level={2}>新闻资讯</Title>
          <Paragraph className="max-w-3xl mx-auto">
            为您提供最新的粮油市场动态、选购指南、公司新闻和实用技巧。
          </Paragraph>
        </div>

        {/* 筛选 */}
        <div className="mb-8 md:mb-12 flex justify-center">
          <Select
            placeholder="选择新闻类别"
            style={{ width: isMobile ? '100%' : 200, maxWidth: 320 }}
            onChange={handleCategoryChange}
            allowClear
          >
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </div>

        {/* 新闻列表 */}
        {isMobile ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <List
              itemLayout="horizontal"
              dataSource={visibleNews}
              renderItem={(newsItem) => (
                <List.Item className="px-4 py-4">
                  <Link to={`/news/${newsItem.id}`} className="flex gap-4 w-full">
                    <img
                      src={newsItem.image}
                      alt={newsItem.title}
                      className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 cq-clamp-2">{newsItem.title}</div>
                      <div className="text-sm text-gray-600 mt-1 cq-clamp-2">{newsItem.description}</div>
                      <Space size={6} wrap className="mt-2">
                        <Tag color="blue">{newsItem.category}</Tag>
                        <Tag icon={<CalendarOutlined />}>{newsItem.date}</Tag>
                        <Tag icon={<EyeOutlined />}>{newsItem.views}</Tag>
                      </Space>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {paginatedNews.map(newsItem => (
              <Col key={newsItem.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  className="h-full transition-all hover:shadow-xl"
                  cover={
                    <div className="h-[200px] overflow-hidden">
                      <img 
                        alt={newsItem.title} 
                        src={newsItem.image} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  }
                  actions={[
                    <div className="flex items-center text-xs text-gray-500" key="date">
                      <CalendarOutlined className="mr-1" />
                      <span>{newsItem.date}</span>
                    </div>,
                    <div className="flex items-center text-xs text-gray-500" key="views">
                      <EyeOutlined className="mr-1" />
                      <span>{newsItem.views}</span>
                    </div>,
                    <Link to={`/news/${newsItem.id}`} key="detail">
                      <Button
                        type="link"
                        icon={<ArrowRightOutlined />}
                        className="p-0"
                      >
                        查看详情
                      </Button>
                    </Link>
                  ]}
                >
                  <Meta
                    title={newsItem.title}
                    description={
                      <div className="space-y-3">
                        <Paragraph ellipsis={{ rows: 2 }}>{newsItem.description}</Paragraph>
                        <div className="flex justify-between items-center">
                          <Text type="secondary" className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {newsItem.category}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* 分页 */}
        {filteredNews.length > pageSize && (
          <div className="mt-10 md:mt-12 flex justify-center">
            {isMobile ? (
              <Button
                size="large"
                disabled={visibleNews.length >= filteredNews.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                {visibleNews.length >= filteredNews.length ? '已加载全部' : '加载更多'}
              </Button>
            ) : (
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredNews.length}
                onChange={setCurrentPage}
                onShowSizeChange={(_, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showSizeChanger
                pageSizeOptions={['6', '12', '24']}
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
              />
            )}
          </div>
        )}

        {/* 空状态 */}
        {filteredNews.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Paragraph className="text-gray-500 text-lg">未找到符合条件的新闻</Paragraph>
            <Button 
              type="primary" 
              onClick={() => {
                setCategory('');
                setCurrentPage(1);
              }}
            >
              重置筛选条件
            </Button>
          </div>
        )}

        {/* 订阅新闻 */}
        <section className="py-16 mt-20 bg-gray-50 rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <Title level={3} className="mb-6">订阅新闻</Title>
            <Paragraph className="max-w-2xl mx-auto mb-8">
              订阅我们的新闻资讯，及时获取最新的粮油市场动态和公司信息。
            </Paragraph>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <input
                type="email"
                placeholder="请输入您的电子邮箱"
                className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow"
              />
              <Button 
                type="primary" 
                size="large" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                立即订阅
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default News;
