/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Upload, Button, Space, Tabs, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { productService } from '../services/product';

const { Option } = Select;
const { TabPane } = Tabs;

interface ProductFormProps {
  product?: any;
  categories: any[];
  brands: any[];
  isViewMode: boolean;
  onSuccess: () => void;
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
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any[]>([]);

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
      setImages(product.images || []);
    } else {
      form.resetFields();
      setImages([]);
    }
  }, [product, form]);

  // 图片上传处理
  const handleUploadChange = (info: any) => {
    let fileList = [...info.fileList];
    
    // 只保留最新的10张图片
    fileList = fileList.slice(-10);
    
    // 处理上传状态
    fileList = fileList.map((file: any) => {
      if (file.response) {
        // 上传成功
        return {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: file.response.url,
        };
      }
      return file;
    });
    
    // 更新表单字段
    form.setFieldsValue({ images: fileList });
  };

  // 表单提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 处理图片数据
      const imageUrls = values.images
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
      message.error('操作失败');
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
      <Tabs defaultActiveKey="1">
        {/* 基本信息 */}
        <TabPane tab="基本信息" key="1">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              name="name"
              label="产品名称"
              rules={[{ required: true, message: '请输入产品名称' }]}
            >
              <Input placeholder="请输入产品名称" />
            </Form.Item>
            
            <Form.Item
              name="category_id"
              label="品类"
              rules={[{ required: true, message: '请选择品类' }]}
            >
              <Select placeholder="请选择品类">
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="brand_id"
              label="品牌"
              rules={[{ required: true, message: '请选择品牌' }]}
            >
              <Select placeholder="请选择品牌">
                {brands.map((brand) => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
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
        </TabPane>
        
        {/* 业务信息 */}
        <TabPane tab="业务信息" key="2">
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
        </TabPane>
        
        {/* 行情信息 */}
        <TabPane tab="行情信息" key="3">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              name="price_trend"
              label="价格趋势"
            >
              <Select placeholder="请选择价格趋势">
                {priceTrendOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
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
        </TabPane>
        
        {/* 图片管理 */}
        <TabPane tab="图片管理" key="4">
          <Form.Item
            name="images"
            label="产品图片"
          >
            <Upload
              name="file"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              onChange={handleUploadChange}
              disabled={isViewMode}
              beforeUpload={() => false} // 手动上传
            >
              {images.length < 10 && !isViewMode && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            <p style={{ marginTop: 16, color: '#999' }}>最多上传10张图片，第一张为封面图</p>
          </Form.Item>
        </TabPane>
      </Tabs>
      
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
    </Form>
  );
};

export default ProductForm;
