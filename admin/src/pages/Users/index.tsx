/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { userService } from '../../services/user';
import { useAuthStore } from '../../store/auth';
import './index.css';

const { Title, Paragraph, Text } = Typography;

type SortOrder = 'ascend' | 'descend' | null;
type SortField = 'username' | 'created_at' | 'last_login_at' | null;

type SortState = {
  field: SortField;
  order: SortOrder;
};

const SORT_STORAGE_KEY = 'admin:users:sortState';

const readSortState = (): SortState => {
  if (typeof window === 'undefined') return { field: 'created_at', order: 'descend' };
  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (!raw) return { field: 'created_at', order: 'descend' };
    const parsed = JSON.parse(raw);
    const field = parsed?.field as SortField;
    const order = parsed?.order as SortOrder;
    const validField = field === null || field === 'username' || field === 'created_at' || field === 'last_login_at';
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

const Users: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);

  const [listLoading, setListLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [resetPwdLoading, setResetPwdLoading] = useState(false);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [apiHint, setApiHint] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<number | undefined>();
  const [sortState, setSortState] = useState<SortState>(() => readSortState());

  const [filterForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [resetPwdForm] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEditingUser, setCurrentEditingUser] = useState<any | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailUser, setDetailUser] = useState<any | null>(null);

  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetPwdUserId, setResetPwdUserId] = useState<number | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => authUser?.id ?? null);

  const roleOptions = useMemo(
    () => [
      { label: '管理员', value: 'admin' },
      { label: '运营', value: 'editor' },
      { label: '访客', value: 'viewer' },
    ],
    [],
  );

  const roleLabelMap = useMemo(() => new Map(roleOptions.map(option => [option.value, option.label])), [roleOptions]);

  useEffect(() => {
    if (authUser?.id) {
      setCurrentUserId(authUser.id);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (currentUserId) return;

    let mounted = true;
    userService
      .getCurrentUser()
      .then((res: any) => {
        const info = (res as any)?.data ?? res;
        if (!mounted) return;
        if (typeof info?.id === 'number') setCurrentUserId(info.id);

        if (info?.id && info?.username) {
          useAuthStore.setState((state) => {
            if (state.user) return state;
            return {
              ...state,
              user: {
                id: info.id,
                username: info.username,
                name: info.name || info.username,
                phone: info.phone || '',
                role: info.role?.name || info.role || '',
                status: typeof info.status === 'number' ? info.status : 1,
              },
            };
          });
        }
      })
      .catch(() => {
        // ignore
      });

    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  const hasActiveFilters = useMemo(() => Boolean(keyword || role || status !== undefined), [keyword, role, status]);

  const buildQueryParams = useCallback(
    (
      override?: Partial<{
        page: number;
        pageSize: number;
        keyword: string;
        role?: string;
        status?: number;
      }>,
    ) => {
      const resolvedKeyword = (override?.keyword ?? keyword)?.trim();
      return {
        page: override?.page ?? currentPage,
        pageSize: override?.pageSize ?? pageSize,
        keyword: resolvedKeyword ? resolvedKeyword : undefined,
        role: override?.role ?? role,
        status: override?.status ?? status,
      };
    },
    [currentPage, keyword, pageSize, role, status],
  );

  const fetchUsers = useCallback(async () => {
    setListLoading(true);
    setApiHint(null);
    try {
      const res: any = await userService.getUsers(buildQueryParams());
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsersList(list);
      const resolvedTotal = Array.isArray(res) ? list.length : res?.total ?? list.length ?? 0;
      setTotal(resolvedTotal);
    } catch (error: any) {
      const statusCode = error?.response?.status;
      if (statusCode === 404) {
        setApiHint('用户接口暂未启用或返回 404，可先确认服务端路由与反向代理配置。');
      } else {
        setApiHint('暂时无法获取用户列表，请稍后点击“刷新”重试。');
      }
      setUsersList([]);
      setTotal(0);
    } finally {
      setListLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applyFilters = () => {
    const values = filterForm.getFieldsValue();
    setKeyword((values?.keyword || '').trim());
    setRole(values?.role);
    setStatus(values?.status);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    filterForm.resetFields();
    setKeyword('');
    setRole(undefined);
    setStatus(undefined);
    setCurrentPage(1);
  };

  const openAddUser = () => {
    setCurrentEditingUser(null);
    userForm.resetFields();
    userForm.setFieldsValue({ status: true });
    setIsModalVisible(true);
  };

  const openEditUser = (record: any) => {
    setCurrentEditingUser(record);
    userForm.setFieldsValue({
      username: record?.username,
      name: record?.name,
      phone: record?.phone,
      email: record?.email,
      role: record?.role?.name || record?.role,
      status: Number(record?.status) === 1,
      password: '',
    });
    setIsModalVisible(true);
  };

  const closeUserModal = () => {
    setIsModalVisible(false);
    setCurrentEditingUser(null);
    userForm.resetFields();
  };

  const handleSaveUser = async (values: any) => {
    setSaveLoading(true);
    try {
      const payload: any = {
        ...values,
        status: values.status ? 1 : 0,
      };

      if (!payload.password) delete payload.password;

      if (currentEditingUser?.id) {
        await userService.updateUser(currentEditingUser.id, payload);
        message.success('更新成功');
      } else {
        await userService.createUser(payload);
        message.success('创建成功');
      }

      closeUserModal();
      fetchUsers();
    } catch (error: any) {
      const msg =
        typeof error?.response?.data === 'string'
          ? error.response.data
          : error?.response?.data?.message || error?.message || '操作失败，请稍后重试';
      message.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUserId && id === currentUserId) {
      message.warning('不能删除自己的账号');
      return;
    }
    try {
      await userService.deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '删除失败';
      message.error(msg);
    }
  };

  const handleStatusChange = async (id: number, enabled: number) => {
    if (currentUserId && id === currentUserId) {
      message.warning('不能禁用自己的账号');
      return;
    }
    try {
      await userService.updateUserStatus(id, enabled);
      message.success('状态更新成功');
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '状态更新失败';
      message.error(msg);
    }
  };

  const roleTag = (value: any) => {
    const roleValue = value?.name || value;
    const label = roleLabelMap.get(roleValue) || roleValue || '--';
    const color = roleValue === 'admin' ? 'geekblue' : roleValue === 'editor' ? 'green' : undefined;
    return <Tag color={color}>{label}</Tag>;
  };

  const openDetail = (id: number) => {
    setDetailUserId(id);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailUserId(null);
    setDetailUser(null);
  };

  useEffect(() => {
    if (!detailOpen || !detailUserId) return;
    let mounted = true;
    setDetailLoading(true);
    setDetailUser(null);
    userService
      .getUserById(detailUserId)
      .then((res: any) => {
        const info = (res as any)?.data ?? res;
        if (!mounted) return;
        setDetailUser(info);
      })
      .catch((error: any) => {
        const msg = error?.response?.data?.message || error?.message || '获取用户详情失败';
        message.error(msg);
      })
      .finally(() => {
        if (!mounted) return;
        setDetailLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [detailOpen, detailUserId]);

  const openResetPwd = (id: number) => {
    setResetPwdUserId(id);
    setResetPwdOpen(true);
    resetPwdForm.resetFields();
  };

  const closeResetPwd = () => {
    setResetPwdOpen(false);
    setResetPwdUserId(null);
    resetPwdForm.resetFields();
  };

  const handleResetPwd = async () => {
    if (!resetPwdUserId) return;
    setResetPwdLoading(true);
    try {
      const values = await resetPwdForm.validateFields();
      await userService.updateUser(resetPwdUserId, { password: values.newPassword });
      message.success('密码已重置');
      closeResetPwd();
    } catch (error: any) {
      if (error?.errorFields) return;
      const msg = error?.response?.data?.message || error?.message || '重置密码失败';
      message.error(msg);
    } finally {
      setResetPwdLoading(false);
    }
  };

  const handleExport = () => {
    const exportTotal = total || usersList.length;
    const exportLimit = 5000;
    const willLimit = exportTotal > exportLimit;

    Modal.confirm({
      title: '导出用户',
      okText: '开始导出',
      cancelText: '取消',
      content: (
        <div>
          <div>
            将按当前筛选条件导出{willLimit ? `前 ${exportLimit} 条（总计 ${exportTotal} 条）` : ` ${exportTotal} 条`}用户。
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
            const res: any = await userService.getUsers(buildQueryParams({ page, pageSize: batchSize }));
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

          const statusLabel = (value: any) => (Number(value) === 1 ? '启用' : '停用');
          const roleLabel = (value: any) => {
            const roleValue = value?.name || value || '';
            return roleLabelMap.get(roleValue) || roleValue || '';
          };

          const header = ['用户名', '姓名', '角色', '邮箱', '状态', '最后登录时间', '创建时间'];
          const lines = [
            header.join(','),
            ...limitedRows.map((row) => {
              const lastLogin = row?.last_login_at ? dayjs(row.last_login_at).format('YYYY-MM-DD HH:mm:ss') : '';
              const createdAt = row?.created_at ? dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss') : '';
              return [
                escapeCsv(row?.username),
                escapeCsv(row?.name),
                escapeCsv(roleLabel(row?.role)),
                escapeCsv(row?.email),
                escapeCsv(statusLabel(row?.status)),
                escapeCsv(lastLogin),
                escapeCsv(createdAt),
              ].join(',');
            }),
          ];

          const csv = `\ufeff${lines.join('\r\n')}`;
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `users_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      sorter: (a: any, b: any) => String(a?.username || '').localeCompare(String(b?.username || '')),
      sortOrder: sortState.field === 'username' ? sortState.order : null,
    },
    {
      title: '姓名/昵称',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => value || '--',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (value: any) => (value ? roleTag(value) : <Tag>--</Tag>),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (value: string) => value || '--',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: number, record: any) => {
        const isSelf = Boolean(currentUserId && record.id === currentUserId);
        const checked = Number(value) === 1;
        const switchNode = (
          <Switch
            size="small"
            checked={checked}
            onChange={(nextChecked) => handleStatusChange(record.id, nextChecked ? 1 : 0)}
          />
        );

        return (
          <Space size="small">
            <Tag color={checked ? 'green' : 'red'}>{checked ? '启用' : '停用'}</Tag>
            {isSelf ? (
              <Tooltip title="不能禁用自己的账号">
                <span>{switchNode}</span>
              </Tooltip>
            ) : (
              switchNode
            )}
          </Space>
        );
      },
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      sorter: (a: any, b: any) => dayjs(a?.last_login_at || 0).valueOf() - dayjs(b?.last_login_at || 0).valueOf(),
      sortOrder: sortState.field === 'last_login_at' ? sortState.order : null,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '--'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a: any, b: any) => dayjs(a?.created_at || 0).valueOf() - dayjs(b?.created_at || 0).valueOf(),
      sortOrder: sortState.field === 'created_at' ? sortState.order : null,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '--'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (record: any) => {
        const isSelf = Boolean(currentUserId && record.id === currentUserId);
        return (
          <Space size="middle">
            <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
              查看
            </Button>
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditUser(record)}>
              编辑
            </Button>
            {isSelf ? (
              <Tooltip title="不能删除自己的账号">
                <span>
                  <Button type="link" danger icon={<DeleteOutlined />} disabled>
                    删除
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Popconfirm
                title="删除后该用户将无法登录后台，是否继续？"
                onConfirm={() => handleDelete(record.id)}
                okText="继续删除"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            )}
            <Button type="link" onClick={() => openResetPwd(record.id)}>
              重置密码
            </Button>
          </Space>
        );
      },
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
    <div className="users-empty">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div>{apiHint ? '暂时无法获取用户列表' : '暂无用户数据'}</div>
            <span className="users-empty-hint">{apiHint || '你可以点击“刷新”，或清空筛选条件后重试。'}</span>
          </div>
        }
      >
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} disabled={listLoading}>
            刷新
          </Button>
          <Button onClick={resetFilters} disabled={!hasActiveFilters || listLoading}>
            清空条件
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddUser} disabled={listLoading}>
            新增用户
          </Button>
        </Space>
      </Empty>
    </div>
  );

  const detailRole = detailUser?.role?.name || detailUser?.role || '--';
  const detailStatus = typeof detailUser?.status === 'number' ? (detailUser.status === 1 ? '启用' : '停用') : '--';

  return (
    <div>
      <div className="users-header">
        <div>
          <Title level={3} className="users-header-title">
            用户管理
          </Title>
          <Paragraph className="users-header-subtitle">用于维护后台登录账号，可为不同角色分配权限并控制启用状态。</Paragraph>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddUser}>
            新增用户
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={listLoading}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading} disabled={listLoading}>
            导出
          </Button>
        </Space>
      </div>

      <div className="users-filters">
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{
            keyword: '',
            role: undefined,
            status: undefined,
          }}
        >
          <Space size="middle" wrap>
            <Form.Item label="关键词" name="keyword">
              <Input
                placeholder="搜索用户名、姓名、邮箱"
                allowClear
                style={{ width: 320, minWidth: 260 }}
                onPressEnter={applyFilters}
              />
            </Form.Item>

            <Form.Item label="角色" name="role">
              <Select
                placeholder="按角色筛选"
                allowClear
                options={roleOptions}
                style={{ width: 180, minWidth: 160 }}
              />
            </Form.Item>

            <Form.Item label="状态" name="status">
              <Select
                placeholder="按状态筛选"
                allowClear
                options={[
                  { label: '启用', value: 1 },
                  { label: '停用', value: 0 },
                ]}
                style={{ width: 180, minWidth: 160 }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters} loading={listLoading}>
                  查询
                </Button>
                <Button onClick={resetFilters} disabled={listLoading}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>
      </div>

      <Table
        className="users-table"
        columns={columns}
        dataSource={usersList}
        rowKey="id"
        loading={listLoading}
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

      <Modal
        title={currentEditingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={closeUserModal}
        footer={null}
        width={600}
      >
        <Form form={userForm} layout="vertical" onFinish={handleSaveUser}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度需在3-20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '仅支持字母、数字或下划线' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item name="phone" label="电话" rules={[{ pattern: /^[0-9+\-() ]*$/, message: '请输入有效的电话' }]}>
            <Input placeholder="请输入电话（选填）" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={roleOptions} />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: !currentEditingUser, message: '请输入密码' },
              { min: 6, message: '密码长度不少于6位' },
            ]}
          >
            <Input.Password placeholder={currentEditingUser ? '不修改请留空' : '请输入密码'} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={saveLoading}>
                提交
              </Button>
              <Button
                onClick={() => {
                  if (currentEditingUser) {
                    openEditUser(currentEditingUser);
                  } else {
                    userForm.resetFields();
                    userForm.setFieldsValue({ status: true });
                  }
                }}
                disabled={saveLoading}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="用户详情"
        open={detailOpen}
        onClose={closeDetail}
        width={560}
        extra={
          <Space>
            <Button onClick={() => detailUserId && openResetPwd(detailUserId)} disabled={!detailUserId}>
              重置密码
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (detailUser) {
                  openEditUser(detailUser);
                  setDetailOpen(false);
                }
              }}
              disabled={!detailUser}
            >
              编辑
            </Button>
          </Space>
        }
      >
        <Spin spinning={detailLoading}>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="用户名">{detailUser?.username || '--'}</Descriptions.Item>
            <Descriptions.Item label="姓名">{detailUser?.name || '--'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detailUser?.email || '--'}</Descriptions.Item>
            <Descriptions.Item label="电话">{detailUser?.phone || '--'}</Descriptions.Item>
            <Descriptions.Item label="角色">{roleTag(detailRole)}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                color={detailStatus === '启用' ? 'green' : detailStatus === '停用' ? 'red' : undefined}
              >
                {detailStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detailUser?.created_at ? dayjs(detailUser.created_at).format('YYYY-MM-DD HH:mm:ss') : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {detailUser?.updated_at ? dayjs(detailUser.updated_at).format('YYYY-MM-DD HH:mm:ss') : '--'}
            </Descriptions.Item>
          </Descriptions>
        </Spin>
      </Drawer>

      <Modal
        title="重置密码"
        open={resetPwdOpen}
        onOk={handleResetPwd}
        onCancel={closeResetPwd}
        confirmLoading={resetPwdLoading}
        okText="提交"
        cancelText="取消"
      >
        <Form form={resetPwdForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不少于6位' },
            ]}
          >
            <Input.Password placeholder="至少6位" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const newPassword = getFieldValue('newPassword');
                  if (!value || newPassword === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
