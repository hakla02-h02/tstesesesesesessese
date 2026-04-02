import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

interface Deliverable {
  id: string
  name: string
  type: "media" | "link" | "vip_group"
  vipGroupId?: string
  vipGroupName?: string
}

// POST /api/vip-groups/generate-invite
// Generate a one-time invite link for a VIP group
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body = await req.json()
    const { flow_id, deliverable_id, user_telegram_id, payment_id } = body

    if (!flow_id) {
      return NextResponse.json({ error: "flow_id is required" }, { status: 400 })
    }

    // Get the flow config to find the VIP group
    const { data: flow, error: flowError } = await supabase
      .from("flows")
      .select("config")
      .eq("id", flow_id)
      .single()

    if (flowError || !flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 })
    }

    // Find the VIP group deliverable
    let vipGroupId: string | undefined
    let vipGroupName: string | undefined

    const config = flow.config || {}
    const deliverables: Deliverable[] = config.deliverables || []
    
    // If deliverable_id is provided, use that specific deliverable
    if (deliverable_id) {
      const deliverable = deliverables.find(d => d.id === deliverable_id && d.type === "vip_group")
      if (deliverable) {
        vipGroupId = deliverable.vipGroupId
        vipGroupName = deliverable.vipGroupName
      }
    } else {
      // Otherwise, use the selected main deliverable or first VIP group
      const selectedId = config.selectedDeliverableId
      const selectedDeliverable = selectedId 
        ? deliverables.find(d => d.id === selectedId && d.type === "vip_group")
        : deliverables.find(d => d.type === "vip_group")
      
      if (selectedDeliverable) {
        vipGroupId = selectedDeliverable.vipGroupId
        vipGroupName = selectedDeliverable.vipGroupName
      }
    }

    // Fallback: check legacy vip_groups table
    if (!vipGroupId) {
      const { data: vipGroup } = await supabase
        .from("vip_groups")
        .select("*")
        .eq("flow_id", flow_id)
        .single()

      if (vipGroup) {
        vipGroupId = vipGroup.telegram_group_id || vipGroup.chat_id?.toString()
        vipGroupName = vipGroup.group_name || vipGroup.title
      }
    }

    if (!vipGroupId) {
      return NextResponse.json({ error: "VIP group not configured for this flow" }, { status: 404 })
    }

    // Get the bot token from flow_bots
    const { data: flowBot } = await supabase
      .from("flow_bots")
      .select("bot_id")
      .eq("flow_id", flow_id)
      .limit(1)
      .single()

    if (!flowBot) {
      return NextResponse.json({ error: "No bot linked to this flow" }, { status: 400 })
    }

    const { data: bot } = await supabase
      .from("bots")
      .select("token")
      .eq("id", flowBot.bot_id)
      .single()

    if (!bot?.token) {
      return NextResponse.json({ error: "Bot token not found" }, { status: 400 })
    }

    // Generate invite link using Telegram API
    // createChatInviteLink creates a unique invite link
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${bot.token}/createChatInviteLink`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: vipGroupId,
          name: `VIP-${Date.now()}`,
          member_limit: 1, // One-time use
          expire_date: Math.floor(Date.now() / 1000) + 86400, // Expires in 24 hours
        }),
      }
    )

    const telegramData = await telegramRes.json()

    if (!telegramData.ok) {
      console.error("[generate-invite] Telegram error:", telegramData)
      return NextResponse.json({ 
        error: telegramData.description || "Failed to generate invite link. Make sure the bot is admin with invite permissions." 
      }, { status: 400 })
    }

    const inviteLink = telegramData.result.invite_link

    // Save invite to database (optional tracking)
    try {
      await supabase.from("vip_invites").insert({
        flow_id,
        user_telegram_id: user_telegram_id || null,
        payment_id: payment_id || null,
        invite_link: inviteLink,
        expires_at: new Date(Date.now() + 86400000).toISOString(), // 24h
        status: "pending",
      })
    } catch (e) {
      // Ignore tracking errors
      console.error("[generate-invite] Failed to save invite:", e)
    }

    return NextResponse.json({
      success: true,
      invite_link: inviteLink,
      group_name: vipGroupName || "Grupo VIP",
      expires_in: "24 hours",
    })
  } catch (error: any) {
    console.error("[generate-invite] Error:", error)
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
  }
}
