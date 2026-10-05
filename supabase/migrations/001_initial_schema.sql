-- ==============================================================================
-- PLATEFORME ACTIVIA — SCHEMA INITIAL POSTGRESQL / SUPABASE (PHASE 1 & SOCLE)
-- ==============================================================================

-- 1. Extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Types Énumérés
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'chef_service', 'agent', 'secretariat', 'consultation');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE activity_status_type AS ENUM ('a_faire', 'en_cours', 'en_attente', 'termine', 'annule', 'en_retard');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE priority_level_type AS ENUM ('basse', 'moyenne', 'haute', 'urgente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Table des Profils Utilisateurs (Liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role_type NOT NULL DEFAULT 'agent',
    role_label TEXT,
    department TEXT NOT NULL,
    title TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table des Activités
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- e.g. ACT-2026-0001
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL,
    priority priority_level_type NOT NULL DEFAULT 'moyenne',
    status activity_status_type NOT NULL DEFAULT 'a_faire',
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    associated_folder TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance pour les activités
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_manager ON public.activities(manager_id);
CREATE INDEX IF NOT EXISTS idx_activities_department ON public.activities(department);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON public.activities(due_date);

-- 5. Table des Collaborateurs par Activité
CREATE TABLE IF NOT EXISTS public.activity_collaborators (
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (activity_id, user_id)
);

-- 6. Table des Tâches
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority priority_level_type NOT NULL DEFAULT 'moyenne',
    status TEXT NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire', 'en_cours', 'termine', 'en_retard')),
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_activity ON public.tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);

-- 7. Table des Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_kb INTEGER NOT NULL DEFAULT 0,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Table des Commentaires
CREATE TABLE IF NOT EXISTS public.activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Table des Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- 10. Table du Journal d'Audit (Audit Log)
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques Profils
CREATE POLICY "Les utilisateurs authentifiés peuvent lire tous les profils"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Les administrateurs peuvent tout modifier sur les profils"
    ON public.profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques Activités
CREATE POLICY "Lecture des activités pour utilisateurs autorisés"
    ON public.activities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Création et modification des activités"
    ON public.activities FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'chef_service', 'agent')
        )
    );

-- Politiques Tâches
CREATE POLICY "Lecture des tâches"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Mise à jour des tâches pour assignés et chefs"
    ON public.tasks FOR ALL
    TO authenticated
    USING (
        assignee_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chef_service')
        )
    );

-- Politiques Notifications
CREATE POLICY "L'utilisateur ne voit que ses propres notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Politiques Audit Logs
CREATE POLICY "Admins et Chefs de service peuvent consulter les journaux d'audit"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chef_service')
        )
    );

-- ==============================================================================
-- FONCTIONS & TRIGGERS D'AUTOMATISATION
-- ==============================================================================

-- 1. Synchronisation automatique auth.users -> public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, department, title)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role_type, 'agent'),
        COALESCE(new.raw_user_meta_data->>'department', 'Direction'),
        COALESCE(new.raw_user_meta_data->>'title', 'Agent du Service')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger d'Audit automatique sur mise à jour des activités
CREATE OR REPLACE FUNCTION public.audit_activity_updates()
RETURNS trigger AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.audit_logs (user_id, user_name, user_role, action, module, entity_type, entity_id, entity_name, details, old_value, new_value)
        VALUES (
            auth.uid(),
            COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Système'),
            COALESCE((SELECT role_label FROM public.profiles WHERE id = auth.uid()), 'Système'),
            'STATUS_CHANGE',
            'Activités',
            'activity',
            NEW.code,
            NEW.title,
            'Changement du statut de l''activité',
            OLD.status::text,
            NEW.status::text
        );
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_activity_updates ON public.activities;
CREATE TRIGGER trg_audit_activity_updates
    BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.audit_activity_updates();
