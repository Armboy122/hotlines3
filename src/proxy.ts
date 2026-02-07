import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const maintenanceHTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HotlineS3 - ปิดปรับปรุงระบบ</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdf4 100%);
      overflow: hidden;
      position: relative;
    }

    /* Floating orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.4;
      animation: float 8s ease-in-out infinite;
    }
    .orb-1 {
      width: 300px; height: 300px;
      background: rgba(16, 185, 129, 0.2);
      top: -50px; right: -50px;
      animation-delay: 0s;
    }
    .orb-2 {
      width: 250px; height: 250px;
      background: rgba(251, 191, 36, 0.15);
      bottom: -30px; left: -30px;
      animation-delay: 2s;
    }
    .orb-3 {
      width: 200px; height: 200px;
      background: rgba(16, 185, 129, 0.1);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-30px); }
    }

    .container {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 2rem 1.5rem;
      max-width: 480px;
      width: 100%;
    }

    .card {
      backdrop-filter: blur(16px);
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      box-shadow:
        0 20px 60px rgba(16, 185, 129, 0.1),
        0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .icon-container {
      width: 80px; height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse-icon 3s ease-in-out infinite;
    }

    @keyframes pulse-icon {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .icon-container svg {
      width: 40px; height: 40px;
      color: #059669;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.75rem;
    }

    .subtitle {
      font-size: 1rem;
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #92400e;
    }

    .status-dot {
      width: 8px; height: 8px;
      background: #f59e0b;
      border-radius: 50%;
      animation: blink 1.5s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .divider {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #10b981, #fbbf24);
      border-radius: 9999px;
      margin: 1.5rem auto;
    }

    .footer-text {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .logo-text {
      font-weight: 700;
      color: #059669;
    }

    @media (max-width: 480px) {
      .card { padding: 2rem 1.5rem; }
      h1 { font-size: 1.25rem; }
      .subtitle { font-size: 0.9rem; }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <div class="container">
    <div class="card">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
        </svg>
      </div>

      <h1>ปิดปรับปรุงระบบชั่วคราว</h1>

      <p class="subtitle">
        ขณะนี้ระบบกำลังปรับปรุงเพื่อเพิ่มประสิทธิภาพ<br/>
        กรุณากลับมาใหม่ในภายหลัง
      </p>

      <div class="status-badge">
        <span class="status-dot"></span>
        กำลังดำเนินการ
      </div>

      <div class="divider"></div>

      <p class="footer-text">
        <span class="logo-text">HotlineS3</span> &mdash; ระบบจัดการงานบำรุงรักษา
      </p>
    </div>
  </div>
</body>
</html>`

export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Allow access to static files and Next.js internals
    const { pathname } = request.nextUrl
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.ico')
    ) {
      return NextResponse.next()
    }

    return new NextResponse(maintenanceHTML, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '3600',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
