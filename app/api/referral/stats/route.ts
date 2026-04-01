import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET: Return referral stats for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  try {
    const { count, error } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalReferrals = count || 0

    // Vendas e ganhos: so conta vendas reais feitas pelos indicados
    // Por enquanto, vendas vem de uma tabela futura (referral_sales)
    // Quando nao existe ainda, retorna 0
    let totalSales = 0
    let totalEarnings = 0

    try {
      const { count: salesCount } = await supabase
        .from("referral_sales")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", userId)

      if (salesCount && salesCount > 0) {
        totalSales = salesCount
        const earningsPerSale = 0.10
        totalEarnings = Number((totalSales * earningsPerSale).toFixed(2))
      }
    } catch {
      // tabela ainda nao existe, vendas = 0
    }

    return NextResponse.json({
      total_referrals: totalReferrals,
      total_sales: totalSales,
      total_earnings: totalEarnings,
    })
  } catch (err) {
    console.error("[v0] Stats GET error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
