import React, { useState, useEffect, useCallback } from 'react';
import { 
  Drawer, 
  Descriptions, 
  Tag, 
  Select, 
  Button, 
  Form, 
  Input, 
  Timeline, 
  Spin, 
  message,
  Space
} from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { leadService } from '../../services/lead';
import { LeadDetail, CreateFollowupPayload } from '../../types/lead';
import type { LeadStatus } from '../../types/lead';
import {
  CHANNEL_LABEL_MAP,
  STATUS_LABEL_MAP,
  STATUS_TAG_COLOR_MAP,
  VOLUME_SEGMENT_MAP,
  formatDate,
} from '../../utils/lead';

const { Option } = Select;
const { TextArea } = Input;

// 组件接口
interface LeadDetailDrawerProps {
  leadId?: number | null;      // 当前选中的线索 ID；没有则不显示
  visible: boolean;
  onClose: () => void;
  onUpdated?: () => void;      // 当状态或跟进发生变化时，通知列表刷新
}

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  leadId,
  visible,
  onClose,
  onUpdated,
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingFollowup, setAddingFollowup] = useState(false);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>('new');
  
  // 表单实例
  const [followupForm] = Form.useForm();
  
  // 获取线索详情
  const fetchLeadDetail = useCallback(async () => {
    if (!leadId) return;
    
    setLoading(true);
    try {
      const res = await leadService.getLeadById(leadId);
      setLead(res);
      setCurrentStatus(res?.status || 'new');
    } catch (error) {
      message.error('获取线索详情失败');
    } finally {
      setLoading(false);
    }
  }, [leadId]);
  
  // 当 leadId 或 visible 变化时重新获取数据
  useEffect(() => {
    if (visible && leadId) {
      fetchLeadDetail();
    }
  }, [fetchLeadDetail, leadId, visible]);
  
  // 关闭抽屉
  const handleClose = () => {
    onClose();
    // 清空表单
    followupForm.resetFields();
  };
  
  // 更新状态
  const handleStatusChange = async () => {
    if (!leadId || !currentStatus) return;
    
    setSaving(true);
    try {
      await leadService.updateLead(leadId, { status: currentStatus });
      message.success('状态更新成功');
      // 重新获取详情
      await fetchLeadDetail();
      // 通知父组件更新
      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      message.error('状态更新失败');
    } finally {
      setSaving(false);
    }
  };
  
  // 添加跟进记录
  const handleAddFollowup = async (values: CreateFollowupPayload) => {
    if (!leadId) return;
    
    setAddingFollowup(true);
    try {
      await leadService.createFollowup(leadId, values);
      message.success('跟进记录添加成功');
      // 重新获取详情
      await fetchLeadDetail();
      // 清空表单
      followupForm.resetFields();
      // 通知父组件更新
      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      message.error('跟进记录添加失败');
    } finally {
      setAddingFollowup(false);
    }
  };
  
  // 渲染时间线
  const renderTimeline = () => {
    if (!lead?.followups || lead.followups.length === 0) {
      return <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>暂无跟进记录</div>;
    }
    
    return (
      <Timeline>
        {lead.followups.map((followup) => (
          <Timeline.Item key={followup.id}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{followup.operatorName}</span>
                <span style={{ color: '#999', fontSize: '12px' }}>
                  {formatDate(followup.createdAt)}
                </span>
              </div>
              <div style={{ margin: '8px 0' }}>
                <Tag color={STATUS_TAG_COLOR_MAP[followup.statusAfter]}>
                  {STATUS_LABEL_MAP[followup.statusAfter]}
                </Tag>
              </div>
              <div style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                {followup.note}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };
  
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            线索详情 - {lead?.companyName || lead?.name || ''}
          </span>
          {lead && (
            <Tag color={STATUS_TAG_COLOR_MAP[lead.status]}>
              {STATUS_LABEL_MAP[lead.status]}
            </Tag>
          )}
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={visible}
      width={800}
      extra={
        <Space>
          <Select
            value={currentStatus}
            onChange={setCurrentStatus}
            style={{ width: 120 }}
            disabled={saving}
          >
            {Object.entries(STATUS_LABEL_MAP).map(([key, label]) => (
              <Option key={key} value={key as LeadStatus}>
                {label}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleStatusChange}
            loading={saving}
          >
            保存状态
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : lead ? (
        <div style={{ padding: '10px 0' }}>
          {/* 基础信息 */}
          <Descriptions title="基础信息" bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="创建时间">{formatDate(lead.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="渠道类型">{CHANNEL_LABEL_MAP[lead.channelType]}</Descriptions.Item>
            <Descriptions.Item label="姓名">{lead.name}</Descriptions.Item>
            <Descriptions.Item label="公司名称">{lead.companyName || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{lead.phone}</Descriptions.Item>
            <Descriptions.Item label="城市">{lead.city || '-'}</Descriptions.Item>
            <Descriptions.Item label="来源">{lead.source}</Descriptions.Item>
            <Descriptions.Item label="负责人">{lead.ownerName || '-'}</Descriptions.Item>
          </Descriptions>
          
          {/* 业务信息 */}
          <Descriptions title="业务信息" bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="意向品类">
              {lead.interestedCategories && lead.interestedCategories.length > 0 
                ? lead.interestedCategories.map(cat => cat.categoryName).join('、') 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="预计月采购量">
              {lead.monthlyVolumeSegment 
                ? VOLUME_SEGMENT_MAP[lead.monthlyVolumeSegment] 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="关联产品 ID">{lead.productId || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_TAG_COLOR_MAP[lead.status]}>
                {STATUS_LABEL_MAP[lead.status]}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          
          {/* 文本信息 */}
          <Descriptions title="需求信息" bordered column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="品牌/规格需求" span={1}>
              {lead.brandRequirement || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="需求描述" span={1}>
              {lead.description || '-'}
            </Descriptions.Item>
          </Descriptions>
          
          {/* 跟进记录 */}
          <div style={{ margin: '24px 0' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>跟进记录</h3>
            {renderTimeline()}
          </div>
          
          {/* 新增跟进表单 */}
          <div style={{ margin: '24px 0', padding: '16px', background: '#f5f5f5', borderRadius: 4 }}>
            <h3 style={{ margin: '0 0 16px 0' }}>新增跟进</h3>
            <Form
              form={followupForm}
              layout="vertical"
              onFinish={handleAddFollowup}
              initialValues={{
                statusAfter: currentStatus,
              }}
            >
              <Form.Item
                name="note"
                label="备注"
                rules={[{ required: true, message: '请输入备注内容' }]}
              >
                <TextArea rows={4} placeholder="请输入跟进备注" />
              </Form.Item>
              
              <Form.Item
                name="statusAfter"
                label="跟进后状态"
                rules={[{ required: true, message: '请选择跟进后状态' }]}
              >
                <Select placeholder="请选择跟进后状态">
                  {Object.entries(STATUS_LABEL_MAP).map(([key, label]) => (
                    <Option key={key} value={key as LeadStatus}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                  loading={addingFollowup}
                >
                  添加跟进
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
          未选择线索
        </div>
      )}
    </Drawer>
  );
};

export default LeadDetailDrawer;
