import React, { useState } from 'react';
import { Card, Typography, Row, Col, Button, Pagination, Select, List, Space, Tag } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Title, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

interface Case {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  client: string;
  date: string;
}

const Cases: React.FC = () => {
  const isMobile = useIsMobile();
  const cases: Case[] = [
    {
      id: 1,
      title: '大型连锁超市粮油供应案例',
      description: '为某大型连锁超市提供全方位的粮油供应服务，包括产品采购、质量检测、仓储和配送。',
      image: 'https://via.placeholder.com/600x400/FFFFFF/333333?text=连锁超市案例',
      category: '超市',
      client: '某大型连锁超市',
      date: '2023-10-15',
    },
    {
      id: 2,
      title: '学校食堂粮油配送案例',
      description: '为多所学校食堂提供粮油配送服务，确保学生饮食安全和营养。',
      image: 'https://via.placeholder.com/600x400/FFFFFF/333333?text=学校食堂案例',
      category: '学校',
      client: '某教育集团',
      date: '2023-09-20',
    },
    {
      id: 3,
      title: '餐饮企业粮油采购案例',
      description: '为多家餐饮企业提供优质的粮油采购服务，帮助他们降低成本，提高效率。',
      image: 'https://via.placeholder.com/600x400/FFFFFF/333333?text=餐饮企业案例',
      category: '餐饮',
      client: '某餐饮连锁企业',
      date: '2023-08-10',
    },
    {
      id: 4,
      title: '企业食堂粮油供应案例',
      description: '为多家大型企业食堂提供粮油供应服务，确保员工饮食健康。',
      image: 'https://via.placeholder.com/600x400/FFFFFF/333333?text=企业食堂案例',
      category: '企业',
      client: '某科技公司',
      date: '2023-07-25',
    },
    {
      id: 5,
      title: '酒店粮油采购案例',
      description: '为多家星级酒店提供优质的粮油采购服务，满足他们对高品质产品的需求。',
      image: 'https://via.placeholder.com/600x400/FFFFFF/333333?text=酒店案例',
      category: '酒店',
      client: '某酒店集团',
      date: '2023-06-18',
    },
    {
      id: 6,
      title: '医院食堂粮油配送案例',
      description: '为多家医院食堂提供粮油配送服务，确保患者和医护人员的饮食安全。',
      image: 'https://via.placeholder.com/600x400/FFFFFF/333333?text=医院案例',
      category: '医院',
      client: '某医疗集团',
      date: '2023-05-12',
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [category, setCategory] = useState('');

  const categories = ['超市', '学校', '餐饮', '企业', '酒店', '医院'];

  const filteredCases = cases.filter(caseItem => {
    const matchesCategory = category ? caseItem.category === category : true;
    return matchesCategory;
  });

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);
  const visibleCases = isMobile ? filteredCases.slice(0, currentPage * pageSize) : paginatedCases;

  return (
    <div className="min-h-screen py-8 md:py-12">
      <Helmet>
        <title>成功案例 - 西安超群粮油贸易有限公司</title>
        <meta name="description" content="西安超群粮油贸易有限公司成功案例展示，包括超市、学校、餐饮、企业等多个行业的粮油供应服务案例。" />
        <meta name="keywords" content="西安超群粮油, 成功案例, 粮油供应, 超市案例, 学校案例, 餐饮案例" />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-10 md:mb-16 text-center">
          <Title level={2}>成功案例</Title>
          <Paragraph className="max-w-3xl mx-auto">
            我们为多个行业提供优质的粮油服务，积累了丰富的经验和成功案例。
          </Paragraph>
        </div>

        {/* 筛选 */}
        <div className="mb-8 md:mb-12 flex justify-center">
          <Select
            placeholder="选择案例类别"
            style={{ width: isMobile ? '100%' : 200, maxWidth: 320 }}
            onChange={handleCategoryChange}
            allowClear
          >
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </div>

        {/* 案例列表 */}
        {isMobile ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <List
              itemLayout="horizontal"
              dataSource={visibleCases}
              renderItem={(caseItem) => (
                <List.Item className="px-4 py-4">
                  <Link to={`/cases/${caseItem.id}`} className="flex gap-4 w-full">
                    <img
                      src={caseItem.image}
                      alt={caseItem.title}
                      className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 cq-clamp-2">{caseItem.title}</div>
                      <div className="text-sm text-gray-600 mt-1 cq-clamp-2">{caseItem.description}</div>
                      <Space size={6} wrap className="mt-2">
                        <Tag color="blue">{caseItem.category}</Tag>
                        <Tag>{caseItem.client}</Tag>
                        <Tag>{caseItem.date}</Tag>
                      </Space>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {paginatedCases.map(caseItem => (
              <Col key={caseItem.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  className="h-full transition-all hover:shadow-xl"
                  cover={
                    <div className="h-[200px] overflow-hidden">
                      <img 
                        alt={caseItem.title} 
                        src={caseItem.image} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  }
                  actions={[
                    <Link to={`/cases/${caseItem.id}`} key="detail">
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
                    title={caseItem.title}
                    description={
                      <div className="space-y-3">
                        <Paragraph ellipsis={{ rows: 2 }}>{caseItem.description}</Paragraph>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <CheckCircleOutlined className="text-blue-600 mr-1 text-xs" />
                            <span>{caseItem.category}</span>
                          </div>
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <CheckCircleOutlined className="text-blue-600 mr-1 text-xs" />
                            <span>{caseItem.client}</span>
                          </div>
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <CheckCircleOutlined className="text-blue-600 mr-1 text-xs" />
                            <span>{caseItem.date}</span>
                          </div>
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
        {filteredCases.length > pageSize && (
          <div className="mt-10 md:mt-12 flex justify-center">
            {isMobile ? (
              <Button
                size="large"
                disabled={visibleCases.length >= filteredCases.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                {visibleCases.length >= filteredCases.length ? '已加载全部' : '加载更多'}
              </Button>
            ) : (
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredCases.length}
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
        {filteredCases.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Paragraph className="text-gray-500 text-lg">未找到符合条件的案例</Paragraph>
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

        {/* 合作邀请 */}
        <section className="py-16 mt-20 bg-blue-600 text-white rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <Title level={3} className="mb-6 text-white">想成为我们的下一个成功案例吗？</Title>
            <Paragraph className="max-w-2xl mx-auto mb-8">
              我们拥有丰富的经验和专业的团队，可以为您提供优质的粮油服务。
            </Paragraph>
            <Link to="/contact">
            <Button 
              type="primary" 
              size="large" 
              icon={<ArrowRightOutlined />} 
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              联系我们
            </Button>
          </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Cases;
