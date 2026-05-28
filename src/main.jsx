import { StrictMode } from 'react'
// Force redeploy - 2026-04-22 (Admin Stability & PDF Fix)
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App />
)
