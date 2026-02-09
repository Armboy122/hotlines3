import { NextRequest, NextResponse } from 'next/server'

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // สร้าง URL ปลายทางที่ Go backend
    const path = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const targetUrl = `${GO_BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

    // เตรียม headers
    const headers: HeadersInit = {}

    // คัดลอก headers ที่สำคัญ
    const headersToForward = ['authorization', 'content-type', 'accept']
    headersToForward.forEach((headerName) => {
      const value = request.headers.get(headerName)
      if (value) {
        headers[headerName] = value
      }
    })

    // เตรียม body สำหรับ POST, PUT, PATCH
    let body: string | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const data = await request.json()
        body = JSON.stringify(data)
      } catch {
        // ไม่มี body หรือไม่ใช่ JSON
      }
    }

    // ส่ง request ไปยัง Go backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    // อ่าน response
    const data = await response.text()

    // ส่ง response กลับไปยัง client พร้อม status code เดิม
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ Backend'
        }
      },
      { status: 500 }
    )
  }
}
