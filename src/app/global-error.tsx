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
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '1rem',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              maxWidth: '28rem',
              padding: '2.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              borderRadius: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '1rem',
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
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s',
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
