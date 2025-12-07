import { Upload, message } from 'antd'
import type { RcFile } from 'antd/es/upload'

// 允许的图片类型，后续如有附件上传可扩展
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp'
const IMAGE_MIME_WHITELIST = IMAGE_ACCEPT.split(',')

/**
 * 图片上传前校验：类型 + 大小
 * 解决：后台上传入口允许任意文件（P0/P1 安全加固）
 */
export function validateImageBeforeUpload(file: RcFile, maxSizeMB = 5) {
  const isAllowedType = IMAGE_MIME_WHITELIST.includes(file.type)
  if (!isAllowedType) {
    message.error('仅支持上传 png/jpg/jpeg/webp 图片')
    return Upload.LIST_IGNORE
  }
  const sizeLimit = maxSizeMB * 1024 * 1024
  if (file.size > sizeLimit) {
    message.error(`图片大小不能超过 ${maxSizeMB}MB`)
    return Upload.LIST_IGNORE
  }
  return true
}

