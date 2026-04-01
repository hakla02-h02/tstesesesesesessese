"use client"

import { useState } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, ChevronRight, ChevronLeft } from "lucide-react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Caneca + Pulseira",
    subtitulo: "Grupo de Networking",
    pontos: "10K",
    pontosNum: 10000,
    nivel: "Explorador",
    descricao: "Primeiro degrau da jornada: a venda inaugural valida a proposta e abre reputacao inicial no mercado.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TMhkBoA48JSpENaJVFkZRyrrQ2Y5JZ.png",
  },
  { 
    id: 2,
    titulo: "Kit Premium",
    subtitulo: "Mentoria Exclusiva",
    pontos: "100K",
    pontosNum: 100000,
    nivel: "Avancado",
    descricao: "Com R$ 100.000 faturados, a operacao ganha ritmo previsivel e dados para refinar oferta.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Zjc1SF7AR4QiHPCSItIilGEKhwR6Uz.png",
  },
  { 
    id: 3,
    titulo: "Experiencia VIP",
    subtitulo: "Evento Presencial",
    pontos: "500K",
    pontosNum: 500000,
    nivel: "Expert",
    descricao: "R$ 500.000 em vendas consolidam autoridade e viabilizam expansao sustentavel.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lh6iqRrOeYyMAq0IC6x8spZMt6dENP.png",
  },
  { 
    id: 4,
    titulo: "Parceria Oficial",
    subtitulo: "1 Milhao Faturado",
    pontos: "1M",
    pontosNum: 1000000,
    nivel: "Ouro",
    descricao: "R$ 1 milhao faturado consolida marca reconhecida e parcerias estrategicas.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
  },
]

export default function RewardsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentPremio = premiacoes[activeIndex]
  
  // Dados do usuario (mock) - TODO: Buscar do banco de dados
  const faturamentoAtual = 0
  const isDesbloqueado = faturamentoAtual >= currentPremio.pontosNum
  const progressPercent = Math.min((faturamentoAtual / currentPremio.pontosNum) * 100, 100)

  return (
    <>
      
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6]">
          <div className="max-w-3xl mx-auto px-6 py-10">
            
            {/* Faturamento */}
            <div className="text-center mb-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">
                Faturamento Total
              </p>
              <p className="text-5xl font-black text-gray-900 tracking-tight">
                R$ {faturamentoAtual.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Barra de progresso */}
            <div className="mb-16">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#ccff00] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-600 font-semibold">R$ {faturamentoAtual.toLocaleString("pt-BR")}</span>
                <span className="text-xs text-gray-900 font-bold">R$ {currentPremio.pontosNum.toLocaleString("pt-BR")}</span>
              </div>
            </div>

            {/* Premiacao Central com Navegacao */}
            <div className="flex items-center justify-center gap-8 mb-16">
              {/* Seta Esquerda */}
              <button
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  activeIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#1a1a1a] text-[#ccff00] hover:bg-[#222] hover:scale-110'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Card da Premiacao */}
              <div className="flex flex-col items-center">
                {/* Imagem */}
                <div className="relative w-56 h-56 mb-6">
                  <img 
                    src={currentPremio.plaquinha} 
                    alt={currentPremio.titulo}
                    className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ${
                      !isDesbloqueado && 'opacity-40 grayscale'
                    }`}
                  />
                  {!isDesbloqueado && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <span className="text-gray-900 text-xs font-bold tracking-widest mb-2">
                  META {currentPremio.pontos}
                </span>

                {/* Titulo */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {currentPremio.titulo}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  {currentPremio.subtitulo}
                </p>

                {/* Descricao */}
                <p className="text-gray-500 text-sm text-center max-w-md leading-relaxed mb-8">
                  {currentPremio.descricao}
                </p>

                {/* Indicador de paginas */}
                <div className="flex items-center gap-2 mb-6">
                  {premiacoes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === activeIndex ? 'bg-[#ccff00] w-6' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Botao */}
                {isDesbloqueado ? (
                  <button className="px-10 py-3.5 bg-[#ccff00] text-black font-bold text-sm rounded-full hover:bg-[#d4ff4d] transition-all shadow-lg">
                    Resgatar Premio
                  </button>
                ) : (
                  <div className="px-10 py-3.5 bg-gray-200 text-gray-600 font-bold text-sm rounded-full">
                    Faltam R$ {(currentPremio.pontosNum - faturamentoAtual).toLocaleString("pt-BR")}
                  </div>
                )}
              </div>

              {/* Seta Direita */}
              <button
                onClick={() => setActiveIndex(Math.min(premiacoes.length - 1, activeIndex + 1))}
                disabled={activeIndex === premiacoes.length - 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  activeIndex === premiacoes.length - 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#1a1a1a] text-[#ccff00] hover:bg-[#222] hover:scale-110'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>



          </div>
        </div>
      </ScrollArea>
    </>
  )
}
