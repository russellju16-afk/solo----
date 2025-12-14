/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, Form, Tag, message, Modal } from 'antd';
import { SearchOutlined, DownloadOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { leadService } from '../../services/lead';
import { LeadListItem, ChannelType, CategoryInterest, LeadType, SignalChannel } from '../../types/lead';
import type { LeadStatus } from '../../types/lead';
import {
  CHANNEL_LABEL_MAP,
  STATUS_LABEL_MAP,
  STATUS_TAG_COLOR_MAP,
  maskPhone,
  formatDate,
  CATEGORY_LABEL_MAP,
} from '../../utils/lead';
import LeadDetailDrawer from './LeadDetailDrawer';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LeadsList: React.FC = () => {
  // 路由参数和导航
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);
  
  // 筛选条件
  const [status, setStatus] = useState<LeadStatus | 'all' | undefined>('all');
  const [channelType, setChannelType] = useState<ChannelType | 'all' | undefined>('all');
  const [leadType, setLeadType] = useState<LeadType | 'all' | undefined>('all');
  const [signalChannel, setSignalChannel] = useState<SignalChannel | 'all' | undefined>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [ownerId, setOwnerId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');

  // 行为线索补全
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingLead, setCompletingLead] = useState<LeadListItem | null>(null);
  const [completeSaving, setCompleteSaving] = useState(false);
  
  // 详情抽屉
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  // 表单实例
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();
  
  // 监听 URL 参数变化，自动打开详情抽屉
  useEffect(() => {
    if (id) {
      const leadId = parseInt(id, 10);
      if (!isNaN(leadId)) {
        setSelectedLeadId(leadId);
        setDetailDrawerVisible(true);
      }
    }
  }, [id]);

  useEffect(() => {
    if (leadType !== 'signal') {
      setSignalChannel('all');
    }
  }, [leadType]);

  // 支持从 URL 参数预填日期范围：/leads?range=today|7d|30d|month
  useEffect(() => {
    const range = searchParams.get('range');
    if (!range) return;

    const today = dayjs();

    if (range === 'today') {
      setDateRange([today, today]);
      setCurrentPage(1);
      return;
    }

    if (range === '7d') {
      setDateRange([today.subtract(6, 'day'), today]);
      setCurrentPage(1);
      return;
    }

    if (range === '30d') {
      setDateRange([today.subtract(29, 'day'), today]);
      setCurrentPage(1);
      return;
    }

    if (range === 'month') {
      setDateRange([today.startOf('month'), today]);
      setCurrentPage(1);
    }
  }, [searchParams]);
  
  // 获取线索列表
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        status: status === 'all' ? undefined : status,
        leadType: leadType === 'all' ? undefined : leadType,
        channelType: leadType === 'signal' ? undefined : channelType === 'all' ? undefined : channelType,
        channel: leadType === 'signal' ? (signalChannel === 'all' ? undefined : signalChannel) : undefined,
        ownerId,
        keyword,
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
      };
      
      const res = await leadService.getLeads(params);
      setLeads(res?.items || []);
      setTotal(res?.total || 0);
    } catch (error) {
      message.error('获取线索列表失败');
    } finally {
      setLoading(false);
    }
  }, [channelType, currentPage, dateRange, keyword, leadType, ownerId, pageSize, signalChannel, status]);
  
  // 初始加载和筛选条件变化时重新获取线索列表
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);
  
  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLeads();
  };
  
  // 重置搜索条件
  const handleReset = () => {
    setStatus('all');
    setChannelType('all');
    setLeadType('all');
    setSignalChannel('all');
    setDateRange([null, null]);
    setOwnerId(undefined);
    setKeyword('');
    setCurrentPage(1);
    form.resetFields();
    fetchLeads();
  };
  
  // 导出线索
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        status: status === 'all' ? undefined : status,
        leadType: leadType === 'all' ? undefined : leadType,
        channelType: leadType === 'signal' ? undefined : channelType === 'all' ? undefined : channelType,
        channel: leadType === 'signal' ? (signalChannel === 'all' ? undefined : signalChannel) : undefined,
        ownerId,
        keyword,
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
      };
      
      const res = await leadService.exportLeads(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(res);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `leads_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };
  
  // 打开详情抽屉
  const handleOpenDetail = (leadId: number) => {
    setSelectedLeadId(leadId);
    setDetailDrawerVisible(true);
  };
  
  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setDetailDrawerVisible(false);
    setSelectedLeadId(null);
    // 移除 URL 中的 id 参数
    navigate('/leads', { replace: true });
  };

  const openCompleteModal = (record: LeadListItem) => {
    setCompletingLead(record);
    setCompleteModalOpen(true);
    completeForm.setFieldsValue({
      name: record.name || '',
      phone: record.phone || '',
      companyName: record.companyName || '',
      description: record.description || '',
    });
  };

  const closeCompleteModal = () => {
    setCompleteModalOpen(false);
    setCompletingLead(null);
    completeForm.resetFields();
  };

  const handleCompleteSave = async () => {
    if (!completingLead) return;
    setCompleteSaving(true);
    try {
      const values = await completeForm.validateFields();
      await leadService.updateLead(completingLead.id, {
        name: values.name,
        phone: values.phone,
        companyName: values.companyName,
        description: values.description,
        isContactable: true,
      });
      message.success('线索已补全，已标记为可联系');
      closeCompleteModal();
      fetchLeads();
    } catch (error) {
      if ((error as any)?.errorFields) {
        // 表单校验错误
        return;
      }
      message.error('补全失败，请稍后重试');
    } finally {
      setCompleteSaving(false);
    }
  };
  
  // 表格列配置
  const columns = [
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => formatDate(time),
    },
    {
      title: '线索类型',
      dataIndex: 'leadType',
      key: 'leadType',
      width: 150,
      render: (_: any, record: LeadListItem) => {
        if (record.leadType === 'signal') {
          return (
            <Space size={6}>
              <Tag color="blue">行为线索</Tag>
              {record.isContactable ? null : <Tag color="orange">待补全</Tag>}
            </Space>
          )
        }
        return <Tag color="green">表单线索</Tag>
      },
    },
    {
      title: '触达渠道',
      dataIndex: 'channel',
      key: 'channel',
      width: 120,
      render: (value: SignalChannel | null | undefined, record: LeadListItem) => {
        if (record.leadType !== 'signal') return '-'
        if (value === 'phone') return <Tag color="geekblue">电话</Tag>
        if (value === 'wechat') return <Tag color="green">微信</Tag>
        if (value === 'email') return <Tag color="purple">邮件</Tag>
        return <Tag>未知</Tag>
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '公司名称',
      dataIndex: 'companyName',
      key: 'companyName',
      ellipsis: true,
      width: 200,
      render: (value: string) => value || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (phone ? maskPhone(phone) : '-'),
    },
    {
      title: '采购角色',
      dataIndex: 'channelType',
      key: 'channelType',
      render: (type: ChannelType | undefined) => (type ? CHANNEL_LABEL_MAP[type] : '-'),
    },
    {
      title: '意向品类',
      dataIndex: 'interestedCategories',
      key: 'interestedCategories',
      render: (categories: CategoryInterest[]) => {
        if (!categories || categories.length === 0) return '-';
        return categories.map((cat: CategoryInterest) => CATEGORY_LABEL_MAP[cat] || cat).join('、');
      },
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: LeadStatus) => (
        <Tag color={STATUS_TAG_COLOR_MAP[status]}>
          {STATUS_LABEL_MAP[status]}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'ownerName',
      key: 'ownerName',
      render: (name: string | undefined) => name || '-',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: LeadListItem) => (
        <Space size="middle">
          {record.leadType === 'signal' && !record.isContactable ? (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openCompleteModal(record)}
            >
              补全信息
            </Button>
          ) : null}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record.id)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      {/* 页面标题和导出按钮 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>线索管理</h2>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exportLoading}
          onClick={handleExport}
        >
          导出
        </Button>
      </div>
      
      {/* 筛选表单 */}
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="线索类型">
          <Select
            placeholder="选择线索类型"
            allowClear
            size="middle"
            style={{ width: 140 }}
            value={leadType}
            onChange={(value) => setLeadType(value)}
          >
            <Option value="all">全部</Option>
            <Option value="form">表单线索</Option>
            <Option value="signal">行为线索</Option>
          </Select>
        </Form.Item>

        <Form.Item label="触达渠道">
          <Select
            placeholder="电话/微信/邮件"
            allowClear
            size="middle"
            style={{ width: 140 }}
            value={signalChannel}
            onChange={(value) => setSignalChannel(value)}
            disabled={leadType !== 'signal'}
          >
            <Option value="all">全部</Option>
            <Option value="phone">电话</Option>
            <Option value="wechat">微信</Option>
            <Option value="email">邮件</Option>
          </Select>
        </Form.Item>

        <Form.Item label="状态">
          <Select
            placeholder="选择状态"
            allowClear
            size="middle"
            style={{ width: 150 }}
            value={status}
            onChange={(value) => setStatus(value)}
          >
            <Option value="all">全部</Option>
            <Option value="new">{STATUS_LABEL_MAP.new}</Option>
            <Option value="processing">{STATUS_LABEL_MAP.processing}</Option>
            <Option value="won">{STATUS_LABEL_MAP.won}</Option>
            <Option value="lost">{STATUS_LABEL_MAP.lost}</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="采购角色">
          <Select
            placeholder="选择采购角色"
            allowClear
            size="middle"
            style={{ width: 150 }}
            value={channelType}
            onChange={(value) => setChannelType(value)}
            disabled={leadType === 'signal'}
          >
            <Option value="all">全部</Option>
            {Object.entries(CHANNEL_LABEL_MAP).map(([key, label]) => (
              <Option key={key} value={key as ChannelType}>
                {label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item label="时间范围">
          <RangePicker
            size="middle"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
          />
        </Form.Item>
        
        <Form.Item label="负责人">
          <Select
            placeholder="选择负责人"
            allowClear
            size="middle"
            style={{ width: 150 }}
            value={ownerId}
            onChange={(value) => setOwnerId(value)}
          >
            {/* 这里可以从用户列表接口获取数据，暂时用假数据 */}
            <Option value={1}>张三</Option>
            <Option value={2}>李四</Option>
            <Option value={3}>王五</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="关键字">
          <Space.Compact style={{ width: 250 }}>
            <Input
              placeholder="搜索名称/公司/电话"
              allowClear
              size="middle"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button size="middle" icon={<SearchOutlined />} onClick={handleSearch} aria-label="搜索" />
          </Space.Compact>
        </Form.Item>
        
        <Form.Item>
          <Button
            onClick={handleReset}
            style={{ marginLeft: 8 }}
          >
            重置
          </Button>
        </Form.Item>
      </Form>
      
      {/* 表格列表 */}
      <Table
        columns={columns}
        dataSource={leads}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: '暂无线索数据' }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <Modal
        title="补全行为线索"
        open={completeModalOpen}
        onCancel={closeCompleteModal}
        onOk={handleCompleteSave}
        okText="保存"
        confirmLoading={completeSaving}
        destroyOnHidden
      >
        <Form form={completeForm} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="companyName" label="公司名称">
            <Input placeholder="请输入公司名称（可选）" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={4} placeholder="补充备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 详情抽屉 */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        visible={detailDrawerVisible}
        onClose={handleCloseDetail}
        onUpdated={fetchLeads}
      />
    </div>
  );
};

export default LeadsList;
