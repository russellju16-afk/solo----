/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import type { UploadProps } from 'antd';
import { Form, Input, Select, Upload, Button, Space, Tabs, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { brandService, categoryService, productService } from '../services/product';
import { uploadImage } from '../services/upload';
import { IMAGE_ACCEPT, validateImageBeforeUpload } from '../utils/upload';
import { normalizeUploadFileList } from '../utils/uploadForm';
import { getErrorMessage } from '../utils/errorMessage';

interface ProductFormProps {
  product?: any;
  categories: any[];
  brands: any[];
  isViewMode: boolean;
  onSuccess: () => void;
  onRefreshCategories?: () => void | Promise<void>;
  onRefreshBrands?: () => void | Promise<void>;
}

const applicableScenesOptions = [
  { label: '高校', value: '高校' },
  { label: '团餐', value: '团餐' },
  { label: '社会餐饮', value: '社会餐饮' },
  { label: '商超', value: '商超' },
  { label: '食品厂', value: '食品厂' },
  { label: '平台', value: '平台' },
  { label: '其他', value: '其他' },
];

const priceTrendOptions = [
  { label: '上涨', value: 'up' },
  { label: '下降', value: 'down' },
  { label: '平稳', value: 'flat' },
];

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  brands,
  isViewMode,
  onSuccess,
  onRefreshCategories,
  onRefreshBrands,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const imageFileList = Form.useWatch('images', form) || [];
  const [localCategories, setLocalCategories] = useState<any[]>(categories);
  const [localBrands, setLocalBrands] = useState<any[]>(brands);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  useEffect(() => setLocalCategories(categories), [categories]);
  useEffect(() => setLocalBrands(brands), [brands]);

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        ...product,
        category_id: product.category?.id,
        brand_id: product.brand?.id,
        applicable_scenes: product.applicable_scenes || [],
        images: product.images?.map((img: any) => ({
          uid: img.id,
          name: img.url.split('/').pop(),
          status: 'done',
          url: img.url,
        })) || [],
      });
    } else {
      form.resetFields();
    }
    setActiveTab('1');
    setNewCategoryName('');
    setNewBrandName('');
    setCategoryModalOpen(false);
    setBrandModalOpen(false);
  }, [product, form]);

  const sortByOrderAndName = (a: any, b: any) => {
    const orderDiff = (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a?.name || '').localeCompare(String(b?.name || ''), 'zh-Hans-CN');
  };

  const categoryOptions = localCategories.map((category) => ({
    label: category?.name,
    value: category?.id,
  }));

  const brandOptions = localBrands.map((brand) => ({
    label: brand?.name,
    value: brand?.id,
  }));

  const handleCreateCategory = async () => {
    if (creatingCategory) return;
    const name = newCategoryName.trim();
    if (!name) {
      message.warning('请输入品类名称');
      return;
    }

    const exists = localCategories.find((item: any) => String(item?.name || '').trim().toLowerCase() === name.toLowerCase());
    if (exists?.id) {
      message.info('该品类已存在，已自动选择');
      form.setFieldValue('category_id', exists.id);
      setNewCategoryName('');
      setCategoryModalOpen(false);
      return;
    }

    setCreatingCategory(true);
    try {
      const res: any = await categoryService.createCategory({ name });
      const created = res?.data || res;
      const createdId = created?.id;
      if (createdId) {
        setLocalCategories((prev) => [...prev, created].sort(sortByOrderAndName));
        form.setFieldValue('category_id', createdId);
      } else {
        await Promise.resolve(onRefreshCategories?.());
      }
      message.success('已新增品类');
      setNewCategoryName('');
      setCategoryModalOpen(false);
      Promise.resolve(onRefreshCategories?.()).catch(() => undefined);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateBrand = async () => {
    if (creatingBrand) return;
    const name = newBrandName.trim();
    if (!name) {
      message.warning('请输入品牌名称');
      return;
    }

    const exists = localBrands.find((item: any) => String(item?.name || '').trim().toLowerCase() === name.toLowerCase());
    if (exists?.id) {
      message.info('该品牌已存在，已自动选择');
      form.setFieldValue('brand_id', exists.id);
      setNewBrandName('');
      setBrandModalOpen(false);
      return;
    }

    setCreatingBrand(true);
    try {
      const res: any = await brandService.createBrand({ name });
      const created = res?.data || res;
      const createdId = created?.id;
      if (createdId) {
        setLocalBrands((prev) => [...prev, created].sort(sortByOrderAndName));
        form.setFieldValue('brand_id', createdId);
      } else {
        await Promise.resolve(onRefreshBrands?.());
      }
      message.success('已新增品牌');
      setNewBrandName('');
      setBrandModalOpen(false);
      Promise.resolve(onRefreshBrands?.()).catch(() => undefined);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setCreatingBrand(false);
    }
  };

  const imageUploadRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      const resp = await uploadImage(file as File, {
        onProgress: (percent) => onProgress?.({ percent }, file as any),
      });
      onSuccess?.(resp as any);
    } catch (error) {
      onError?.(error as any);
    }
  };

  // 表单提交
  const onFinish = async (values: any) => {
    const imagesUploading = values.images?.some((img: any) => img.status === 'uploading');
    if (imagesUploading) {
      message.warning('图片上传中，请稍后再提交');
      return;
    }

    setLoading(true);
    try {
      // 处理图片数据
      const imageUrls = (values.images || [])
        .filter((img: any) => img.status === 'done')
        .map((img: any) => img.url);
      
      // 构建产品数据
      const productData = {
        ...values,
        images: imageUrls,
      };
      
      if (product) {
        // 更新产品
        await productService.updateProduct(product.id, productData);
      } else {
        // 创建产品
        await productService.createProduct(productData);
      }
      
      // 提交成功回调
      onSuccess();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={isViewMode}
      initialValues={{
        applicable_scenes: [],
        status: 1,
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: '1', label: '基本信息' },
          { key: '2', label: '业务信息' },
          { key: '3', label: '行情信息' },
          { key: '4', label: '图片管理' },
        ]}
      />

      <div style={{ display: activeTab === '1' ? 'block' : 'none' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          
          <Form.Item label="品类" required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="category_id"
                rules={[{ required: true, message: '请选择品类' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select
                  placeholder="请选择品类"
                  showSearch
                  optionFilterProp="label"
                  options={categoryOptions}
                />
              </Form.Item>
              {!isViewMode && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setNewCategoryName('');
                    setCategoryModalOpen(true);
                  }}
                >
                  新增品类
                </Button>
              )}
            </Space.Compact>
          </Form.Item>
          
          <Form.Item label="品牌" required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="brand_id"
                rules={[{ required: true, message: '请选择品牌' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select
                  placeholder="请选择品牌"
                  showSearch
                  optionFilterProp="label"
                  options={brandOptions}
                />
              </Form.Item>
              {!isViewMode && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setNewBrandName('');
                    setBrandModalOpen(true);
                  }}
                >
                  新增品牌
                </Button>
              )}
            </Space.Compact>
          </Form.Item>
          
          <Form.Item
            name="spec_weight"
            label="规格重量"
            rules={[{ required: true, message: '请输入规格重量' }]}
          >
            <Input placeholder="请输入规格重量，如：5kg" />
          </Form.Item>
          
          <Form.Item
            name="package_type"
            label="包装类型"
            rules={[{ required: true, message: '请输入包装类型' }]}
          >
            <Input placeholder="请输入包装类型，如：袋装/箱装" />
          </Form.Item>
          
          <Form.Item
            name="applicable_scenes"
            label="适用场景"
            rules={[{ required: true, message: '请选择适用场景' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择适用场景"
              options={applicableScenesOptions}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="产品描述"
          >
            <Input.TextArea rows={4} placeholder="请输入产品描述" />
          </Form.Item>
        </Space>
      </div>

      <div style={{ display: activeTab === '2' ? 'block' : 'none' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="moq"
            label="最低起订量"
          >
            <Input placeholder="请输入最低起订量" />
          </Form.Item>
          
          <Form.Item
            name="supply_area"
            label="供应区域"
          >
            <Input placeholder="请输入供应区域" />
          </Form.Item>
        </Space>
      </div>

      <div style={{ display: activeTab === '3' ? 'block' : 'none' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="price_trend"
            label="价格趋势"
          >
            <Select placeholder="请选择价格趋势" options={priceTrendOptions} />
          </Form.Item>
          
          <Form.Item
            name="latest_price_updated_at"
            label="最近价格更新时间"
          >
            <Input type="datetime-local" />
          </Form.Item>
          
          <Form.Item
            name="latest_price_note"
            label="内部参考备注"
          >
            <Input.TextArea rows={3} placeholder="请输入内部参考备注" />
          </Form.Item>
        </Space>
      </div>

      <div style={{ display: activeTab === '4' ? 'block' : 'none' }}>
        <Form.Item
          name="images"
          label="产品图片"
          valuePropName="fileList"
          getValueFromEvent={(e) => normalizeUploadFileList(e, { maxCount: 10 })}
        >
          <Upload
            name="file"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList
            accept={IMAGE_ACCEPT}
            customRequest={imageUploadRequest}
            maxCount={10}
            disabled={isViewMode}
            beforeUpload={(file) => validateImageBeforeUpload(file, 5)} // 图片安全限制
          >
            {imageFileList.length < 10 && !isViewMode && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        <p style={{ marginTop: 16, color: '#999' }}>最多上传10张图片，第一张为封面图</p>
      </div>
      
      {/* 提交按钮 */}
      {!isViewMode && (
        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
            <Button htmlType="reset">重置</Button>
          </Space>
        </Form.Item>
      )}

      <Modal
        title="新增品类"
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        okText="确定"
        cancelText="取消"
        onOk={handleCreateCategory}
        confirmLoading={creatingCategory}
        destroyOnHidden
      >
        <Input
          autoFocus
          placeholder="请输入品类名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            handleCreateCategory();
          }}
        />
      </Modal>

      <Modal
        title="新增品牌"
        open={brandModalOpen}
        onCancel={() => setBrandModalOpen(false)}
        okText="确定"
        cancelText="取消"
        onOk={handleCreateBrand}
        confirmLoading={creatingBrand}
        destroyOnHidden
      >
        <Input
          autoFocus
          placeholder="请输入品牌名称"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            handleCreateBrand();
          }}
        />
      </Modal>
    </Form>
  );
};

export default ProductForm;
