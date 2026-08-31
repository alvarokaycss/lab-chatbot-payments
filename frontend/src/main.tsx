import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { brand } from './config/brand'
document.title = `${brand.name} ${brand.suffix} — ${brand.subtitle}`
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
