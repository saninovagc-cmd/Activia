export const COMPLETE_SUPABASE_SQL = `-- ==============================================================================
-- PLATEFORME ACTIVIA — SCHÉMA COMPLET & JEU DE DONNÉES OFFICIEL (SUPABASE)
-- Direction des Licences, de la Vigilance et de la Surveillance du Marché (DLVS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES SOCLE & ACTIVITÉS

-- 2.1 Table des Profils Utilisateurs (14 Collaborateurs Officiels DLVS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_num INTEGER NOT NULL DEFAULT 1,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent',
    role_label TEXT,
    department TEXT NOT NULL,
    title TEXT,
    post TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Table des Activités
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'moyenne',
    status TEXT NOT NULL DEFAULT 'a_faire',
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    manager_name TEXT,
    department TEXT NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    associated_folder TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Table des Tâches
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignee_name TEXT,
    priority TEXT NOT NULL DEFAULT 'moyenne',
    status TEXT NOT NULL DEFAULT 'a_faire',
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Table des Commentaires d'Activités
CREATE TABLE IF NOT EXISTS public.activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_role TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Table des Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 Table du Journal d'Audit
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    details TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLES DE GESTION ADMINISTRATIVE (PHASE 2)

-- 3.1 Courriers Entrants
CREATE TABLE IF NOT EXISTS public.incoming_mails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_number TEXT NOT NULL UNIQUE,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_type TEXT,
    subject TEXT NOT NULL,
    mail_type TEXT NOT NULL DEFAULT 'Officiel',
    department TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    manager_name TEXT,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'reception',
    priority TEXT NOT NULL DEFAULT 'moyenne',
    scanned_doc_name TEXT,
    scanned_doc_url TEXT,
    observations TEXT,
    linked_folder_id TEXT,
    linked_folder_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Courriers Sortants
CREATE TABLE IF NOT EXISTS public.outgoing_mails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mail_number TEXT NOT NULL UNIQUE,
    send_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    mail_type TEXT NOT NULL DEFAULT 'Officiel',
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    manager_name TEXT,
    status TEXT NOT NULL DEFAULT 'brouillon',
    document_name TEXT,
    document_url TEXT,
    linked_incoming_id UUID REFERENCES public.incoming_mails(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Dossiers Réglementaires & Demandes
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_number TEXT NOT NULL UNIQUE,
    folder_type TEXT NOT NULL,
    applicant TEXT NOT NULL,
    structure TEXT NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    manager_name TEXT,
    priority TEXT NOT NULL DEFAULT 'moyenne',
    status TEXT NOT NULL DEFAULT 'depot',
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    due_date DATE NOT NULL,
    decision TEXT DEFAULT 'En attente',
    decision_date DATE,
    decision_notes TEXT,
    observations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Registre Centralisé GED (Documents)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    size_kb INTEGER NOT NULL DEFAULT 0,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_ref TEXT NOT NULL,
    uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_name TEXT,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLES MÉTIERS & VIGILANCE (PHASE 3)

-- 4.1 Établissements Pharmaceutiques
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    establishment_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    responsible_pharmacist TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'Actif',
    authorization_number TEXT NOT NULL,
    auth_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Signalements Sanitaires / MAPI & Vigilances
CREATE TABLE IF NOT EXISTS public.signals_vigilance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_number TEXT NOT NULL UNIQUE,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reporter_name TEXT NOT NULL,
    reporter_type TEXT NOT NULL,
    product_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    manufacturer TEXT,
    signal_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Modérée',
    description TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    manager_name TEXT,
    workflow_step TEXT NOT NULL DEFAULT 'signalement',
    status TEXT NOT NULL DEFAULT 'en_cours',
    sample_taken BOOLEAN NOT NULL DEFAULT false,
    sample_code TEXT,
    lab_name TEXT,
    lab_result TEXT,
    imputability_score TEXT,
    conclusion TEXT,
    corrective_actions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Formations des Points Focaux
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_code TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    function_title TEXT NOT NULL,
    structure TEXT NOT NULL,
    region TEXT NOT NULL,
    department TEXT NOT NULL,
    theme TEXT NOT NULL,
    training_date DATE NOT NULL,
    trainer_name TEXT NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 8,
    result TEXT NOT NULL DEFAULT 'Validé',
    certificate_issued BOOLEAN NOT NULL DEFAULT true,
    certificate_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Alertes Sanitaires
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_number TEXT NOT NULL UNIQUE,
    alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source TEXT NOT NULL,
    product_name TEXT NOT NULL,
    nature TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'Moyen',
    description TEXT NOT NULL,
    actions_required TEXT NOT NULL,
    manager_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    closing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_mails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_mails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals_vigilance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'profiles', 'activities', 'tasks', 'activity_comments', 
        'notifications', 'audit_logs', 'incoming_mails', 'outgoing_mails', 
        'folders', 'documents', 'establishments', 'signals_vigilance', 
        'trainings', 'alerts'
    ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow public read access" ON public.%I FOR SELECT USING (true)', tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow public insert access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow public insert access" ON public.%I FOR INSERT WITH CHECK (true)', tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow public update access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow public update access" ON public.%I FOR UPDATE USING (true)', tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow public delete access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow public delete access" ON public.%I FOR DELETE USING (true)', tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- 6. JEU DE DONNÉES INITIAL : LES 14 COLLABORATEURS OFFICIELS DLVS
-- ==============================================================================

INSERT INTO public.profiles (id, order_num, email, full_name, role, role_label, department, title, post, phone, is_active)
VALUES
('a0000000-0000-0000-0000-000000000001', 1, 'jocelyne.satchivi@activia.sante.gouv', 'Dr. SATCHIVI Jocelyne KANLE', 'admin', 'Directrice (DLVS) / Administrateur', 'Direction (DLVS)', 'Pharmacien', 'Directrice des Licences, de la Vigilance et de la Surveillance du Marché (DLVS)', '+229 21 30 01 01', true),
('a0000000-0000-0000-0000-000000000002', 2, 'perrin.houngue@activia.sante.gouv', 'Dr. HOUNGUE Perrin', 'chef_service', 'Chef de Service (SVPS)', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Pharmacien', 'Chef Service des Vigilances et des Produits de Santé (SVPS)', '+229 21 30 01 02', true),
('a0000000-0000-0000-0000-000000000003', 3, 'huibert.alofa@activia.sante.gouv', 'Dr. ALOFA Huibert', 'chef_service', 'Chef de Service (SSMUR)', 'Service de la Surveillance du Marché (SSMUR)', 'Pharmacien', 'Chef Service de la Surveillance du Marché et usages rationnels des Médicaments (SSMUR)', '+229 21 30 01 03', true),
('a0000000-0000-0000-0000-000000000004', 4, 'daniel.kintin@activia.sante.gouv', 'Dr. KINTIN Daniel', 'chef_service', 'Chef de Service (SL)', 'Service des Licences (SL)', 'Pharmacien', 'Chef Service des Licences (SL)', '+229 21 30 01 04', true),
('a0000000-0000-0000-0000-000000000005', 5, 'radihath.arouna@activia.sante.gouv', 'Dr. AROUNA Radihath', 'agent', 'Agent / Évaluatrice PSUR', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Pharmacien', 'Responsable de l’Évaluation des PSUR/PBRER / SVPS', '+229 21 30 01 05', true),
('a0000000-0000-0000-0000-000000000006', 6, 'sarath.fikara@activia.sante.gouv', 'Dr. FIKARA Sarath', 'agent', 'Agent / Comité Vigilances', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Pharmacien', 'Responsable de l’organisation du Comité Technique de Vigilances des Produits de Santé / SVPS', '+229 21 30 01 06', true),
('a0000000-0000-0000-0000-000000000007', 7, 'hermion.tonouewa@activia.sante.gouv', 'M. TONOUEWA Hermion', 'agent', 'Agent / Épidémiologiste', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Epidémiologiste', 'Responsable de la Gestion des Données / SVPS', '+229 21 30 01 07', true),
('a0000000-0000-0000-0000-000000000008', 8, 'ella.lokoun@activia.sante.gouv', 'Dr. LOKOUN Ella', 'agent', 'Agent / Promotion & Publicité', 'Service de la Surveillance du Marché (SSMUR)', 'Pharmacien', 'Responsable de la promotion et de la publicité des Médicaments / SSMUR', '+229 21 30 01 08', true),
('a0000000-0000-0000-0000-000000000009', 9, 'joel.tonoukouin@activia.sante.gouv', 'Dr. TONOUKOUIN Joel', 'agent', 'Agent / Déchets & Post-comm.', 'Service de la Surveillance du Marché (SSMUR)', 'Pharmacien', 'Responsable des Activités liées à la surveillance post commercialisation et de la gestion des déchets pharmaceutiques / SSMUR', '+229 21 30 01 09', true),
('a0000000-0000-0000-0000-000000000010', 10, 'mael.dossouyovo@activia.sante.gouv', 'Dr. DOSSOU YOVO H. O. Mael', 'agent', 'Agent / Autorisations d’Achat', 'Service de la Surveillance du Marché (SSMUR)', 'Médecin Vétérinaire', 'Personne responsable des autorisations / SSMUR', '+229 21 30 01 10', true),
('a0000000-0000-0000-0000-000000000011', 11, 'irenee.ganhou@activia.sante.gouv', 'Dr. GANHOU Irenée', 'agent', 'Agent / Qualité & Falsifiés', 'Service de la Surveillance du Marché (SSMUR)', 'Pharmacien', 'Responsable des Produits de Santé de Qualité Inférieur ou Falsifiés / SSMUR', '+229 21 30 01 11', true),
('a0000000-0000-0000-0000-000000000012', 12, 'maria-carole.yambode@activia.sante.gouv', 'Dr. YAMBODE Maria-Carole', 'agent', 'Agent / Commissions Licences', 'Service des Licences (SL)', 'Pharmacien', 'Responsable des commissions de Licence / SL', '+229 21 30 01 12', true),
('a0000000-0000-0000-0000-000000000013', 13, 'jeanpaul.vigan@activia.sante.gouv', 'Dr. VIGAN Jean Paul', 'agent', 'Agent / Réceptions Licences', 'Service des Licences (SL)', 'Pharmacien', 'Responsable des réceptions / SL', '+229 21 30 01 13', true),
('a0000000-0000-0000-0000-000000000014', 14, 'larissa.adognon@activia.sante.gouv', 'Mme ADOGNON Larissa', 'secretariat', 'Secrétaire de Direction / Bureau du Courrier', 'Direction (DLVS)', 'Attaché des Services Administratifs', 'Secrétaire / DLVS (Bureau d’Ordre & Courriers)', '+229 21 30 01 14', true)
ON CONFLICT (id) DO UPDATE SET
    order_num = EXCLUDED.order_num,
    full_name = EXCLUDED.full_name,
    title = EXCLUDED.title,
    post = EXCLUDED.post,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = NOW();

-- ==============================================================================
-- 7. BASE DE DONNÉES EN PRODUCTION (DÉMARRAGE À BLANC SANS DONNÉES FICTIVES)
-- ==============================================================================
-- Seuls les 14 collaborateurs officiels de la DLVS sont initialisés ci-dessus.
-- Les tables métier (activities, tasks, incoming_mails, outgoing_mails, folders,
-- documents, establishments, signals_vigilance, trainings, alerts, audit_logs)
-- démarrent à blanc pour accueillir les véritables données opérationnelles.

-- Requête de purge complète si vous aviez préalablement inséré des données de test :
-- TRUNCATE TABLE public.activities, public.tasks, public.activity_comments,
--   public.incoming_mails, public.outgoing_mails, public.folders, public.documents,
--   public.establishments, public.signals_vigilance, public.trainings, public.alerts,
--   public.notifications, public.audit_logs CASCADE;
`;
