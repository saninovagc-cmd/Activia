export type UserRole = 
  | 'admin' 
  | 'chef_service' 
  | 'agent' 
  | 'secretariat' 
  | 'consultation';

export type ActivityStatus = 
  | 'a_faire' 
  | 'en_cours' 
  | 'en_attente' 
  | 'termine' 
  | 'annule' 
  | 'en_retard';

export type PriorityLevel = 'basse' | 'moyenne' | 'haute' | 'urgente';

export type ActivityType = 
  | 'Réglementaire' 
  | 'Inspection' 
  | 'Vigilance & Alerte' 
  | 'Échantillonnage' 
  | 'Évaluation Dossier' 
  | 'Formation' 
  | 'Réunion Technique' 
  | 'Autre';

export interface UserProfile {
  id: string;
  order?: number;
  email: string;
  full_name: string;
  role: UserRole;
  role_label: string;
  department: string;
  title: string;
  post?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface Task {
  id: string;
  activity_id: string;
  activity_code?: string;
  activity_title?: string;
  title: string;
  description?: string;
  assignee_id: string;
  assignee_name?: string;
  priority: PriorityLevel;
  status: 'a_faire' | 'en_cours' | 'termine' | 'en_retard';
  due_date: string;
  completed_at?: string;
  created_at: string;
}

export interface ActivityDocument {
  id: string;
  name: string;
  file_type: string;
  size_kb: number;
  uploaded_at: string;
  uploaded_by_name: string;
  url?: string;
}

export interface ActivityComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

export interface Activity {
  id: string;
  code: string; // e.g. ACT-2026-0042
  title: string;
  description: string;
  activity_type: ActivityType;
  priority: PriorityLevel;
  status: ActivityStatus;
  progress_percentage: number;
  manager_id: string;
  manager_name: string;
  collaborators: { id: string; name: string }[];
  department: string;
  start_date: string;
  due_date: string;
  completed_at?: string;
  associated_folder?: string;
  documents: ActivityDocument[];
  tasks: Task[];
  comments: ActivityComment[];
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'status_change' | 'alert' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'ASSIGN';
  module: 'Activités' | 'Tâches' | 'Courriers' | 'Dossiers' | 'Utilisateurs' | 'Sécurité';
  entity_type: 'activity' | 'task' | 'user' | 'folder' | 'mail';
  entity_id: string;
  entity_name: string;
  details: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface DashboardStats {
  totalFolders: number;
  foldersInProgress: number;
  foldersTreated: number;
  foldersDelayed: number;
  incomingMail: number;
  outgoingMail: number;
  activitiesInProgress: number;
  activitiesDelayed: number;
  pendingRequests: number;
  openReports: number;
  activeAlerts: number;
}

// ==========================================
// PHASE 2 — GESTION ADMINISTRATIVE TYPES
// ==========================================

export type MailType = 
  | 'Officiel' 
  | 'Demande Usager' 
  | 'Notification Réglementaire' 
  | 'Rapport / PV' 
  | 'Circulaire Ministérielle' 
  | 'Contentieux'
  | 'Autre';

export type IncomingMailStatus = 
  | 'reception' 
  | 'enregistrement' 
  | 'affectation' 
  | 'traitement' 
  | 'validation' 
  | 'reponse' 
  | 'cloture';

export type OutgoingMailStatus = 
  | 'brouillon' 
  | 'en_validation' 
  | 'valide' 
  | 'envoye' 
  | 'archive';

export interface IncomingMail {
  id: string;
  register_number: string; // Ex: ARR-2026-0891
  receipt_date: string;
  reference: string; // Référence de l'expéditeur
  sender: string;
  sender_type?: string;
  subject: string;
  mail_type: MailType;
  department: string;
  manager_id?: string;
  manager_name?: string;
  due_date: string;
  status: IncomingMailStatus;
  priority: PriorityLevel;
  scanned_doc_name?: string;
  scanned_doc_url?: string;
  observations?: string;
  linked_folder_id?: string;
  linked_folder_number?: string;
  response_mail_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OutgoingMail {
  id: string;
  mail_number: string; // Ex: DEP-2026-0412
  send_date: string;
  reference: string;
  recipient: string;
  subject: string;
  mail_type: MailType;
  manager_id: string;
  manager_name: string;
  status: OutgoingMailStatus;
  document_name?: string;
  document_url?: string;
  linked_incoming_id?: string;
  created_at: string;
}

export type FolderType = 
  | 'Autorisation d’achat' 
  | 'Agrément Établissement' 
  | 'Publicité & Promotion' 
  | 'Enregistrement PGR' 
  | 'Revue PSUR / PBRER' 
  | 'Essai Clinique & EIG' 
  | 'Élimination Déchets' 
  | 'Autre Dossier Technique';

export type FolderStatus = 
  | 'depot' 
  | 'reception' 
  | 'verification' 
  | 'complet' 
  | 'traitement' 
  | 'validation' 
  | 'decision' 
  | 'notification' 
  | 'cloture'
  | 'rejete';

export interface Folder {
  id: string;
  folder_number: string; // Ex: DOS-2026-0034
  folder_type: FolderType;
  applicant: string; // Demandeur
  structure: string; // Entreprise / Établissement
  receipt_date: string;
  manager_id: string;
  manager_name: string;
  priority: PriorityLevel;
  status: FolderStatus;
  progress_percentage: number;
  due_date: string;
  decision?: 'Favorable' | 'Défavorable' | 'Avis avec réserves' | 'En attente';
  decision_date?: string;
  decision_notes?: string;
  observations?: string;
  documents: ActivityDocument[];
  comments: ActivityComment[];
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  file_type: 'PDF' | 'Word' | 'Excel' | 'Image' | 'Autre';
  size_kb: number;
  entity_type: 'courrier' | 'dossier' | 'activite';
  entity_id: string;
  entity_ref: string;
  uploaded_by_id: string;
  uploaded_by_name: string;
  uploaded_at: string;
  file_url: string;
}

// ==========================================
// PHASE 3 — MÉTIERS & VIGILANCES TYPES
// ==========================================

export type EstablishmentType = 
  | 'Officine' 
  | 'Grossiste-Répartiteur' 
  | 'Dépôt Pharmaceutique' 
  | 'Laboratoire Fabricant' 
  | 'Structure Hospitalière' 
  | 'Autre';

export type EstablishmentStatus = 'Actif' | 'En attente' | 'Suspendu' | 'Fermé';

export interface Establishment {
  id: string;
  code: string; // Ex: ETAB-2026-0012
  name: string;
  establishment_type: EstablishmentType;
  owner: string;
  responsible_pharmacist: string;
  address: string;
  city: string;
  department: string;
  phone: string;
  email: string;
  status: EstablishmentStatus;
  authorization_number: string;
  auth_date: string;
  expiry_date?: string;
  documents: ActivityDocument[];
  inspection_history?: { date: string; inspector: string; outcome: string }[];
  created_at: string;
  updated_at: string;
}

export type SignalType = 
  | 'Défaut qualité' 
  | 'Effet indésirable grave' 
  | 'MAPI' 
  | 'Produit falsifié / illicite' 
  | 'Erreur médicamenteuse' 
  | 'Rupture de stock';

export type SignalSeverity = 'Faible' | 'Modérée' | 'Grave' | 'Critique';

export type SignalStep = 
  | 'signalement' 
  | 'evaluation' 
  | 'investigation' 
  | 'echantillonnage' 
  | 'analyse' 
  | 'resultat' 
  | 'conclusion' 
  | 'action_corrective' 
  | 'cloture';

export interface SignalItem {
  id: string;
  signal_number: string; // Ex: SIG-2026-0084
  receipt_date: string;
  reporter_name: string;
  reporter_type: string; // Pharmacien, Médecin, Hôpital, Usager
  product_name: string;
  batch_number: string;
  manufacturer: string;
  signal_type: SignalType;
  severity: SignalSeverity;
  description: string;
  manager_id: string;
  manager_name: string;
  workflow_step: SignalStep;
  status: 'en_cours' | 'en_attente_labo' | 'analyse_recue' | 'action_engagee' | 'cloture';
  sample_taken: boolean;
  sample_code?: string;
  lab_name?: string;
  lab_result?: 'Conforme' | 'Non conforme' | 'En attente' | 'Suspect';
  imputability_score?: string; // OMS / Algorithme MAPI
  conclusion?: string;
  corrective_actions?: string;
  documents: ActivityDocument[];
  comments: ActivityComment[];
  created_at: string;
  updated_at: string;
}

export interface TrainingItem {
  id: string;
  training_code: string; // Ex: FORM-2026-015
  participant_name: string;
  function_title: string;
  structure: string;
  region: string;
  department: string;
  theme: string;
  training_date: string;
  trainer_name: string;
  duration_hours: number;
  result: 'Validé' | 'Ajourné' | 'En cours';
  certificate_issued: boolean;
  certificate_number?: string;
  documents: ActivityDocument[];
  created_at: string;
}

export interface VigilanceAlert {
  id: string;
  alert_number: string; // Ex: ALT-2026-004
  alert_date: string;
  source: string;
  product_name: string;
  nature: string;
  risk_level: 'Faible' | 'Moyen' | 'Élevé' | 'Urgent';
  description: string;
  actions_required: string;
  manager_name: string;
  status: 'active' | 'cloturee';
  closing_date?: string;
}


