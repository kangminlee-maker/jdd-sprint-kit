import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

async function boot() {
  let DevPanelComponent: React.ComponentType = () => null

  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
    const mod = await import('./components/DevPanel')
    DevPanelComponent = mod.default
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
        {import.meta.env.DEV && <DevPanelComponent />}
      </BrowserRouter>
    </StrictMode>,
  )
}

boot()
