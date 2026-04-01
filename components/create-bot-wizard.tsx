"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bot as BotIcon,
  KeyRound,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateBotWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBot: (data: {
    name: string
    token: string
    group_name?: string
    group_id?: string
    group_link?: string
  }) => Promise<void>
  isNewUser?: boolean
}

type Step = "name" | "token" | "group_choice" | "group_config"

export function CreateBotWizard({
  open,
  onOpenChange,
  onCreateBot,
  isNewUser = false,
}: CreateBotWizardProps) {
  const [step, setStep] = useState<Step>("name")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form data
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [groupName, setGroupName] = useState("")
  const [groupId, setGroupId] = useState("")
  const [groupLink, setGroupLink] = useState("")

  const resetForm = () => {
    setStep("name")
    setName("")
    setToken("")
    setGroupName("")
    setGroupId("")
    setGroupLink("")
    setError("")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (!isNewUser) {
      onOpenChange(false)
      resetForm()
    }
  }

  const handleNext = () => {
    setError("")
    if (step === "name") {
      if (!name.trim()) {
        setError("Digite um nome para o bot")
        return
      }
      setStep("token")
    } else if (step === "token") {
      if (!token.trim()) {
        setError("Digite o token do bot")
        return
      }
      setStep("group_choice")
    }
  }

  const handleBack = () => {
    setError("")
    if (step === "token") setStep("name")
    else if (step === "group_choice") setStep("token")
    else if (step === "group_config") setStep("group_choice")
  }

  const handleCreate = async (skipGroup: boolean) => {
    setError("")
    setIsSubmitting(true)
    try {
      await onCreateBot({
        name: name.trim(),
        token: token.trim(),
        group_name: skipGroup ? undefined : groupName.trim() || undefined,
        group_id: skipGroup ? undefined : groupId.trim() || undefined,
        group_link: skipGroup ? undefined : groupLink.trim() || undefined,
      })
      onOpenChange(false)
      resetForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar bot")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepNumber = () => {
    if (step === "name") return 1
    if (step === "token") return 2
    return 3
  }

  return (
    <Dialog open={open} onOpenChange={isNewUser ? undefined : onOpenChange}>
      <DialogContent
        className="bg-card border-border sm:max-w-lg p-0 gap-0 overflow-hidden"
        onInteractOutside={isNewUser ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isNewUser ? (e) => e.preventDefault() : undefined}
      >
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  num <= getStepNumber()
                    ? "bg-accent w-8"
                    : "bg-secondary w-4"
                )}
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Passo {getStepNumber()} de 3
          </p>
        </div>

        {/* Step: Name */}
        {step === "name" && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <BotIcon className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {isNewUser ? "Vamos criar seu primeiro bot!" : "Criar Novo Bot"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Qual o nome do seu bot?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome do Bot</Label>
              <Input
                placeholder="Ex: Bot de Vendas, VIP Premium..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                className="bg-secondary border-border h-12 text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Escolha um nome para identificar seu bot
              </p>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              onClick={handleNext}
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base gap-2"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step: Token */}
        {step === "token" && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <KeyRound className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Token do Telegram</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cole o token do seu bot
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Token do Bot</Label>
              <Input
                placeholder="123456:ABC-DEF..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                className="bg-secondary border-border h-12 font-mono text-sm"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Pegue o token com o @BotFather no Telegram
              </p>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 border-border hover:bg-secondary gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 gap-2"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Group Choice */}
        {step === "group_choice" && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Configurar Grupo</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deseja configurar o grupo do Telegram agora?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("group_config")}
                className="h-14 border-border hover:bg-secondary justify-start px-4 gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Configurar agora</p>
                  <p className="text-xs text-muted-foreground">Adicionar informacoes do grupo</p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleCreate(true)}
                disabled={isSubmitting}
                className="h-14 border-border hover:bg-secondary justify-start px-4 gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Configurar depois</p>
                  <p className="text-xs text-muted-foreground">Nas configuracoes do bot</p>
                </div>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        )}

        {/* Step: Group Config */}
        {step === "group_config" && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Informacoes do Grupo</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Preencha os dados do grupo (opcional)
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nome do Grupo</Label>
                <Input
                  placeholder="VIP Premium"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">ID do Grupo</Label>
                <Input
                  placeholder="-1001234567890 ou @meugrupo"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="bg-secondary border-border font-mono text-xs"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Link do Grupo</Label>
                <Input
                  placeholder="https://t.me/+abc123"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 border-border hover:bg-secondary gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={() => handleCreate(false)}
                disabled={isSubmitting}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Criar Bot
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
