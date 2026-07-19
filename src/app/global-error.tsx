'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="th">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '1rem',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              maxWidth: '28rem',
              padding: '2.5rem',
              background: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.10)',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '1.5rem',
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.75rem',
              }}
            >
              เกิดข้อผิดพลาดร้ายแรง
            </h2>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}
            >
              ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 2rem',
                background: '#1d4ed8',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
