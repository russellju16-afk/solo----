import axios from 'axios'

type MaybeServerError = {
  message?: string | string[]
  error?: string
}

export function getErrorMessage(error: unknown, fallback = '操作失败，请稍后重试') {
  if (axios.isAxiosError<MaybeServerError>(error)) {
    const data = error.response?.data
    const msg = data?.message
    if (Array.isArray(msg)) return msg.filter(Boolean).join('；')
    if (typeof msg === 'string' && msg.trim()) return msg
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error.message === 'string' && error.message.trim()) return error.message
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

