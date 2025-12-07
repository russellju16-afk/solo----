/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Popconfirm, Tag, DatePicker, message } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { logService } from '../../services/user';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OperationLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [username, setUsername] = useState<string | undefined>();
  const [action, setAction] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // 操作类型选项
  const actionOptions = [
    { label: '创建', value: 'create' },
    { label: '更新', value: 'update' },
    { label: '删除', value: 'delete' },
    { label: '查看', value: 'view' },
    { label: '登录', value: 'login' },
    { label: '登出', value: 'logout' },
    { label: '其他', value: 'other' },
  ];

  // 获取操作日志列表
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText,
        username,
        action,
        start_time: dateRange[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_time: dateRange[1]?.format('YYYY-MM-DD HH:mm:ss'),
      };
      const res = await logService.getOperationLogs(params);
      setLogsList(res.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      message.error('获取操作日志失败');
    } finally {
      setLoading(false);
    }
  }, [action, currentPage, dateRange, pageSize, searchText, username]);

  // 初始加载
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setUsername(undefined);
    setAction(undefined);
    setDateRange([null, null]);
    setCurrentPage(1);
    fetchLogs();
  };

  // 清空操作日志
  const handleClearLogs = async () => {
    try {
      await logService.clearOperationLogs();
      message.success('操作日志已清空');
      fetchLogs();
    } catch (error) {
      message.error('清空操作日志失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '操作用户',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const option = actionOptions.find(opt => opt.value === action);
        return <Tag color={action === 'create' ? 'green' : action === 'update' ? 'blue' : action === 'delete' ? 'red' : 'gray'}>{option?.label || action}</Tag>;
      },
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 150,
    },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action_btns',
      width: 120,
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => message.info('查看详情功能开发中')}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <h2>操作日志</h2>
        </Space>
        <Space>
          <Popconfirm
            title="确定要清空所有操作日志吗？"
            onConfirm={handleClearLogs}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              清空日志
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* 筛选表单 */}
      <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <Space wrap>
          <div>
            <label style={{ marginRight: 8 }}>搜索：</label>
            <Input.Search
              placeholder="搜索操作描述"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
            />
          </div>

          <div>
            <label style={{ marginRight: 8 }}>操作用户：</label>
            <Input
              placeholder="搜索用户名"
              allowClear
              size="middle"
              style={{ width: 150 }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ marginRight: 8 }}>操作类型：</label>
            <Select
              placeholder="选择操作类型"
              allowClear
              size="middle"
              style={{ width: 120 }}
              value={action}
              onChange={(value) => setAction(value)}
            >
              {actionOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ marginRight: 8 }}>时间段：</label>
            <RangePicker
              size="middle"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as any)}
            />
          </div>

          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={logsList}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
      />
    </div>
  );
};

export default OperationLogs;
