import React from 'react';
import { Card, Typography, Space } from 'antd';
import { useAuthStore } from '../../store/auth';

const { Title, Paragraph, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <Card style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>超群粮油统一后台</Title>
          <Paragraph style={{ fontSize: '18px', color: '#666' }}>
            这里是西安超群粮油贸易有限公司官网后台，已开放线索管理、产品管理、内容管理、公司信息配置、飞书配置、用户与操作日志等模块，所有后台能力都集中在这一套 admin 应用中。
          </Paragraph>
          {user && (
            <Text strong style={{ fontSize: '16px' }}>
              欢迎登录，{user.name || '管理员'}
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;
