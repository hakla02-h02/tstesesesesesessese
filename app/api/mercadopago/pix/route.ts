import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, amount, description } = await request.json()

    if (!accessToken || !amount) {
      return NextResponse.json(
        { error: "accessToken e amount sao obrigatorios" },
        { status: 400 }
      )
    }

    // Criar pagamento PIX via Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description || "Pagamento PIX",
        payment_method_id: "pix",
        payer: {
          email: "luismarquesdevp@gmail.com",
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Mercado Pago error:", errorData)
      return NextResponse.json(
        { error: errorData.message || "Erro ao criar pagamento" },
        { status: response.status }
      )
    }

    const paymentData = await response.json()

    // Extrair dados do PIX
    const pixData = paymentData.point_of_interaction?.transaction_data

    if (!pixData) {
      return NextResponse.json(
        { error: "Dados do PIX nao encontrados" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      paymentId: paymentData.id,
      status: paymentData.status,
      qrCode: pixData.qr_code,
      qrCodeBase64: pixData.qr_code_base64,
      ticketUrl: pixData.ticket_url,
    })
  } catch (error) {
    console.error("Erro ao processar PIX:", error)
    return NextResponse.json(
      { error: "Erro interno ao processar pagamento" },
      { status: 500 }
    )
  }
}
