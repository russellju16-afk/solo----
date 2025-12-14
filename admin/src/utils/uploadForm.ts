import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'

type UploadImageResponse = {
  url?: string
}

export function normalizeUploadFileList(
  e: UploadChangeParam<UploadFile<UploadImageResponse>> | UploadFile<UploadImageResponse>[],
  options?: {
    maxCount?: number
  }
): UploadFile<UploadImageResponse>[] {
  const fileList = Array.isArray(e) ? e : e.fileList || []
  const mapped = fileList.map((file) => {
    const responseUrl = file.response?.url
    if (responseUrl && !file.url) {
      return {
        ...file,
        url: responseUrl,
      }
    }
    return file
  })

  if (options?.maxCount && mapped.length > options.maxCount) {
    return mapped.slice(-options.maxCount)
  }

  return mapped
}
