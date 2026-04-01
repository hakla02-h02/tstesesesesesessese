"use client"

import Link from "next/link"
import {
  ShieldCheck,
  ArrowLeft,
} from "lucide-react"

export default function AdmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/15">
            <ShieldCheck className="h-4 w-4 text-destructive" />
          </div>
          <span className="text-sm font-semibold text-foreground">Painel ADM</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </Link>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
