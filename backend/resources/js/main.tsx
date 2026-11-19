import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initializeTelemetry } from './observability'

const root = createRoot(document.getElementById('root')!)
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

initializeTelemetry().catch(() => null).then((sdk) => {
  const content = sdk ? (
    <sdk.ErrorBoundary fallback={<main className="p-8 text-center">Ocorreu um erro inesperado. Recarregue a página para continuar.</main>}>
      {app}
    </sdk.ErrorBoundary>
  ) : app

  root.render(<StrictMode>{content}</StrictMode>)
})
