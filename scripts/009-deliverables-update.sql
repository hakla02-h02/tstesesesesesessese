-- ============================================
-- MIGRATION: Atualizar Sistema de Entregáveis
-- Adicionar flow_id à tabela vip_groups
-- ============================================

-- 1. Adicionar flow_id à tabela vip_groups
ALTER TABLE vip_groups ADD COLUMN IF NOT EXISTS flow_id UUID REFERENCES flows(id) ON DELETE CASCADE;
ALTER TABLE vip_groups ADD COLUMN IF NOT EXISTS telegram_group_id TEXT;
ALTER TABLE vip_groups ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE vip_groups ADD COLUMN IF NOT EXISTS group_type TEXT DEFAULT 'supergroup';
ALTER TABLE vip_groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Criar índice para flow_id
CREATE INDEX IF NOT EXISTS idx_vip_groups_flow_id ON vip_groups(flow_id);

-- 3. Atualizar vip_invites para ter flow_id
ALTER TABLE vip_invites ADD COLUMN IF NOT EXISTS flow_id UUID REFERENCES flows(id) ON DELETE CASCADE;
ALTER TABLE vip_invites ADD COLUMN IF NOT EXISTS payment_id UUID;
ALTER TABLE vip_invites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 4. Tornar bot_id opcional (agora pode usar flow_id)
ALTER TABLE vip_groups ALTER COLUMN bot_id DROP NOT NULL;

-- 5. Remover constraint de unicidade do bot_id para permitir múltiplos grupos por bot
ALTER TABLE vip_groups DROP CONSTRAINT IF EXISTS vip_groups_bot_id_key;

-- 6. Adicionar constraint de unicidade para flow_id (cada fluxo tem no máximo 1 grupo VIP principal)
-- Comentado porque agora permitimos múltiplos entregáveis por fluxo no config JSON
-- ALTER TABLE vip_groups ADD CONSTRAINT vip_groups_flow_id_key UNIQUE (flow_id);
