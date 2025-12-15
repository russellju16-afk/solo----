/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { brandService } from '../../services/product';
import { getErrorMessage } from '../../utils/errorMessage';

export type BrandPanelRef = {
  refresh: () => Promise<void>;
  openCreate: () => void;
};

type Props = {
  brands: any[];
  onRefresh: () => void | Promise<void>;
};

const BrandPanel = React.forwardRef<BrandPanelRef, Props>(({ brands, onRefresh }, ref) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  const openCreate = useCallback(() => {
    setCurrentBrand(null);
    form.resetFields();
    form.setFieldsValue({ sort_order: 0 });
    setModalOpen(true);
  }, [form]);

  useImperativeHandle(
    ref,
    () => ({
      refresh,
      openCreate,
    }),
    [openCreate, refresh],
  );

  const openEdit = (brand: any) => {
    setCurrentBrand(brand);
    form.setFieldsValue({
      name: brand?.name,
      description: brand?.description,
      sort_order: brand?.sort_order ?? 0,
    });
    setModalOpen(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedKeyword(searchText.trim());
  };

  const handleReset = () => {
    setSearchText('');
    setAppliedKeyword('');
    setCurrentPage(1);
  };

  const filteredBrands = useMemo(() => {
    const keyword = appliedKeyword.trim();
    if (!keyword) return brands;
    return brands.filter((brand) => String(brand?.name || '').includes(keyword));
  }, [appliedKeyword, brands]);

  const handleDelete = async (id: number) => {
    try {
      await brandService.deleteBrand(id);
      message.success('删除成功');
      await refresh();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const onFinish = async (values: any) => {
    if (saving) return;
    setSaving(true);
    try {
      if (currentBrand?.id) {
        await brandService.updateBrand(currentBrand.id, values);
        message.success('更新成功');
      } else {
        await brandService.createBrand(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      setCurrentBrand(null);
      form.resetFields();
      await refresh();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个品牌吗？"
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
      <div className="products-filters">
        <Space size="middle" wrap>
          <Space.Compact style={{ width: 320, minWidth: 260 }}>
            <Input
              placeholder="搜索品牌名称"
              allowClear
              size="middle"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button size="middle" icon={<SearchOutlined />} onClick={handleSearch} aria-label="搜索" />
          </Space.Compact>
          <Button onClick={handleReset} disabled={!searchText && !appliedKeyword}>
            重置
          </Button>
        </Space>
      </div>

      <Table
        className="products-table"
        columns={columns}
        dataSource={filteredBrands}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredBrands.length,
          onChange: (page, nextPageSize) => {
            setCurrentPage(page);
            setPageSize(nextPageSize);
          },
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (totalCount, range) => `第${range[0]}-${range[1]}条，共${totalCount}条`,
          position: ['bottomRight'],
        }}
      />

      <Modal
        title={currentBrand ? '编辑品牌' : '新增品牌'}
        open={modalOpen}
        onCancel={() => {
          if (saving) return;
          setModalOpen(false);
          setCurrentBrand(null);
          form.resetFields();
        }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ sort_order: 0 }}>
          <Form.Item
            name="name"
            label="品牌名称"
            rules={[
              { required: true, message: '请输入品牌名称' },
              { min: 1, max: 50, message: '品牌名称长度为1-50个字符' },
            ]}
          >
            <Input placeholder="请输入品牌名称" />
          </Form.Item>

          <Form.Item name="description" label="描述" rules={[{ max: 200, message: '描述长度不超过200个字符' }]}>
            <Input.TextArea rows={3} placeholder="请输入品牌描述（选填）" />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
            rules={[
              { required: true, message: '请输入排序' },
              { type: 'number', message: '请输入数字' },
            ]}
          >
            <InputNumber min={0} max={1000} placeholder="请输入排序" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving} disabled={saving}>
                提交
              </Button>
              <Button
                onClick={() => {
                  if (currentBrand) {
                    openEdit(currentBrand);
                  } else {
                    form.resetFields();
                    form.setFieldsValue({ sort_order: 0 });
                  }
                }}
                disabled={saving}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

BrandPanel.displayName = 'BrandPanel';

export default BrandPanel;
