import React, { useState } from 'react';
import { Modal, Button, Upload, message, Table, Progress } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { importProducts, downloadImportTemplate } from '../../../services/product';

interface ProductImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; field: string; message: string }[];
  errorFileUrl?: string;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  // 下载导入模板
  const handleDownloadTemplate = async () => {
    try {
      await downloadImportTemplate();
      message.success('模板下载成功');
    } catch (error) {
      message.error('模板下载失败');
    }
  };

  // 自定义上传逻辑
  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    setImportResult(null);
    
    try {
      const result = await importProducts(file);
      setImportResult(result);
      onSuccess(result);
      
      if (result.success > 0) {
        message.success(`成功导入 ${result.success} 条产品`);
        onSuccess();
      }
      if (result.failed > 0) {
        message.error(`导入失败 ${result.failed} 条产品`);
      }
    } catch (error: any) {
      onError(error);
      message.error(error.message || '导入失败');
    } finally {
      setUploading(false);
    }
  };

  // 上传前校验
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel';
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isXlsx) {
      message.error('仅支持上传 .xlsx/.xls 文件');
      return Upload.LIST_IGNORE;
    }
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 处理文件变化
  const handleFileChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 关闭模态框
  const handleClose = () => {
    setFileList([]);
    setImportResult(null);
    setLoading(false);
    setUploading(false);
    onCancel();
  };

  // 下载错误明细
  const handleDownloadError = () => {
    if (importResult?.errorFileUrl) {
      window.open(importResult.errorFileUrl, '_blank');
    }
  };

  // 错误列表列配置
  const errorColumns = [
    {
      title: '行号',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: '字段',
      dataIndex: 'field',
      key: 'field',
      width: 120,
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  return (
    <Modal
      title="批量导入产品"
      visible={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          style={{ marginBottom: 16 }}
        >
          下载导入模板
        </Button>
        
        <div style={{ marginBottom: 16 }}>
          <Upload
            name="file"
            fileList={fileList}
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading}>
              {uploading ? '上传中...' : '选择文件并上传'}
            </Button>
            <p style={{ margin: '8px 0 0 0', color: '#999' }}>支持 .xlsx/.xls 文件，大小不超过 10MB</p>
          </Upload>
        </div>

        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <Progress percent={50} status="active" />
            <p style={{ margin: '8px 0 0 0', color: '#999', textAlign: 'center' }}>正在导入数据...</p>
          </div>
        )}

        {importResult && (
          <div style={{ marginTop: 16 }}>
            <h4>导入结果</h4>
            <div style={{ marginBottom: 16 }}>
              <div>总条数: {importResult.total}</div>
              <div style={{ color: '#52c41a' }}>成功条数: {importResult.success}</div>
              <div style={{ color: '#ff4d4f' }}>失败条数: {importResult.failed}</div>
            </div>

            {importResult.failed > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h5>失败明细</h5>
                {importResult.errorFileUrl && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadError}
                    style={{ marginBottom: 16 }}
                  >
                    下载失败明细
                  </Button>
                )}
                <Table
                  columns={errorColumns}
                  dataSource={importResult.errors.slice(0, 20)}
                  rowKey="row"
                  pagination={false}
                  scroll={{ y: 200 }}
                />
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <Button onClick={handleClose} style={{ marginRight: 8 }}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductImportModal;
