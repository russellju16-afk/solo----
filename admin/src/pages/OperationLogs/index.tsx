/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import { DeleteOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { logService } from '../../services/user';
import './index.css';

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

type SortOrder = 'ascend' | 'descend' | null;
type SortField = 'created_at' | 'ip_address' | 'action' | null;

type SortState = {
  field: SortField;
  order: SortOrder;
};

const SORT_STORAGE_KEY = 'admin:operationLogs:sortState';

const readSortState = (): SortState => {
  if (typeof window === 'undefined') return { field: 'created_at', order: 'descend' };
  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (!raw) return { field: 'created_at', order: 'descend' };
    const parsed = JSON.parse(raw);
    const field = parsed?.field as SortField;
    const order = parsed?.order as SortOrder;
    const validField = field === null || field === 'created_at' || field === 'ip_address' || field === 'action';
    const validOrder = order === null || order === 'ascend' || order === 'descend';
    if (!validField || !validOrder) return { field: 'created_at', order: 'descend' };
    return { field, order };
  } catch {
    return { field: 'created_at', order: 'descend' };
  }
};

const writeSortState = (state: SortState) => {
  try {
    window.localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

const OperationLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [apiHint, setApiHint] = useState<string | null>(null);

  const [logsList, setLogsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [keyword, setKeyword] = useState('');
  const [username, setUsername] = useState('');
  const [action, setAction] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [sortState, setSortState] = useState<SortState>(() => readSortState());

  const [filterForm] = Form.useForm();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const actionOptions = useMemo(
    () => [
      { label: '创建', value: 'create' },
      { label: '更新', value: 'update' },
      { label: '删除', value: 'delete' },
      { label: '查看', value: 'view' },
      { label: '登录', value: 'login' },
      { label: '登出', value: 'logout' },
      { label: '其他', value: 'other' },
    ],
    [],
  );

  const actionLabelMap = useMemo(() => {
    return new Map(actionOptions.map(option => [option.value, option.label]));
  }, [actionOptions]);

  const rangePresets = useMemo(
    () => [
      { label: '今天', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
      { label: '近7天', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
      { label: '近30天', value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')] },
    ],
    [],
  );

  const hasActiveFilters = useMemo(() => {
    return Boolean(keyword || username || action || dateRange?.[0] || dateRange?.[1]);
  }, [action, dateRange, keyword, username]);

  const buildQueryParams = useCallback(
    (override?: Partial<{ page: number; pageSize: number; keyword: string; username: string; action?: string; dateRange: any }>) => {
      const start = (override?.dateRange ?? dateRange)?.[0] as dayjs.Dayjs | null | undefined;
      const end = (override?.dateRange ?? dateRange)?.[1] as dayjs.Dayjs | null | undefined;

      return {
        page: override?.page ?? currentPage,
        pageSize: override?.pageSize ?? pageSize,
        keyword: (override?.keyword ?? keyword)?.trim() || undefined,
        username: (override?.username ?? username)?.trim() || undefined,
        action: override?.action ?? action,
        start_time: start ? start.startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
        end_time: end ? end.endOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
      };
    },
    [action, currentPage, dateRange, keyword, pageSize, username],
  );

  const fetchLogs = useCallback(
    async (override?: Partial<{ page: number; pageSize: number; keyword: string; username: string; action?: string; dateRange: any }>) => {
      setLoading(true);
      setApiHint(null);
      try {
        const res: any = await logService.getOperationLogs(buildQueryParams(override));
        const list = Array.isArray(res) ? res : res?.data || [];
        setLogsList(list);
        const resolvedTotal = Array.isArray(res) ? list.length : res?.total ?? res?.data?.total ?? list.length ?? 0;
        setTotal(resolvedTotal);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404) {
          setApiHint('操作日志接口暂未启用或返回 404，可先在服务端启用后再试。');
        } else {
          setApiHint('暂时无法获取操作日志，请稍后点击“刷新”重试。');
        }
        setLogsList([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const applyFilters = () => {
    const values = filterForm.getFieldsValue();
    const nextDateRange =
      Array.isArray(values?.dateRange) && values.dateRange.length === 2 ? (values.dateRange as any) : [null, null];

    setKeyword((values?.keyword || '').trim());
    setUsername((values?.username || '').trim());
    setAction(values?.action);
    setDateRange(nextDateRange);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    filterForm.resetFields();
    setKeyword('');
    setUsername('');
    setAction(undefined);
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  const handleClearLogs = async () => {
    setClearLoading(true);
    try {
      await logService.clearOperationLogs();
      message.success('操作日志已清空');
      setCurrentPage(1);
      fetchLogs({ page: 1 });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '清空操作日志失败';
      message.error(msg);
    } finally {
      setClearLoading(false);
    }
  };

  const openDetail = (record: any) => {
    setSelectedLog(record);
    setDetailOpen(true);
  };

  const detailDescription = useMemo(() => {
    const raw = selectedLog?.description ?? selectedLog?.detail ?? '';
    if (!raw) return '';
    const text = String(raw);
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  }, [selectedLog]);

  const handleExport = () => {
    const exportTotal = total || logsList.length;
    const exportLimit = 5000;
    const willLimit = exportTotal > exportLimit;

    Modal.confirm({
      title: '导出操作日志',
      okText: '开始导出',
      cancelText: '取消',
      content: (
        <div>
          <div>
            将按当前筛选条件导出{willLimit ? `前 ${exportLimit} 条（总计 ${exportTotal} 条）` : ` ${exportTotal} 条`}日志。
          </div>
          <Text type="secondary" style={{ display: 'block', marginTop: 6 }}>
            导出耗时取决于网络与数据量，建议在高峰期外操作。
          </Text>
        </div>
      ),
      onOk: async () => {
        setExportLoading(true);
        try {
          const batchSize = 200;
          const maxCount = willLimit ? exportLimit : exportTotal;
          const maxPages = 200;
          const rows: any[] = [];

          for (let page = 1; page <= maxPages; page += 1) {
            const res: any = await logService.getOperationLogs(buildQueryParams({ page, pageSize: batchSize }));
            const list = Array.isArray(res) ? res : res?.data || [];
            rows.push(...list);
            if (rows.length >= maxCount) break;
            if (list.length < batchSize) break;
            if (typeof res?.total === 'number' && rows.length >= res.total) break;
          }

          const limitedRows = rows.slice(0, maxCount);
          const escapeCsv = (value: any) => {
            const s = value === null || value === undefined ? '' : String(value);
            if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
          };

          const header = ['ID', '操作用户', '操作类型', '操作模块', '操作描述', '操作IP', '操作时间'];
          const lines = [
            header.join(','),
            ...limitedRows.map((row) => {
              const actionValue = row?.action;
              const actionLabel = actionLabelMap.get(actionValue) || actionValue || '';
              const createdAt = row?.created_at ? dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss') : '';
              return [
                escapeCsv(row?.id),
                escapeCsv(row?.username),
                escapeCsv(actionLabel),
                escapeCsv(row?.module),
                escapeCsv(row?.description),
                escapeCsv(row?.ip_address),
                escapeCsv(createdAt),
              ].join(',');
            }),
          ];

          const csv = `\ufeff${lines.join('\r\n')}`;
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `operation_logs_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          message.success('导出成功');
        } catch (error: any) {
          const msg = error?.response?.data?.message || error?.message || '导出失败';
          message.error(msg);
        } finally {
          setExportLoading(false);
        }
      },
    });
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: '操作用户',
      dataIndex: 'username',
      key: 'username',
      render: (value: string) => value || '-',
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      sorter: (a: any, b: any) => String(a?.action || '').localeCompare(String(b?.action || '')),
      sortOrder: sortState.field === 'action' ? sortState.order : null,
      render: (value: string) => {
        const label = actionLabelMap.get(value) || value || '-';
        const color = value === 'create' ? 'green' : value === 'update' ? 'blue' : value === 'delete' ? 'red' : undefined;
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '操作模块',
      dataIndex: 'module',
      key: 'module',
      width: 140,
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '操作IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 150,
      sorter: (a: any, b: any) => String(a?.ip_address || '').localeCompare(String(b?.ip_address || '')),
      sortOrder: sortState.field === 'ip_address' ? sortState.order : null,
      render: (value: string) => value || '-',
    },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: (a: any, b: any) => dayjs(a?.created_at || 0).valueOf() - dayjs(b?.created_at || 0).valueOf(),
      sortOrder: sortState.field === 'created_at' ? sortState.order : null,
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action_btns',
      width: 100,
      render: (_: any, record: any) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)}>
          查看
        </Button>
      ),
    },
  ];

  const handleTableChange: TableProps<any>['onChange'] = (pagination, _filters, sorter, extra) => {
    if (pagination?.current) setCurrentPage(pagination.current);
    if (pagination?.pageSize) setPageSize(pagination.pageSize);

    if (extra.action !== 'sort') return;
    setCurrentPage(1);

    const nextSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = nextSorter?.field as SortField | undefined;
    const order = (nextSorter?.order ?? null) as SortOrder;
    const nextState: SortState = field && order ? { field, order } : { field: null, order: null };
    setSortState(nextState);
    writeSortState(nextState);
  };

  const emptyText = (
    <div className="operation-logs-empty">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div>{apiHint ? '暂时无法获取操作日志' : '暂无操作日志'}</div>
            <span className="operation-logs-empty-hint">{apiHint || '你可以点击“刷新”，或清空筛选条件后重试。'}</span>
            <span className="operation-logs-empty-example">
              示例：{dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm')} 管理员 更新 产品信息（IP：127.0.0.1）
            </span>
          </div>
        }
      >
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchLogs()} disabled={loading}>
            刷新
          </Button>
          <Button onClick={resetFilters} disabled={!hasActiveFilters || loading}>
            清空条件
          </Button>
        </Space>
      </Empty>
    </div>
  );

  return (
    <div>
      <div className="operation-logs-header">
        <div>
          <Title level={3} className="operation-logs-header-title">
            操作日志
          </Title>
          <Paragraph className="operation-logs-header-subtitle">
            记录后台关键操作，支持筛选、排序与导出。
          </Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchLogs()} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} loading={exportLoading} onClick={handleExport}>
            导出
          </Button>
          <Popconfirm title="确定要清空所有操作日志吗？" onConfirm={handleClearLogs} okText="确定" cancelText="取消">
            <Button danger icon={<DeleteOutlined />} loading={clearLoading}>
              清空日志
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <div className="operation-logs-filters">
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{
            keyword: '',
            username: '',
            action: undefined,
            dateRange: [null, null],
          }}
        >
          <Space size="middle" wrap>
            <Form.Item label="关键词" name="keyword">
              <Input
                placeholder="搜索操作描述/模块"
                allowClear
                style={{ width: 240, minWidth: 220 }}
                onPressEnter={applyFilters}
              />
            </Form.Item>

            <Form.Item label="操作人" name="username">
              <Input placeholder="用户名/姓名" allowClear style={{ width: 180, minWidth: 160 }} onPressEnter={applyFilters} />
            </Form.Item>

            <Form.Item label="类型" name="action">
              <Select
                placeholder="选择操作类型"
                allowClear
                options={actionOptions}
                style={{ width: 160, minWidth: 140 }}
              />
            </Form.Item>

            <Form.Item label="时间" name="dateRange">
              <RangePicker
                presets={rangePresets as any}
                placeholder={['开始日期', '结束日期']}
                style={{ width: 280, minWidth: 260 }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters} loading={loading}>
                  查询
                </Button>
                <Button onClick={resetFilters} disabled={loading}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>
      </div>

      <Table
        className="operation-logs-table"
        columns={columns}
        dataSource={logsList}
        rowKey="id"
        loading={loading}
        locale={{ emptyText }}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (totalCount, range) => `第${range[0]}-${range[1]}条，共${totalCount}条`,
          position: ['bottomRight'],
        }}
      />

      <Drawer
        title="日志详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={560}
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="ID">{selectedLog?.id ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="操作用户">{selectedLog?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="操作类型">
            {selectedLog?.action ? (
              <Tag>{actionLabelMap.get(selectedLog.action) || selectedLog.action}</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="操作模块">{selectedLog?.module || '-'}</Descriptions.Item>
          <Descriptions.Item label="操作IP">{selectedLog?.ip_address || '-'}</Descriptions.Item>
          <Descriptions.Item label="操作时间">
            {selectedLog?.created_at ? dayjs(selectedLog.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">操作描述</Text>
          <Typography.Paragraph
            style={{ marginTop: 8, marginBottom: 0 }}
            copyable={detailDescription ? { text: detailDescription } : false}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {detailDescription || selectedLog?.description || '-'}
            </pre>
          </Typography.Paragraph>
        </div>
      </Drawer>
    </div>
  );
};

export default OperationLogs;
