import { message as antdMessage } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'

let boundMessageApi: MessageInstance | null = null
let isPatched = false

type MessageMethodName = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'open' | 'destroy'

type AnyFunc = (...args: any[]) => any

const originalMethods = {} as Record<MessageMethodName, AnyFunc>

function captureOriginal(method: MessageMethodName) {
  const current = (antdMessage as unknown as Record<string, AnyFunc>)[method]
  if (typeof current === 'function' && !originalMethods[method]) {
    originalMethods[method] = current.bind(antdMessage)
  }
}

export function bindAntdMessage(api: MessageInstance) {
  boundMessageApi = api

  if (isPatched) return
  isPatched = true

  const methods: MessageMethodName[] = ['success', 'error', 'info', 'warning', 'loading', 'open', 'destroy']
  methods.forEach((method) => captureOriginal(method))

  methods.forEach((method) => {
    ;(antdMessage as unknown as Record<string, AnyFunc>)[method] = (...args: any[]) => {
      if (boundMessageApi && typeof (boundMessageApi as any)[method] === 'function') {
        return (boundMessageApi as any)[method](...args)
      }
      return originalMethods[method]?.(...args)
    }
  })
}

