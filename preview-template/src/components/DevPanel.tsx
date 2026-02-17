import { useState } from 'react'

export default function DevPanel() {
  const [open, setOpen] = useState(false)
  const [storeJson, setStoreJson] = useState<string | null>(null)

  const handleReset = async () => {
    await fetch('/api/v1/__reset', { method: 'POST' })
    window.location.reload()
  }

  const handleShowStore = async () => {
    try {
      const res = await fetch('/api/v1/__store')
      if (res.ok) {
        const data = await res.json()
        setStoreJson(JSON.stringify(data, null, 2))
      } else {
        setStoreJson('(__store endpoint not available)')
      }
    } catch {
      setStoreJson('(__store endpoint not available)')
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 12px', borderRadius: '20px', border: 'none',
            background: '#374151', color: '#F9FAFB', fontSize: '12px',
            cursor: 'pointer', opacity: 0.7,
          }}
        >
          Dev
        </button>
      ) : (
        <div style={{
          background: '#1F2937', color: '#F9FAFB', borderRadius: '12px',
          padding: '16px', minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Dev Tools</span>
            <button type="button" onClick={() => { setOpen(false); setStoreJson(null) }}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>x</button>
          </div>
          <button type="button" onClick={handleReset}
            style={{
              width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4B5563',
              background: '#374151', color: '#F9FAFB', cursor: 'pointer', fontSize: '13px', marginBottom: '8px',
            }}>
            Reset State
          </button>
          <button type="button" onClick={handleShowStore}
            style={{
              width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4B5563',
              background: '#374151', color: '#F9FAFB', cursor: 'pointer', fontSize: '13px',
            }}>
            Show Store
          </button>
          {storeJson && (
            <pre style={{
              marginTop: '8px', padding: '8px', background: '#111827', borderRadius: '6px',
              fontSize: '11px', maxHeight: '200px', overflow: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {storeJson}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
