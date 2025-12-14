import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'

type UploadImageResponse = {
  url?: string
}

export function normalizeUploadUrl(url?: string | null) {
  if (!url) return ''
  const trimmed = String(url).trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

export function toSingleImageFileList(url?: string | null, uid = '1'): UploadFile<UploadImageResponse>[] {
  const normalized = normalizeUploadUrl(url)
  if (!normalized) return []
  const nameSource = normalized.split('?')[0]
  const filename = nameSource.split('/').pop()
  return [
    {
      uid,
      name: filename ? decodeURIComponent(filename) : 'image',
      status: 'done',
      url: normalized,
    },
  ]
}

export function getSingleUploadUrl(fileList?: UploadFile<UploadImageResponse>[] | null) {
  const url = fileList?.[0]?.url
  return normalizeUploadUrl(url)
}

export function normalizeUploadFileList(
  e: UploadChangeParam<UploadFile<UploadImageResponse>> | UploadFile<UploadImageResponse>[],
  options?: {
    maxCount?: number
  }
): UploadFile<UploadImageResponse>[] {
  const fileList = Array.isArray(e) ? e : e.fileList || []
  const mapped = fileList.map((file) => {
    const responseUrl = normalizeUploadUrl(file.response?.url)
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
