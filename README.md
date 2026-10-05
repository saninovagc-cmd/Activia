# ACTIVIA — Plateforme Institutionnelle de Gestion des Activités, Dossiers et Courriers

> **Direction des Licences, de la Vigilance et de la Surveillance du Marché (DLVS)**  
> Plateforme web moderne, centralisée, sécurisée et collaborative destinée au pilotage administratif, technique et réglementaire des services de santé publique.

---

## 📋 Présentation Générale

ACTIVIA est une solution web intégrée remplaçant la dispersion des fichiers Excel par une base de données centralisée et relationnelle. Elle offre un pilotage rigoureux en temps réel des activités, des courriers, des dossiers d'agrément, des inspections, des signalements de vigilance et des formations.

### 🏛️ Modules & Fonctionnalités Clés

1. **Tableau de Bord & Pilotage Stratégique (`/dashboard`)** :
   * KPI en temps réel (Courriers en retard, dossiers en cours, alertes actives).
   * Graphiques interactifs de répartition, délais moyens et volumétries.
   * Actions du jour et échéances critiques sous 7 jours.

2. **Gestion des Activités & Tâches (`/activities`, `/tasks`)** :
   * Vue tableau, Kanban interactif et calendrier d'équipe.
   * Suivi d'avancement (%), dépendances, commentaires et pièces jointes.

3. **Bureau d'Ordre & Courriers (`/mail`)** :
   * **Courriers Entrants** : Réception, numérotation automatique, affectation aux agents, délais de traitement.
   * **Courriers Sortants** : Rédaction, association automatique en réponse à un courrier entrant, validation et suivi d'envoi.

4. **Dossiers Réglementaires & Demandes (`/folders`)** :
   * Cycles de vie complets (Dépôt → Instruction → Évaluation technique → Décision/Agrément → Clôture).
   * Gestion des autorisations d'achat, publicité, essais cliniques, PGR et PSUR.

5. **Référentiel des Établissements Pharmaceutiques (`/establishments`)** :
   * Fiches détaillées : Officines, grossistes-répartiteurs, laboratoires, fabricants.
   * Suivi des licences d'exploitation, pharmaciens responsables et inspections.

6. **Vigilance & Signalements Sanitaires (`/signals`)** :
   * Signalements MAPI (Manifestations Post-Vaccinales Indésirables), matériovigilance, pharmacovigilance.
   * Workflow d'investigation, échantillonnage laboratoire, imputabilité et actions correctives.
   * Alertes sanitaires urgentes et retraits de lots.

7. **Formations des Points Focaux (`/trainings`)** :
   * Registre des sessions, participants, attestations et évaluations.

8. **Gestion Électronique des Documents (`/documents`)** :
   * Archivage structuré avec recherche, filtres et métadonnées.

9. **Centre de Reporting & Exports (`/reporting`)** :
   * Production de rapports périodiques, exports Excel / PDF / CSV.

10. **Gestion des Utilisateurs & Base de Données (`/settings`)** :
    * Les 14 membres officiels de la DLVS (Dr. SATCHIVI Jocelyne KANLE en Responsable N°1).
    * Synchronisation en direct avec PostgreSQL hébergé sur Supabase.

---

## 🛠️ Stack Technique

* **Framework Web** : [Next.js](https://nextjs.org/) 14 (App Router)
* **Langage** : [TypeScript](https://www.typescriptlang.org/)
* **Styles & UI** : [Tailwind CSS](https://tailwindcss.com/), Lucide Icons, composants shadcn/ui
* **Typographie** : Aptos & Aptos Display (design institutionnel épuré)
* **Base de Données & Backend** : [Supabase](https://supabase.com/) PostgreSQL avec Row Level Security (RLS)
* **Gestion d'état** : React Context avec persistance locale et passerelle Supabase

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt
```bash
git clone https://github.com/saninovagc-cmd/Activia.git
cd Activia
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement Supabase
Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=https://bkwspibjypklsrbvyfrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Tdk6wZWQ6S5HrDVeho3boQ_vmtwP6LZ
```

### 4. Amorcer la base de données PostgreSQL
Exécutez le script SQL contenu dans [`supabase/complete_schema_and_seed.sql`](supabase/complete_schema_and_seed.sql) directement dans l'[Éditeur SQL Supabase](https://supabase.com/dashboard/project/bkwspibjypklsrbvyfrn/sql/new) pour générer les 14 tables et le personnel officiel.

### 5. Lancer l'application en mode développement
```bash
npm run dev -- -p 8500
```
Ou compiler et lancer en mode production :
```bash
npm run build
npm run start -- -p 8500
```

Accédez à l'application sur [http://localhost:8500](http://localhost:8500).

---

## 🔒 Sécurité & Traçabilité
* Rôles utilisateurs : Administrateur, Chef de service, Agent technique, Secrétariat, Consultation.
* Journal d'audit exhaustif (`/audit`) historisant chaque création, modification et clôture.
* Politiques de sécurité PostgreSQL Row-Level Security (RLS).

---

## 📄 Licence
Plateforme développée pour la Direction des Licences, de la Vigilance et de la Surveillance du Marché (DLVS). Tous droits réservés.
