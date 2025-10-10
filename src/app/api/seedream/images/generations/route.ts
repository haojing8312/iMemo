import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // 兼容多种命名：优先服务端密钥，其次其他常见变量名
    const apiKey =
      process.env.SEEDREAM_API_KEY ||
      process.env.SEEDREAM_TOKEN ||
      process.env.BYTEPLUS_API_KEY ||
      process.env.VOLCENGINE_API_KEY ||
      process.env.NEXT_PUBLIC_SEEDREAM_API_KEY ||
      ''
    if (!apiKey) {
      return NextResponse.json({ error: 'SEEDREAM_API_KEY 未配置' }, { status: 500 })
    }

    const payload = await req.json()

    const upstreamBase =
      process.env.SEEDREAM_BASE_URL ||
      process.env.BYTEPLUS_BASE_URL ||
      process.env.VOLCENGINE_BASE_URL ||
      'https://ark.cn-beijing.volces.com'
    const upstream = `${upstreamBase.replace(/\/$/, '')}/api/v3/images/generations`
    const res = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    // Try to return JSON when possible
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json, { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || '代理请求失败' }, { status: 500 })
  }
}


