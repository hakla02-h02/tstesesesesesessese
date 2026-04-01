import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://izvulojnfvgsbmhyvqtn.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyMarkup?: object,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" }
  if (replyMarkup) body.reply_markup = replyMarkup
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: number,
  photoUrl: string,
  caption: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function sendTelegramVideo(
  botToken: string,
  chatId: number,
  videoUrl: string,
  caption: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    video: videoUrl,
    caption,
    parse_mode: "HTML",
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateDelayMs(value: number, unit: "minutes" | "hours" | "days"): number {
  switch (unit) {
    case "minutes": return value * 60 * 1000
    case "hours": return value * 60 * 60 * 1000
    case "days": return value * 24 * 60 * 60 * 1000
    default: return value * 60 * 1000
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendUpsellOffer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  botToken: string,
  chatId: number,
  botId: string,
  flowId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsell: any,
  upsellIndex: number
) {
  console.log(`[UPSELL] Sending upsell ${upsellIndex} to user ${chatId}`)

  // Enviar midias se existirem
  if (upsell.medias && upsell.medias.length > 0) {
    for (const mediaUrl of upsell.medias) {
      if (mediaUrl.includes(".mp4") || mediaUrl.includes("video")) {
        await sendTelegramVideo(botToken, chatId, mediaUrl, "")
      } else {
        await sendTelegramPhoto(botToken, chatId, mediaUrl, "")
      }
      await sleep(500)
    }
  }

  // Montar botoes
  const inlineKeyboard: { inline_keyboard: { text: string; callback_data: string }[][] } = {
    inline_keyboard: [
      [{ text: upsell.acceptButtonText || "Quero essa oferta!", callback_data: `up_accept_${upsell.price}_${upsellIndex}` }]
    ]
  }

  // Adicionar botao de recusar se nao estiver escondido
  if (!upsell.hideRejectButton) {
    inlineKeyboard.inline_keyboard.push([
      { text: upsell.rejectButtonText || "Nao tenho interesse", callback_data: `up_decline_${upsellIndex}` }
    ])
  }

  // Enviar mensagem
  const message = upsell.message || `Oferta especial: ${upsell.name || "Produto exclusivo"}\n\nValor: R$ ${(upsell.price || 0).toFixed(2).replace(".", ",")}`
  await sendTelegramMessage(botToken, chatId, message, inlineKeyboard)

  // Atualizar estado
  await supabase
    .from("user_flow_state")
    .upsert({
      bot_id: botId,
      telegram_user_id: String(chatId),
      flow_id: flowId,
      status: "waiting_upsell",
      metadata: {
        upsell_index: upsellIndex,
        upsell_name: upsell.name,
        upsell_price: upsell.price,
      },
      updated_at: new Date().toISOString()
    }, { onConflict: "bot_id,telegram_user_id" })

  console.log(`[UPSELL] Upsell ${upsellIndex} sent successfully`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendDelivery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  botToken: string,
  chatId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flowConfig: Record<string, any> | null
) {
  console.log(`[DELIVERY] Sending delivery to user ${chatId}`)

  if (!flowConfig?.delivery) {
    await sendTelegramMessage(botToken, chatId, "Obrigado pela compra! Seu acesso foi liberado.")
    return
  }

  const delivery = flowConfig.delivery

  // Enviar midias de entrega
  if (delivery.medias && delivery.medias.length > 0) {
    for (const mediaUrl of delivery.medias) {
      if (mediaUrl.includes(".mp4") || mediaUrl.includes("video")) {
        await sendTelegramVideo(botToken, chatId, mediaUrl, "")
      } else {
        await sendTelegramPhoto(botToken, chatId, mediaUrl, "")
      }
      await sleep(500)
    }
  }

  // Enviar link de acesso
  if (delivery.link) {
    const buttonText = delivery.linkText || "Acessar conteudo"
    const keyboard = {
      inline_keyboard: [
        [{ text: buttonText, url: delivery.link }]
      ]
    }
    await sendTelegramMessage(botToken, chatId, "Seu acesso foi liberado! Clique no botao abaixo:", keyboard)
  } else {
    await sendTelegramMessage(botToken, chatId, "Obrigado pela compra! Seu acesso foi liberado.")
  }

  console.log(`[DELIVERY] Delivery sent successfully`)
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("Mercado Pago webhook received:", JSON.stringify(body))

    // O Mercado Pago envia diferentes tipos de notificacao
    if (body.type === "payment" || body.action === "payment.updated") {
      const paymentId = body.data?.id || body.id

      if (!paymentId) {
        return NextResponse.json({ received: true })
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      // Busca o pagamento no banco pelo external_payment_id
      const { data: payment, error } = await supabase
        .from("payments")
        .select("*")
        .eq("external_payment_id", String(paymentId))
        .single()

      if (error || !payment) {
        console.log("Payment not found for webhook:", paymentId)
        return NextResponse.json({ received: true })
      }

      // Busca o gateway para pegar o access_token
      const { data: gateway } = await supabase
        .from("user_gateways")
        .select("access_token")
        .eq("bot_id", payment.bot_id)
        .eq("is_active", true)
        .single()
      
      const accessToken = gateway?.access_token
      if (accessToken) {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (mpResponse.ok) {
          const mpData = await mpResponse.json()
          const newStatus = mpData.status

          // Atualiza o status no banco
          await supabase
            .from("payments")
            .update({
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id)

          console.log(`Payment ${paymentId} updated to status: ${newStatus}`)

          // ========== PAGAMENTO APROVADO - DISPARAR UPSELL ==========
          if (newStatus === "approved") {
            console.log(`Payment ${paymentId} approved! User: ${payment.telegram_user_id}, Product Type: ${payment.product_type}`)

            // Buscar bot e dados do usuario
            const { data: bot } = await supabase
              .from("bots")
              .select("id, token, user_id")
              .eq("id", payment.bot_id)
              .single()

            if (bot?.token && payment.telegram_user_id) {
              const chatId = parseInt(payment.telegram_user_id)
              
              // CANCELAR todos os downsells pendentes (usuario ja pagou)
              await supabase
                .from("scheduled_messages")
                .update({ status: "cancelled" })
                .eq("bot_id", payment.bot_id)
                .eq("telegram_user_id", payment.telegram_user_id)
                .eq("message_type", "downsell")
                .eq("status", "pending")
              
              console.log(`[DOWNSELL] Cancelled pending downsells for user ${payment.telegram_user_id}`)

              // Enviar mensagem de confirmacao
              await sendTelegramMessage(
                bot.token,
                chatId,
                `<b>Pagamento Aprovado!</b>\n\nSeu pagamento de R$ ${payment.amount.toFixed(2).replace(".", ",")} foi confirmado.\nObrigado pela sua compra!`
              )

              // Se for pagamento do produto principal ou order bump, verificar se tem upsell
              if (payment.product_type === "main_product" || payment.product_type === "order_bump") {
                // Buscar fluxo vinculado ao bot
                let flowId: string | null = null
                
                // Primeiro tenta pelo bot_id direto
                const { data: directFlow } = await supabase
                  .from("flows")
                  .select("id, config")
                  .eq("bot_id", bot.id)
                  .limit(1)
                  .single()
                
                if (directFlow) {
                  flowId = directFlow.id
                } else {
                  // Busca via flow_bots
                  const { data: flowBotLink } = await supabase
                    .from("flow_bots")
                    .select("flow_id")
                    .eq("bot_id", bot.id)
                    .limit(1)
                    .single()
                  
                  if (flowBotLink) {
                    flowId = flowBotLink.flow_id
                  }
                }

                if (flowId) {
                  // Buscar config do fluxo
                  const { data: flowData } = await supabase
                    .from("flows")
                    .select("config")
                    .eq("id", flowId)
                    .single()

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const flowConfig = flowData?.config as Record<string, any> | null
                  const upsellConfig = flowConfig?.upsell
                  const upsellSequences = upsellConfig?.sequences || []

                  console.log(`[UPSELL] Flow ${flowId} has ${upsellSequences.length} upsell sequences, enabled: ${upsellConfig?.enabled}`)

                  if (upsellConfig?.enabled && upsellSequences.length > 0) {
                    // Pegar a primeira sequencia (indice 0)
                    const firstUpsell = upsellSequences[0]
                    
                    // Verificar timing
                    if (firstUpsell.sendTiming === "immediate") {
                      // Enviar imediatamente
                      await sendUpsellOffer(supabase, bot.token, chatId, bot.id, flowId, firstUpsell, 0)
                    } else {
                      // Agendar para enviar depois
                      const delayMs = calculateDelayMs(firstUpsell.sendDelayValue || 30, firstUpsell.sendDelayUnit || "minutes")
                      
                      // Salvar no estado para ser processado depois
                      await supabase
                        .from("user_flow_state")
                        .upsert({
                          bot_id: bot.id,
                          telegram_user_id: String(chatId),
                          flow_id: flowId,
                          status: "upsell_scheduled",
                          metadata: {
                            upsell_index: 0,
                            upsell_scheduled_at: new Date().toISOString(),
                            upsell_send_at: new Date(Date.now() + delayMs).toISOString(),
                          },
                          updated_at: new Date().toISOString()
                        }, { onConflict: "bot_id,telegram_user_id" })
                      
                      console.log(`[UPSELL] Scheduled upsell 0 for user ${chatId} in ${delayMs}ms`)
                      
                      // Por agora, envia com delay simples (em producao usar job queue)
                      if (delayMs <= 60000) { // Max 1 minuto de delay inline
                        await sleep(delayMs)
                        await sendUpsellOffer(supabase, bot.token, chatId, bot.id, flowId, firstUpsell, 0)
                      }
                    }
                  } else {
                    // Sem upsell - enviar entrega diretamente
                    console.log(`[UPSELL] No upsell configured, sending delivery directly`)
                    await sendDelivery(supabase, bot.token, chatId, flowConfig)
                  }
                }
              } else if (payment.product_type === "upsell") {
                // Pagamento de upsell aprovado - verificar se tem proximo upsell
                console.log(`[UPSELL] Upsell payment approved for user ${chatId}`)
                
                // Buscar estado para ver qual upsell foi pago
                const { data: state } = await supabase
                  .from("user_flow_state")
                  .select("flow_id, metadata")
                  .eq("bot_id", bot.id)
                  .eq("telegram_user_id", String(chatId))
                  .single()

                if (state) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const metadata = state.metadata as Record<string, any> | null
                  const currentIndex = metadata?.upsell_index || 0
                  const nextIndex = currentIndex + 1

                  // Buscar config do fluxo
                  const { data: flowData } = await supabase
                    .from("flows")
                    .select("config")
                    .eq("id", state.flow_id)
                    .single()

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const flowConfig = flowData?.config as Record<string, any> | null
                  const upsellSequences = flowConfig?.upsell?.sequences || []

                  if (nextIndex < upsellSequences.length) {
                    // Tem mais upsell - enviar proximo
                    const nextUpsell = upsellSequences[nextIndex]
                    
                    if (nextUpsell.sendTiming === "immediate") {
                      await sendUpsellOffer(supabase, bot.token, chatId, bot.id, state.flow_id, nextUpsell, nextIndex)
                    } else {
                      const delayMs = calculateDelayMs(nextUpsell.sendDelayValue || 30, nextUpsell.sendDelayUnit || "minutes")
                      if (delayMs <= 60000) {
                        await sleep(delayMs)
                        await sendUpsellOffer(supabase, bot.token, chatId, bot.id, state.flow_id, nextUpsell, nextIndex)
                      }
                    }
                  } else {
                    // Acabou os upsells - enviar entrega
                    console.log(`[UPSELL] All upsells processed, sending delivery`)
                    await sendDelivery(supabase, bot.token, chatId, flowConfig)
                  }
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error)
    return NextResponse.json({ received: true })
  }
}

// Mercado Pago tambem envia HEAD para verificar se o endpoint existe
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}
