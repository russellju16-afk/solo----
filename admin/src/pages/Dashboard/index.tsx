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
            当前阶段仅开放登录和基础后台框架，线索管理等功能将逐步在此后台中建设。
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