-- ==============================================================================
-- PLATEFORME ACTIVIA — SCHEMA PHASE 3 (MÉTIERS & VIGILANCES SANITAIRES)
-- Établissements Pharmaceutiques, Signalements/MAPI, Formations & Alertes
-- ==============================================================================

-- 1. Table des Établissements Pharmaceutiques
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- ex: ETAB-2026-0012
    name TEXT NOT NULL,
    establishment_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    responsible_pharmacist TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'Actif' CHECK (status IN ('Actif', 'En attente', 'Suspendu', 'Fermé')),
    authorization_number TEXT NOT NULL UNIQUE,
    auth_date DATE NOT NULL,
    expiry_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_establishments_status ON public.establishments(status);
CREATE INDEX IF NOT EXISTS idx_establishments_dept ON public.establishments(department);

-- 2. Table des Signalements Sanitaires & Vigilance (MAPI, Défauts qualité, Alertes)
CREATE TABLE IF NOT EXISTS public.signals_vigilance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_number TEXT NOT NULL UNIQUE, -- ex: SIG-2026-0084
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reporter_name TEXT NOT NULL,
    reporter_type TEXT NOT NULL,
    product_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    manufacturer TEXT,
    signal_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Modérée' CHECK (severity IN ('Faible', 'Modérée', 'Grave', 'Critique')),
    description TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    workflow_step TEXT NOT NULL DEFAULT 'signalement' CHECK (workflow_step IN ('signalement', 'evaluation', 'investigation', 'echantillonnage', 'analyse', 'resultat', 'conclusion', 'action_corrective', 'cloture')),
    status TEXT NOT NULL DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'en_attente_labo', 'analyse_recue', 'action_engagee', 'cloture')),
    sample_taken BOOLEAN NOT NULL DEFAULT false,
    sample_code TEXT,
    lab_name TEXT,
    lab_result TEXT CHECK (lab_result IN ('Conforme', 'Non conforme', 'En attente', 'Suspect')),
    imputability_score TEXT,
    conclusion TEXT,
    corrective_actions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_step ON public.signals_vigilance(workflow_step);
CREATE INDEX IF NOT EXISTS idx_signals_severity ON public.signals_vigilance(severity);
CREATE INDEX IF NOT EXISTS idx_signals_manager ON public.signals_vigilance(manager_id);

-- 3. Table des Formations des Points Focaux
CREATE TABLE IF NOT EXISTS public.trainings_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_code TEXT NOT NULL, -- ex: FORM-2026-015
    participant_name TEXT NOT NULL,
    function_title TEXT NOT NULL,
    structure TEXT NOT NULL,
    region TEXT NOT NULL,
    department TEXT NOT NULL,
    theme TEXT NOT NULL,
    training_date DATE NOT NULL,
    trainer_name TEXT NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 8,
    result TEXT NOT NULL DEFAULT 'Validé' CHECK (result IN ('Validé', 'Ajourné', 'En cours')),
    certificate_issued BOOLEAN NOT NULL DEFAULT true,
    certificate_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainings_region ON public.trainings_registry(region);
CREATE INDEX IF NOT EXISTS idx_trainings_theme ON public.trainings_registry(theme);

-- 4. Table des Alertes de Vigilance
CREATE TABLE IF NOT EXISTS public.vigilance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_number TEXT NOT NULL UNIQUE, -- ex: ALT-2026-004
    alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source TEXT NOT NULL,
    product_name TEXT NOT NULL,
    nature TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'Moyen' CHECK (risk_level IN ('Faible', 'Moyen', 'Élevé', 'Urgent')),
    description TEXT NOT NULL,
    actions_required TEXT NOT NULL,
    manager_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cloturee')),
    closing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES POUR LA PHASE 3
-- ==============================================================================

ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals_vigilance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vigilance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des établissements pour tous"
    ON public.establishments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Gestion des établissements par Admin et Chefs de service"
    ON public.establishments FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chef_service')
        )
    );

CREATE POLICY "Lecture et gestion des signalements"
    ON public.signals_vigilance FOR ALL TO authenticated USING (true);

CREATE POLICY "Lecture et gestion des formations"
    ON public.trainings_registry FOR ALL TO authenticated USING (true);

CREATE POLICY "Lecture et diffusion des alertes"
    ON public.vigilance_alerts FOR ALL TO authenticated USING (true);
