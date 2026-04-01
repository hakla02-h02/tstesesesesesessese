"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { 
  Plus,
  Search,
  Users,
  Target,
  Play,
  Pause,
  MoreVertical,
  X,
  Send,
  UserX,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  RefreshCw
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "draft"
  audience: "started_not_continued" | "not_paid" | "paid"
  created_at: string
  sent_count: number
  open_rate: number
}

const AUDIENCES = [
  {
    id: "started_not_continued",
    name: "Iniciou mas nao continuou",
    description: "Usuarios que deram /start mas nao avancaram no fluxo",
    icon: UserX,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30"
  },
  {
    id: "not_paid",
    name: "Nao pagou",
    description: "Usuarios que chegaram ate o pagamento mas nao finalizaram",
    icon: ShoppingCart,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30"
  },
  {
    id: "paid",
    name: "Pagou",
    description: "Usuarios que ja realizaram pelo menos uma compra",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30"
  }
]

// Mock data
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Recuperacao de Carrinho",
    status: "active",
    audience: "not_paid",
    created_at: "2026-03-25",
    sent_count: 1240,
    open_rate: 45
  },
  {
    id: "2", 
    name: "Oferta Especial VIP",
    status: "paused",
    audience: "paid",
    created_at: "2026-03-20",
    sent_count: 890,
    open_rate: 62
  },
  {
    id: "3",
    name: "Lembrete de Inicio",
    status: "draft",
    audience: "started_not_continued",
    created_at: "2026-03-28",
    sent_count: 0,
    open_rate: 0
  }
]

export default function RemarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  
  // Create campaign states
  const [newCampaignName, setNewCampaignName] = useState("")
  const [newCampaignAudience, setNewCampaignAudience] = useState<string | null>(null)
  const [createStep, setCreateStep] = useState(1)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCampaigns(MOCK_CAMPAIGNS)
      setLoading(false)
    }, 500)
  }, [])

  const getAudienceInfo = (audienceId: string) => {
    return AUDIENCES.find(a => a.id === audienceId)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Ativa", color: "text-emerald-400", bgColor: "bg-emerald-500/10" }
      case "paused":
        return { label: "Pausada", color: "text-yellow-400", bgColor: "bg-yellow-500/10" }
      case "draft":
        return { label: "Rascunho", color: "text-gray-400", bgColor: "bg-gray-500/10" }
      default:
        return { label: status, color: "text-gray-400", bgColor: "bg-gray-500/10" }
    }
  }

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    totalSent: campaigns.reduce((acc, c) => acc + c.sent_count, 0),
  }

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim() || !newCampaignAudience) return
    
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      status: "draft",
      audience: newCampaignAudience as Campaign["audience"],
      created_at: new Date().toISOString().split("T")[0],
      sent_count: 0,
      open_rate: 0
    }
    
    setCampaigns([newCampaign, ...campaigns])
    setShowCreateModal(false)
    setNewCampaignName("")
    setNewCampaignAudience(null)
    setCreateStep(1)
  }

  const resetCreateModal = () => {
    setShowCreateModal(false)
    setNewCampaignName("")
    setNewCampaignAudience(null)
    setCreateStep(1)
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f5f5f7] min-h-[calc(100vh-60px)]">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Remarketing</h1>
                <p className="text-gray-500">Crie campanhas para reconquistar seus leads</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#bfff00] text-black text-sm font-bold hover:bg-[#a8e600] transition-colors shadow-lg shadow-[#bfff00]/20"
              >
                <Plus className="h-4 w-4" />
                Nova Campanha
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Total Campanhas */}
              <div className="relative rounded-[20px] p-5 overflow-hidden bg-[#1c1c1e]">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center bottom, rgba(190, 255, 0, 0.15) 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Campanhas</span>
                    <div className="w-9 h-9 rounded-xl bg-[#bfff00]/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-[#bfff00]" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.total}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">campanhas criadas</p>
                </div>
              </div>

              {/* Ativas */}
              <div className="relative rounded-[20px] p-5 overflow-hidden bg-[#1c1c1e]">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center bottom, rgba(34, 197, 94, 0.15) 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Ativas</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Play className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-400">{stats.active}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">em execucao</p>
                </div>
              </div>

              {/* Total Enviados */}
              <div className="relative rounded-[20px] p-5 overflow-hidden bg-[#1c1c1e]">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.15) 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Mensagens</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Send className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.totalSent.toLocaleString("pt-BR")}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">enviadas no total</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar campanha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all"
                />
              </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_150px_120px_100px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Campanha</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Publico</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enviados</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Acoes</span>
              </div>

              {/* Body */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Target className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Nenhuma campanha encontrada</p>
                  <p className="text-xs text-gray-500 mt-1">Crie sua primeira campanha de remarketing</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#bfff00] text-black text-sm font-bold hover:bg-[#a8e600] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Campanha
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCampaigns.map((campaign) => {
                    const audience = getAudienceInfo(campaign.audience)
                    const status = getStatusInfo(campaign.status)
                    const AudienceIcon = audience?.icon || Users
                    
                    return (
                      <div
                        key={campaign.id}
                        className="grid grid-cols-[1fr_150px_120px_100px_80px] gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Campanha */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#1c1c1e] flex items-center justify-center shrink-0">
                            <Target className="h-5 w-5 text-[#bfff00]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{campaign.name}</p>
                            <p className="text-xs text-gray-500">Criada em {new Date(campaign.created_at).toLocaleDateString("pt-BR")}</p>
                          </div>
                        </div>

                        {/* Publico */}
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${audience?.bgColor} flex items-center justify-center`}>
                            <AudienceIcon className={`h-3.5 w-3.5 ${audience?.color}`} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate">{audience?.name}</span>
                        </div>

                        {/* Enviados */}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{campaign.sent_count.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-gray-500">{campaign.open_rate}% abriram</p>
                        </div>

                        {/* Status */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.color}`}>
                          {campaign.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {status.label}
                        </span>

                        {/* Acoes */}
                        <div className="flex items-center justify-end gap-1">
                          {campaign.status === "active" ? (
                            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                              <Pause className="h-4 w-4" />
                            </button>
                          ) : (
                            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-colors">
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedCampaign(campaign)}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetCreateModal()}>
        <DialogContent className="sm:max-w-[480px] bg-[#1c1c1e] border-[#2a2a2e] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
          <div className="p-6">
            {/* Close */}
            <button
              onClick={resetCreateModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step 1: Nome */}
            {createStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Nova Campanha</h3>
                  <p className="text-sm text-gray-500">De um nome para sua campanha de remarketing</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nome da Campanha</label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Ex: Recuperacao de Carrinho"
                    className="w-full h-12 px-4 bg-[#2a2a2e] border border-[#3a3a3e] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#bfff00]/50 transition-colors"
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => newCampaignName.trim() && setCreateStep(2)}
                  disabled={!newCampaignName.trim()}
                  className="w-full h-12 rounded-xl bg-[#bfff00] text-black font-bold hover:bg-[#a8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2: Publico */}
            {createStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Selecione o Publico</h3>
                  <p className="text-sm text-gray-500">Escolha quem vai receber sua campanha</p>
                </div>

                <div className="space-y-3">
                  {AUDIENCES.map((audience) => {
                    const Icon = audience.icon
                    const isSelected = newCampaignAudience === audience.id
                    
                    return (
                      <button
                        key={audience.id}
                        onClick={() => setNewCampaignAudience(audience.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? `${audience.bgColor} ${audience.borderColor} border-2`
                            : "bg-[#2a2a2e] border-[#3a3a3e] hover:border-[#4a4a4e]"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl ${audience.bgColor} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-6 w-6 ${audience.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold ${isSelected ? audience.color : "text-white"}`}>{audience.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{audience.description}</p>
                        </div>
                        {isSelected && (
                          <div className={`w-6 h-6 rounded-full ${audience.bgColor} flex items-center justify-center`}>
                            <CheckCircle2 className={`h-4 w-4 ${audience.color}`} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCreateStep(1)}
                    className="flex-1 h-12 rounded-xl bg-[#2a2a2e] text-white font-medium hover:bg-[#3a3a3e] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={!newCampaignAudience}
                    className="flex-1 h-12 rounded-xl bg-[#bfff00] text-black font-bold hover:bg-[#a8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Criar Campanha
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Actions Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-[320px] bg-[#1c1c1e] border-[#2a2a2e] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
          {selectedCampaign && (
            <div className="p-4">
              {/* Close */}
              <button
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="mb-4 pr-8">
                <h3 className="font-bold text-white truncate">{selectedCampaign.name}</h3>
                <p className="text-xs text-gray-500">Acoes da campanha</p>
              </div>

              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2e] transition-colors text-left">
                  <Edit3 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-white">Editar campanha</span>
                </button>
                
                {selectedCampaign.status === "active" ? (
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2e] transition-colors text-left">
                    <Pause className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-white">Pausar campanha</span>
                  </button>
                ) : (
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2e] transition-colors text-left">
                    <Play className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white">Ativar campanha</span>
                  </button>
                )}
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2e] transition-colors text-left">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-white">Ver publico</span>
                </button>
                
                <div className="h-px bg-[#2a2a2e] my-2" />
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left">
                  <Trash2 className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">Excluir campanha</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
