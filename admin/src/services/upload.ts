import http from './http'

export interface UploadImageResponse {
  url: string
}

export async function uploadImage(
  file: File,
  options?: {
    onProgress?: (percent: number) => void
    signal?: AbortSignal
  }
): Promise<UploadImageResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return http.post<UploadImageResponse>('/admin/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      const total = event.total || 0
      if (!total) return
      const percent = Math.round((event.loaded / total) * 100)
      options?.onProgress?.(percent)
    },
    signal: options?.signal,
  })
}

