import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, Form, Tag, message } from 'antd';
import { SearchOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { leadService } from '../../services/lead';
import { LeadListItem, ChannelType, CategoryInterest } from '../../types/lead';
import type { LeadStatus } from '../../types/lead';
import {
  CHANNEL_LABEL_MAP,
  STATUS_LABEL_MAP,
  STATUS_TAG_COLOR_MAP,
  maskPhone,
  formatDate,
} from '../../utils/lead';
import LeadDetailDrawer from './LeadDetailDrawer';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LeadsList: React.FC = () => {
  // 路由参数和导航
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [ownerId, setOwnerId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');
  
  // 详情抽屉
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  // 表单实例
  const [form] = Form.useForm();
  
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
  
  // 获取线索列表
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        status: status === 'all' ? undefined : status,
        channelType: channelType === 'all' ? undefined : channelType,
        ownerId,
        keyword,
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
      };
      
      const res = await leadService.getLeads(params);
      setLeads(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取线索列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载和筛选条件变化时重新获取线索列表
  useEffect(() => {
    fetchLeads();
  }, [currentPage, pageSize, status, channelType, ownerId, keyword, dateRange]);
  
  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLeads();
  };
  
  // 重置搜索条件
  const handleReset = () => {
    setStatus('all');
    setChannelType('all');
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
        channelType: channelType === 'all' ? undefined : channelType,
        ownerId,
        keyword,
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
      };
      
      const res = await leadService.exportLeads(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(res.data);
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
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => maskPhone(phone),
    },
    {
      title: '渠道类型',
      dataIndex: 'channelType',
      key: 'channelType',
      render: (type: ChannelType) => CHANNEL_LABEL_MAP[type],
    },
    {
      title: '意向品类',
      dataIndex: 'interestedCategories',
      key: 'interestedCategories',
      render: (categories: CategoryInterest[]) => {
        if (!categories || categories.length === 0) return '-';
        return categories.map((cat: CategoryInterest) => cat.categoryName).join('、');
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
      width: 100,
      render: (_: any, record: LeadListItem) => (
        <Space size="middle">
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
        
        <Form.Item label="渠道类型">
          <Select
            placeholder="选择渠道类型"
            allowClear
            size="middle"
            style={{ width: 150 }}
            value={channelType}
            onChange={(value) => setChannelType(value)}
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
          <Input.Search
            placeholder="搜索名称/公司/电话"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 250 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
          />
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