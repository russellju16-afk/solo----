import React, { useState, useEffect } from 'react';
import { Button, Card, Descriptions, Tag, Space, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

interface Lead {
  id: number;
  name: string;
  company_name: string;
  phone: string;
  city: string;
  channel_type: string;
  source: string;
  status: number;
  owner: { id: number; name: string } | null;
  interested_categories: string[];
  monthly_volume_segment: string;
  brand_requirement: string;
  description: string;
  created_at: string;
  updated_at: string;
  product_id: number | null;
}

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);

  const channelTypeOptions = [
    { label: '高校', value: '高校' },
    { label: '团餐公司', value: '团餐公司' },
    { label: '社会餐饮', value: '社会餐饮' },
    { label: '商超', value: '商超' },
    { label: '食品厂', value: '食品厂' },
    { label: '社区团购平台', value: '社区团购平台' },
    { label: '线上平台', value: '线上平台' },
  ];

  const sourceOptions = [
    { label: '网站表单', value: 'website' },
    { label: '电话咨询', value: 'phone' },
    { label: '微信咨询', value: 'wechat' },
    { label: '线下推广', value: 'offline' },
    { label: '合作伙伴推荐', value: 'partner' },
  ];

  const statusOptions = [
    { label: '新线索', value: 1 },
    { label: '跟进中', value: 2 },
    { label: '已成交', value: 3 },
    { label: '已流失', value: 4 },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    navigate('/leads');
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        // 这里需要实现getLeadDetail和getLeadFollowups方法
        setLead(null);
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };
    loadData();
  }, [id]);

  if (!lead) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>返回列表</Button>
          <h2>线索详情</h2>
        </Space>
        <Space>
          <Tag color="blue">创建时间：{formatDate(lead.created_at)}</Tag>
        </Space>
      </div>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="姓名">{lead.name}</Descriptions.Item>
          <Descriptions.Item label="公司">{lead.company_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="电话">{lead.phone}</Descriptions.Item>
          <Descriptions.Item label="城市">{lead.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="渠道类型">
            {channelTypeOptions.find(opt => opt.value === lead.channel_type)?.label || lead.channel_type}
          </Descriptions.Item>
          <Descriptions.Item label="来源">
            {sourceOptions.find(opt => opt.value === lead.source)?.label || lead.source}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusOptions.find(opt => opt.value === lead.status)?.label === '新线索' ? 'blue' : statusOptions.find(opt => opt.value === lead.status)?.label === '跟进中' ? 'orange' : statusOptions.find(opt => opt.value === lead.status)?.label === '已成交' ? 'green' : 'red'}>
              {statusOptions.find(opt => opt.value === lead.status)?.label || '未知'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="负责人">{lead.owner?.name || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="业务信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="意向品类">
            <Space>
              {lead.interested_categories?.map((category: string, index: number) => (
                <Tag key={index}>{category}</Tag>
              )) || '-'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="月度用量区间">{lead.monthly_volume_segment || '-'}</Descriptions.Item>
          <Descriptions.Item label="品牌要求" span={2}>{lead.brand_requirement || '-'}</Descriptions.Item>
          <Descriptions.Item label="需求描述" span={2}>{lead.description || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="followups" style={{ marginBottom: 16 }}>
        {/* 跟进记录 */}
        <Tabs.TabPane tab="跟进记录" key="followups">
          <div>
            <p>暂无跟进记录</p>
          </div>
        </Tabs.TabPane>

        {/* 其他信息 */}
        <Tabs.TabPane tab="其他信息" key="other">
          <Descriptions bordered>
            <Descriptions.Item label="创建时间">{formatDate(lead.created_at)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{formatDate(lead.updated_at)}</Descriptions.Item>
            <Descriptions.Item label="关联产品ID">{lead.product_id || '-'}</Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default LeadDetail;