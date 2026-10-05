-- ==============================================================================
-- PLATEFORME ACTIVIA — SCHEMA PHASE 2 (GESTION ADMINISTRATIVE)
-- Courriers Entrants / Sortants, Dossiers Réglementaires & GED
-- ==============================================================================

-- 1. Table des Courriers Entrants
CREATE TABLE IF NOT EXISTS public.incoming_mails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_number TEXT NOT NULL UNIQUE, -- ex: ARR-2026-0891
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_type TEXT,
    subject TEXT NOT NULL,
    mail_type TEXT NOT NULL DEFAULT 'Officiel',
    department TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'reception' CHECK (status IN ('reception', 'enregistrement', 'affectation', 'traitement', 'validation', 'reponse', 'cloture')),
    priority priority_level_type NOT NULL DEFAULT 'moyenne',
    scanned_doc_name TEXT,
    scanned_doc_url TEXT,
    observations TEXT,
    linked_folder_id UUID,
    linked_folder_number TEXT,
    response_mail_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incoming_status ON public.incoming_mails(status);
CREATE INDEX IF NOT EXISTS idx_incoming_manager ON public.incoming_mails(manager_id);
CREATE INDEX IF NOT EXISTS idx_incoming_due ON public.incoming_mails(due_date);

-- 2. Table des Courriers Sortants
CREATE TABLE IF NOT EXISTS public.outgoing_mails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mail_number TEXT NOT NULL UNIQUE, -- ex: DEP-2026-0412
    send_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    mail_type TEXT NOT NULL DEFAULT 'Officiel',
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'en_validation', 'valide', 'envoye', 'archive')),
    document_name TEXT,
    document_url TEXT,
    linked_incoming_id UUID REFERENCES public.incoming_mails(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outgoing_status ON public.outgoing_mails(status);

-- 3. Table des Dossiers et Demandes Réglementaires
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_number TEXT NOT NULL UNIQUE, -- ex: DOS-2026-0034
    folder_type TEXT NOT NULL,
    applicant TEXT NOT NULL,
    structure TEXT NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority priority_level_type NOT NULL DEFAULT 'moyenne',
    status TEXT NOT NULL DEFAULT 'depot' CHECK (status IN ('depot', 'reception', 'verification', 'complet', 'traitement', 'validation', 'decision', 'notification', 'cloture', 'rejete')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    due_date DATE NOT NULL,
    decision TEXT CHECK (decision IN ('Favorable', 'Défavorable', 'Avis avec réserves', 'En attente')),
    decision_date DATE,
    decision_notes TEXT,
    observations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folders_status ON public.folders(status);
CREATE INDEX IF NOT EXISTS idx_folders_type ON public.folders(folder_type);
CREATE INDEX IF NOT EXISTS idx_folders_manager ON public.folders(manager_id);
CREATE INDEX IF NOT EXISTS idx_folders_due ON public.folders(due_date);

-- 4. Table du Registre Centralisé des Documents (GED)
CREATE TABLE IF NOT EXISTS public.documents_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'Word', 'Excel', 'Image', 'Autre')),
    size_kb INTEGER NOT NULL DEFAULT 0,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('courrier', 'dossier', 'activite')),
    entity_id UUID NOT NULL,
    entity_ref TEXT NOT NULL,
    uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON public.documents_registry(entity_type, entity_id);

-- ==============================================================================
-- RLS POLICIES POUR LA PHASE 2
-- ==============================================================================

ALTER TABLE public.incoming_mails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_mails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_registry ENABLE ROW LEVEL SECURITY;

-- Courriers : Secrétariat a tous les droits d'enregistrement, tous peuvent lire
CREATE POLICY "Lecture des courriers entrants pour agents autorisés"
    ON public.incoming_mails FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enregistrement des courriers par Secrétariat et Admins"
    ON public.incoming_mails FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'secretariat', 'chef_service')
        )
    );

CREATE POLICY "Lecture et gestion des courriers sortants"
    ON public.outgoing_mails FOR ALL
    TO authenticated
    USING (true);

-- Dossiers : Consultation générale pour autorisés, écriture selon rôle
CREATE POLICY "Lecture des dossiers"
    ON public.folders FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Gestion des dossiers par Admin, Chef de service, Agent, Secrétariat"
    ON public.folders FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'chef_service', 'agent', 'secretariat')
        )
    );

-- Documents : Lecture générale, insertion pour tous les collaborateurs
CREATE POLICY "Gestion des documents GED"
    ON public.documents_registry FOR ALL
    TO authenticated
    USING (true);
