/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Modal, message, Popconfirm, Tag, Form, Switch, Typography } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userService } from '../../services/user';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const Users: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterForm] = Form.useForm();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<number | undefined>();

  // 角色选项
  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '运营', value: 'editor' },
    { label: '访客', value: 'viewer' },
  ];

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchText || undefined,
        role,
        status,
      };
      const res: any = await userService.getUsers(params);
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsersList(list);
      setTotal(res?.total || list.length || 0);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '获取用户列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, role, searchText, status]);

  // 初始加载 & 依赖变化时加载
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 搜索
  const handleSearch = (value?: string) => {
    setSearchText((value || keywordInput).trim());
    setCurrentPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setKeywordInput('');
    setRole(undefined);
    setStatus(undefined);
    setCurrentPage(1);
    filterForm.resetFields();
  };

  // 打开新增用户模态框
  const handleAdd = () => {
    setCurrentUser(null);
    form.resetFields();
    form.setFieldsValue({ status: true });
    setIsModalVisible(true);
  };

  // 打开编辑用户模态框
  const handleEdit = (record: any) => {
    setCurrentUser(record);
    form.setFieldsValue({
      username: record.username,
      name: record.name,
      email: record.email,
      role: record?.role?.name || record.role,
      status: record.status === 1,
      password: '',
    });
    setIsModalVisible(true);
  };

  // 删除用户
  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || '删除失败';
      message.error(msg);
    }
  };

  // 更新用户状态
  const handleStatusChange = async (id: number, enabled: number) => {
    try {
      await userService.updateUserStatus(id, enabled);
      message.success('状态更新成功');
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || '状态更新失败';
      message.error(msg);
    }
  };

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload: any = {
        ...values,
        status: values.status ? 1 : 0,
      };

      if (!payload.password) {
        delete payload.password;
      }

      if (currentUser) {
        await userService.updateUser(currentUser.id, payload);
        message.success('更新成功');
      } else {
        await userService.createUser(payload);
        message.success('创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      const msg = typeof error?.response?.data === 'string'
        ? error.response.data
        : error?.response?.data?.message || '操作失败，请稍后重试';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleTag = (value: string) => {
    const option = roleOptions.find(opt => opt.value === value);
    const color = value === 'admin' ? 'geekblue' : value === 'editor' ? 'green' : undefined;
    return <Tag color={color}>{option?.label || value || '--'}</Tag>;
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名/昵称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: any) => {
        const roleValue = role?.name || role;
        return roleValue ? roleTag(roleValue) : <Tag>--</Tag>;
      },
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
      render: (status: number, record: any) => (
        <Space size="small">
          <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '启用' : '停用'}</Tag>
          <Switch
            size="small"
            checked={status === 1}
            onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)}
          />
        </Space>
      ),
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '--'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '--'),
    },
    {
      title: '操作',
      key: 'action',
      width: 170,
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户？该用户将无法再登录后台。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>用户管理</Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>用于维护后台登录账号，可为不同角色分配权限并控制启用状态。</Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      {/* 筛选表单 */}
      <Form
        form={filterForm}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Space size="middle" wrap>
          <Form.Item>
            <Input.Search
              placeholder="搜索用户名、姓名或邮箱"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 320 }}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onSearch={handleSearch}
            />
          </Form.Item>

          <Form.Item>
            <Select
              placeholder="按角色筛选"
              allowClear
              size="middle"
              style={{ width: 160 }}
              value={role}
              onChange={(value) => {
                setRole(value);
                setCurrentPage(1);
              }}
            >
              {roleOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Select
              placeholder="按状态筛选"
              allowClear
              size="middle"
              style={{ width: 140 }}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setCurrentPage(1);
              }}
            >
              <Option value={1}>启用</Option>
              <Option value={0}>停用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Space>
      </Form>

      <Table
        columns={columns}
        dataSource={usersList}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || pageSize);
          },
        }}
      />

      {/* 用户表单模态框 */}
      <Modal
        title={currentUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setCurrentUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
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

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roleOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              {
                required: !currentUser,
                message: '请输入密码',
              },
              { min: 6, message: '密码长度不少于6位' },
            ]}
          >
            <Input.Password placeholder={currentUser ? '不修改请留空' : '请输入密码'} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
              <Button
                onClick={() => {
                  if (currentUser) {
                    handleEdit(currentUser);
                  } else {
                    form.resetFields();
                    form.setFieldsValue({ status: true });
                  }
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
