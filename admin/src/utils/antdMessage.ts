import { message as antdMessage } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'

let boundMessageApi: MessageInstance | null = null
let isPatched = false

type MessageMethodName = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'open' | 'destroy'

type MessageMethod = (...args: unknown[]) => unknown

const originalMethods: Partial<Record<MessageMethodName, MessageMethod>> = {}

function getMessageMethod(target: unknown, method: MessageMethodName): MessageMethod | undefined {
  if (!target || (typeof target !== 'object' && typeof target !== 'function')) return
  const record = target as Record<string, unknown>
  const candidate = record[method]
  if (typeof candidate === 'function') return candidate as MessageMethod
}

function captureOriginal(method: MessageMethodName) {
  if (originalMethods[method]) return
  const current = getMessageMethod(antdMessage, method)
  if (!current) return
  originalMethods[method] = (...args) => current(...args)
}

export function bindAntdMessage(api: MessageInstance) {
  boundMessageApi = api

  if (isPatched) return
  isPatched = true

  const methods: MessageMethodName[] = ['success', 'error', 'info', 'warning', 'loading', 'open', 'destroy']
  methods.forEach((method) => captureOriginal(method))

  methods.forEach((method) => {
    const record = antdMessage as unknown as Record<string, unknown>
    record[method] = (...args: unknown[]) => {
      const bound = boundMessageApi
      const boundMethod = bound ? getMessageMethod(bound, method) : undefined
      if (boundMethod) return boundMethod(...args)

      const original = originalMethods[method]
      return original ? original(...args) : undefined
    }
  })
}
