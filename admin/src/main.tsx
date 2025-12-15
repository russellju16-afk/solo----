import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { preMessage } from 'rc-util/es/warning'
import './index.css'

if (import.meta.env.DEV) {
  preMessage((msg, type) => {
    if (type === 'warning' && typeof msg === 'string' && msg.includes('There may be circular references')) {
      return null
    }
    return msg
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
