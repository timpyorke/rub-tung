import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { generatePayload } from '@/lib/promptpay'

export const runtime = 'nodejs'

// GET /api/{number}?amont=200.00
// Also accepts `amount` (common spelling) for convenience.
export async function GET(
  req: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const search = req.nextUrl.searchParams

    // Accept both `amont` (as requested) and `amount` (typo-safe)
    const amountParam = search.get('amont') ?? search.get('amount')

    let amount: number | undefined
    if (amountParam !== null) {
      const parsed = Number.parseFloat(amountParam)
      if (Number.isNaN(parsed)) {
        return NextResponse.json(
          { error: 'Invalid amount. Must be a number.' },
          { status: 400 }
        )
      }
      amount = parsed
    }

    const target = params.number
    if (!target) {
      return NextResponse.json(
        { error: 'Missing target number in path.' },
        { status: 400 }
      )
    }

    // Build PromptPay payload per EMV spec
    const payload = generatePayload(target, { amount })

    // Create PNG QR image buffer
    const buffer = await QRCode.toBuffer(payload, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6,
    })

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    const message = err?.message ?? 'Failed to generate QR code'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

