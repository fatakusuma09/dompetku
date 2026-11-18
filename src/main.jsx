import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register Service Worker for PWA (Chrome & iOS Safari)
if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost.disabled')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('PWA ServiceWorker terdaftar:', reg.scope))
      .catch((err) => console.warn('PWA ServiceWorker error:', err))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
