-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: analyses
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT,
    status TEXT DEFAULT 'pending',
    ai_raw_json JSONB,
    is_unlocked BOOLEAN DEFAULT FALSE,
    has_upsell BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: media
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    image_data TEXT NOT NULL,
    image_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    ls_order_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    transaction_type TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (opcional pero recomendado)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso temporal (abiertas para el demo)
CREATE POLICY "Public analyses access" ON public.analyses FOR ALL USING (true);
CREATE POLICY "Public media access" ON public.media FOR ALL USING (true);
CREATE POLICY "Public transactions access" ON public.transactions FOR ALL USING (true);
