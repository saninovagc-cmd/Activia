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
('a0000000-0000-0000-0000-000000000005', 5, 'radihath.arouna@activia.sante.gouv', 'Dr. AROUNA Radihath', 'agent', 'Agent / Évaluatrice PSUR', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Pharmacien', 'Responsable de l''Évaluation des PSUR/PBRER / SVPS', '+229 21 30 01 05', true),
('a0000000-0000-0000-0000-000000000006', 6, 'sarath.fikara@activia.sante.gouv', 'Dr. FIKARA Sarath', 'agent', 'Agent / Comité Vigilances', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Pharmacien', 'Responsable de l''organisation du Comité Technique de Vigilances des Produits de Santé / SVPS', '+229 21 30 01 06', true),
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

-- 7. ACTIVITÉS INITIALES
INSERT INTO public.activities (code, title, description, activity_type, priority, status, progress_percentage, manager_id, manager_name, department, start_date, due_date, associated_folder)
VALUES
('ACT-2026-0101', 'Campagne nationale d’échantillonnage et de contrôle qualité des antipaludiques et antibiotiques', 'Organisation des prélèvements aléatoires sur 42 officines et 6 grossistes répartiteurs pour analyse de conformité analytique au Laboratoire National.', 'Échantillonnage', 'haute', 'en_cours', 65, 'a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée', 'Service de la Surveillance du Marché (SSMUR)', '2026-09-15', '2026-10-25', 'DOS-2026-ECH-0012'),
('ACT-2026-0102', 'Évaluation approfondie du Plan de Gestion des Risques (PGR) - Antidiabétique Glucotend V3', 'Examen de l’efficacité des mesures additionnelles de minimisation des risques cardiovasculaires soumises par le titulaire d’AMM.', 'Évaluation Dossier', 'urgente', 'en_retard', 45, 'a0000000-0000-0000-0000-000000000005', 'Dr. AROUNA Radihath', 'Service des Vigilances et des Produits de Santé (SVPS)', '2026-08-20', '2026-09-28', 'PGR-2026-0089'),
('ACT-2026-0103', 'Investigation et comité d’imputabilité MAPI — Déclaration de cas graves Hôpital Central', 'Constitution du dossier technique, analyse clinique rétrospective et convocation de la commission d’experts pour cotation d’imputabilité OMS.', 'Vigilance & Alerte', 'urgente', 'en_cours', 80, 'a0000000-0000-0000-0000-000000000006', 'Dr. FIKARA Sarath', 'Service des Vigilances et des Produits de Santé (SVPS)', '2026-09-22', '2026-10-08', 'MAPI-2026-0044'),
('ACT-2026-0104', 'Inspection réglementaire préalable à ouverture : Établissement Grossiste PharmaDistribution', 'Vérification de la conformité aux Bonnes Pratiques de Distribution en Gros (BPDG) : chambres froides, système d’assurance qualité et qualification des personnels.', 'Inspection', 'moyenne', 'en_attente', 20, 'a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel', 'Service des Licences (SL)', '2026-09-28', '2026-10-20', 'ETAB-2026-014'),
('ACT-2026-0105', 'Session de formation continue des 35 points focaux régionaux de pharmacovigilance', 'Formation certifiante aux nouveaux outils de notification numérique et aux protocoles standardisés de prise en charge des alertes de matériovigilance.', 'Formation', 'moyenne', 'a_faire', 10, 'a0000000-0000-0000-0000-000000000002', 'Dr. HOUNGUE Perrin', 'Service des Vigilances et des Produits de Santé (SVPS)', '2026-10-12', '2026-10-30', NULL),
('ACT-2026-0106', 'Contrôle des demandes d’autorisation de publicité pour produits de santé grand public', 'Vérification de conformité déontologique et scientifique pour 14 spots radio/télévisés et affiches déposés au 3e trimestre 2026.', 'Évaluation Dossier', 'moyenne', 'en_cours', 50, 'a0000000-0000-0000-0000-000000000008', 'Dr. LOKOUN Ella', 'Service de la Surveillance du Marché (SSMUR)', '2026-09-10', '2026-10-15', 'PUB-2026-0033'),
('ACT-2026-0107', 'Supervision de la filière d’incinération et neutralisation des déchets pharmaceutiques périmés', 'Contrôle du bordereau de suivi des déchets dangereux (BSDD) de 3 tonnes de médicaments non utilisables collectés dans les hôpitaux régionaux.', 'Inspection', 'moyenne', 'termine', 100, 'a0000000-0000-0000-0000-000000000009', 'Dr. TONOUKOUIN Joel', 'Service de la Surveillance du Marché (SSMUR)', '2026-08-01', '2026-09-15', 'DECHET-2026-0008'),
('ACT-2026-0108', 'Audit de sécurité des rapports périodiques de sécurité PSUR/PBRER — Classe des Antihypertenseurs', 'Revue triennale des données de tolérance mondiale et réévaluation du ratio bénéfice/risque.', 'Réglementaire', 'haute', 'en_cours', 40, 'a0000000-0000-0000-0000-000000000005', 'Dr. AROUNA Radihath', 'Service des Vigilances et des Produits de Santé (SVPS)', '2026-09-18', '2026-10-31', 'PSUR-2026-0019')
ON CONFLICT (code) DO NOTHING;

-- 8. COURRIERS ENTRANTS & SORTANTS INITIAUX
INSERT INTO public.incoming_mails (register_number, receipt_date, reference, sender, sender_type, subject, mail_type, department, manager_id, manager_name, due_date, status, priority, scanned_doc_name)
VALUES
('ARR-2026-0891', '2026-10-02', 'MIN-SANTE/DGS/2026-1402', 'Ministère de la Santé — Direction Générale de la Santé', 'Institutionnel', 'Instruction ministérielle relative au renforcement des contrôles sur les solutés injectables', 'Circulaire Ministérielle', 'Service des Vigilances et des Produits de Santé (SVPS)', 'a0000000-0000-0000-0000-000000000002', 'Dr. HOUNGUE Perrin', '2026-10-10', 'affectation', 'urgente', 'Circulaire_DGS_1402_Solutes.pdf'),
('ARR-2026-0892', '2026-09-30', 'LAB-NOV/REG/2026-042', 'Laboratoires Novis Santé SA', 'Titulaire AMM', 'Dépôt du Plan de Gestion des Risques (PGR) actualisé - Spécialité Cardioprotect 50mg', 'Notification Réglementaire', 'Service des Vigilances et des Produits de Santé (SVPS)', 'a0000000-0000-0000-0000-000000000005', 'Dr. AROUNA Radihath', '2026-10-25', 'traitement', 'haute', 'Bordereau_PGR_Cardioprotect.pdf'),
('ARR-2026-0893', '2026-09-28', 'CHU-CENTRE/PHARM/2026-09', 'Pharmacie Centrale du CHU Universitaire', 'Hôpital Public', 'Demande d’autorisation d’achat d’urgence pour antibiotique de réserve (Colistine IV)', 'Demande Usager', 'Service de la Surveillance du Marché (SSMUR)', 'a0000000-0000-0000-0000-000000000010', 'Dr. DOSSOU YOVO H. O. Mael', '2026-10-05', 'validation', 'urgente', 'Demande_Achat_Urgence_CHU_Colistine.pdf'),
('ARR-2026-0894', '2026-09-25', 'AGENCE-PUB/COM/2026-78', 'Agence Publicitaire Mediatiks', 'Prestataire Commercial', 'Demande de visa de publicité grand public - Campagne TV Sirop Tussicalm', 'Demande Usager', 'Service de la Surveillance du Marché (SSMUR)', 'a0000000-0000-0000-0000-000000000008', 'Dr. LOKOUN Ella', '2026-10-15', 'traitement', 'moyenne', 'Script_Video_Tussicalm_30s.pdf'),
('ARR-2026-0895', '2026-09-22', 'PHARM-DISTRIB/DIR/2026-014', 'Société PharmaDistribution Métropole', 'Établissement Pharmaceutique', 'Dossier d’agrément d’ouverture d’un entrepôt frigorifique de distribution en gros', 'Demande Usager', 'Service des Licences (SL)', 'a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel', '2026-10-22', 'traitement', 'haute', 'Dossier_Technique_PharmaDistribution.pdf'),
('ARR-2026-0896', '2026-09-18', 'ORDRE-PHARM/REG/2026-11', 'Conseil National de l’Ordre des Pharmaciens', 'Ordre Professionnel', 'Signalement d’exercice illégal et vente non autorisée de produits de santé en ligne', 'Officiel', 'Service des Licences (SL)', 'a0000000-0000-0000-0000-000000000012', 'Dr. YAMBODE Maria-Carole', '2026-10-01', 'traitement', 'urgente', 'Signalement_Ordre_Sites_Web.pdf')
ON CONFLICT (register_number) DO NOTHING;

INSERT INTO public.outgoing_mails (mail_number, send_date, reference, recipient, subject, mail_type, manager_id, manager_name, status, document_name)
VALUES
('DEP-2026-0410', '2026-10-01', 'ACT-REG/2026/0410', 'Pharmacie Centrale du CHU Universitaire', 'Décision d’autorisation d’achat à titre dérogatoire pour Colistine IV 1MUI', 'Officiel', 'a0000000-0000-0000-0000-000000000010', 'Dr. DOSSOU YOVO H. O. Mael', 'envoye', 'Arrete_Autorisation_Achat_CHU_0410.pdf'),
('DEP-2026-0411', '2026-09-29', 'ACT-PUB/2026/0411', 'Agence Publicitaire Mediatiks', 'Notification de demande de modifications substantielles - Campagne Tussicalm', 'Officiel', 'a0000000-0000-0000-0000-000000000008', 'Dr. LOKOUN Ella', 'envoye', 'Lettre_Observation_Publicite_Tussicalm.pdf'),
('DEP-2026-0412', '2026-09-25', 'ACT-ETAB/2026/0412', 'Société PharmaDistribution Métropole', 'Convocation à inspection préalable sur site pour agrément grossiste', 'Officiel', 'a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel', 'envoye', 'Avis_Inspection_PharmaDistribution.pdf'),
('DEP-2026-0413', '2026-10-03', 'ACT-DIR/2026/0413', 'Ministère de la Santé — DGS', 'Rapport semestriel d’activité et état d’avancement des vigilances sanitaires', 'Rapport / PV', 'a0000000-0000-0000-0000-000000000001', 'Dr. SATCHIVI Jocelyne KANLE', 'valide', 'Rapport_Activite_S1_2026_Final.pdf')
ON CONFLICT (mail_number) DO NOTHING;

-- 9. DOSSIERS RÉGLEMENTAIRES INITIAUX
INSERT INTO public.folders (folder_number, folder_type, applicant, structure, receipt_date, manager_id, manager_name, priority, status, progress_percentage, due_date, decision)
VALUES
('DOS-2026-0089', 'Enregistrement PGR', 'Dr. Marc Vaudreuil', 'Laboratoires Novis Santé SA', '2026-08-20', 'a0000000-0000-0000-0000-000000000005', 'Dr. AROUNA Radihath', 'urgente', 'traitement', 60, '2026-09-28', 'En attente'),
('DOS-2026-0018', 'Autorisation d’achat', 'Pr. Michel Laroche (Pharmacien Chef)', 'Pharmacie Centrale du CHU Universitaire', '2026-09-28', 'a0000000-0000-0000-0000-000000000010', 'Dr. DOSSOU YOVO H. O. Mael', 'urgente', 'decision', 90, '2026-10-05', 'Favorable'),
('DOS-2026-0044', 'Revue PSUR / PBRER', 'Direction Affaires Réglementaires', 'Laboratoire Sandoz France', '2026-09-18', 'a0000000-0000-0000-0000-000000000005', 'Dr. AROUNA Radihath', 'haute', 'complet', 40, '2026-10-31', 'En attente'),
('DOS-2026-0014', 'Agrément Établissement', 'M. Gérard Benhamou (PDG)', 'Société PharmaDistribution Métropole', '2026-09-22', 'a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel', 'haute', 'traitement', 35, '2026-10-22', 'En attente'),
('DOS-2026-0033', 'Publicité & Promotion', 'Mme. Sophie Marchand (Directrice RP)', 'Agence Publicitaire Mediatiks / Laboratoire Tussi', '2026-09-25', 'a0000000-0000-0000-0000-000000000008', 'Dr. LOKOUN Ella', 'moyenne', 'validation', 75, '2026-10-15', 'Avis avec réserves'),
('DOS-2026-0008', 'Élimination Déchets', 'M. Patrick Gomez', 'Société EcoDestruction Médicale', '2026-08-01', 'a0000000-0000-0000-0000-000000000009', 'Dr. TONOUKOUIN Joel', 'moyenne', 'cloture', 100, '2026-09-15', 'Favorable')
ON CONFLICT (folder_number) DO NOTHING;

-- 10. ÉTABLISSEMENTS INITIAUX
INSERT INTO public.establishments (code, name, establishment_type, owner, responsible_pharmacist, address, city, department, phone, email, status, authorization_number, auth_date)
VALUES
('ETAB-2026-0001', 'Pharmacie Centrale du Boulevard', 'Officine', 'Dr. Jean-Pierre Valois', 'Dr. Jean-Pierre Valois', '142 Avenue de la République', 'Centre-Ville', 'Service des Licences (SL)', '+33 1 42 68 00 11', 'contact@pharmaciecentrale-valois.fr', 'Actif', 'AUT-OFF-2018-042', '2018-04-12'),
('ETAB-2026-0002', 'Société PharmaDistribution Métropole', 'Grossiste-Répartiteur', 'M. Gérard Benhamou (PDG)', 'Dre. Martine Ségur', 'Z.I. des Jonquilles, Bâtiment C4', 'Saint-Denis', 'Service des Licences (SL)', '+33 1 48 22 55 90', 'direction@pharmadistribution.com', 'En attente', 'AUT-GROSS-2026-0014', '2026-09-22'),
('ETAB-2026-0003', 'Laboratoires Novis Santé SA', 'Laboratoire Fabricant', 'Novis Health Group Europe', 'Dr. Marc Vaudreuil', 'Parc Technologique BioSanté, Allée des Pépinières', 'Lyon Est', 'Service des Vigilances et des Produits de Santé (SVPS)', '+33 4 72 00 99 88', 'regulatory@novis-sante.eu', 'Actif', 'AUT-FAB-2015-0089', '2015-06-20'),
('ETAB-2026-0004', 'Dépôt Pharmaceutique Régional Ouest', 'Dépôt Pharmaceutique', 'Coopérative Sanitaire Maritime', 'Dr. Philippe Le Braz', 'Hangar Fret Portuaire n°7', 'Brest', 'Service des Licences (SL)', '+33 2 98 44 11 22', 'depot.ouest@coopsante.fr', 'Actif', 'AUT-DEP-2021-0033', '2021-09-10'),
('ETAB-2026-0005', 'Pharmacie des Quatre Chemins', 'Officine', 'Mme. Sarah Cohen', 'Mme. Sarah Cohen', '12 Rue Victor Hugo', 'Pantin', 'Service des Licences (SL)', '+33 1 48 40 12 34', 'quatrechemins.pharma@orange.fr', 'Suspendu', 'AUT-OFF-2019-0112', '2019-03-15')
ON CONFLICT (code) DO NOTHING;

-- 11. SIGNALEMENTS INITIAUX
INSERT INTO public.signals_vigilance (signal_number, receipt_date, reporter_name, reporter_type, product_name, batch_number, manufacturer, signal_type, severity, description, manager_id, manager_name, workflow_step, status, sample_taken, lab_name, lab_result)
VALUES
('SIG-2026-0084', '2026-09-22', 'Dr. Antoine Meyer (Chef de Service Réanimation)', 'Hôpital Public', 'Vaccin Pédiatrique Hexavalent HexaProtect', 'LOT-HEX-4901B', 'BioVaccin International', 'MAPI', 'Critique', 'Manifestation post-vaccinale indésirable grave : 3 nourrissons ayant présenté une réaction fébrile avec convulsions 6h post-injection.', 'a0000000-0000-0000-0000-000000000006', 'Dr. FIKARA Sarath', 'investigation', 'en_cours', true, 'Laboratoire National de Contrôle des Médicaments (LNCM)', 'En attente'),
('SIG-2026-0085', '2026-09-26', 'Pharmacie Hospitalière Sud', 'Hôpital Public', 'Soluté Glucosé 5% Poches 500ml', 'LOT-GLU-8820', 'Laboratoires Baxter / Fresenius', 'Défaut qualité', 'Grave', 'Présence anormale de particules visibles en suspension et fuite sur la tubulure de perfusion.', 'a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée', 'echantillonnage', 'en_attente_labo', true, 'LNCM - Département Physico-Chimie', 'En attente'),
('SIG-2026-0086', '2026-09-15', 'Gendarmerie Nationale / Douanes', 'Autorités Publiques', 'Comprimés Antalgiques Tramadol 50mg Contrefaits', 'FAUX-TRM-991', 'Origine inconnue (Contrefaçon)', 'Produit falsifié / illicite', 'Critique', 'Saisie de 20 000 plaquettes thermoformées vendues illicitement hors réseau officiel.', 'a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée', 'action_corrective', 'action_engagee', true, 'Laboratoire Police Scientifique', 'Non conforme'),
('SIG-2026-0087', '2026-08-30', 'Dr. Sylvie Morin (Médecin Généraliste)', 'Médecin Libéral', 'Antibiotique Amoxicilline 500mg Gélules', 'LOT-AMX-2044', 'Biogaran', 'Effet indésirable grave', 'Modérée', 'Éruption cutanée généralisée avec œdème de Quincke résolutif après injection d’adrénaline.', 'a0000000-0000-0000-0000-000000000002', 'Dr. HOUNGUE Perrin', 'cloture', 'cloture', false, NULL, NULL)
ON CONFLICT (signal_number) DO NOTHING;

-- 12. ALERTES ET FORMATIONS INITIALES
INSERT INTO public.alerts (alert_number, alert_date, source, product_name, nature, risk_level, description, actions_required, manager_name, status)
VALUES
('ALT-2026-001', '2026-09-23', 'Centre National de Pharmacovigilance', 'Vaccin Pédiatrique HexaProtect (Lot 4901B)', 'MAPI - Suspension préventive d’utilisation', 'Urgent', 'Alerte de niveau 1 : mise en quarantaine immédiate de tous les flacons du lot en attente des résultats analytiques du LNCM.', 'Rappel auprès des centres vaccinateurs, officines et pédiatres.', 'Dr. HOUNGUE Perrin', 'active'),
('ALT-2026-002', '2026-09-16', 'Direction Générale des Douanes', 'Faux Tramadol 50mg', 'Produit contrefait toxique', 'Urgent', 'Circulation de faux comprimés sans principe actif. Risque létal en cas de consommation.', 'Information des services d’urgence et des officines.', 'Dr. GANHOU Irenée', 'active'),
('ALT-2026-003', '2026-09-02', 'OMS / Alerte Médicale Mondiale n°4/2026', 'Sirops contre la toux pédiatriques contaminés à l’éthylène glycol', 'Contamination chimique internationale', 'Élevé', 'Alerte internationale concernant la détection de sirops falsifiés en Afrique subsaharienne.', 'Renforcement du contrôle d’échantillonnage aux frontières maritimes et aéroportuaires.', 'Dr. SATCHIVI Jocelyne KANLE', 'active')
ON CONFLICT (alert_number) DO NOTHING;

INSERT INTO public.trainings (training_code, participant_name, function_title, structure, region, department, theme, training_date, trainer_name, duration_hours, result, certificate_issued, certificate_number)
VALUES
('FORM-2026-015', 'Dr. Karim Ouattara', 'Pharmacien Point Focal Régional', 'Hôpital Régional d’Abidjan Nord', 'Région Lagunes', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Notification électronique des MAPI et algorithme d’imputabilité OMS', '2026-09-12', 'Dr. HOUNGUE Perrin', 14, 'Validé', true, 'CERT-PV-2026-0042'),
('FORM-2026-015', 'Mme. Aminata Traoré', 'Pharmacienne Inspectrice Régionale', 'Direction Régionale de la Santé de Bouaké', 'Région Centre', 'Service des Licences (SL)', 'Contrôle des Bonnes Pratiques de Distribution en Gros (BPDG)', '2026-09-12', 'Dr. KINTIN Daniel', 14, 'Validé', true, 'CERT-PV-2026-0043'),
('FORM-2026-016', 'Dr. Pascal Dubois', 'Praticien Hospitalier Référent', 'Centre Hospitalier Départemental', 'Région Ouest', 'Service de la Surveillance du Marché (SSMUR)', 'Vigilance des Essais Cliniques et Notification des EIG/SUSAR', '2026-10-15', 'Dr. LOKOUN Ella', 8, 'En cours', false, NULL);
`;
