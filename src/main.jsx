import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#f0ede8',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          fontSize: '13px',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        },
        success: { iconTheme: { primary: '#D4A04A', secondary: '#0f0f0f' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#0f0f0f' } },
      }}
    />
  </StrictMode>,
)
