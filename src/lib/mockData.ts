import { 
  UserProfile, 
  Activity, 
  NotificationItem, 
  AuditLogItem, 
  DashboardStats,
  IncomingMail,
  OutgoingMail,
  Folder,
  DocumentItem,
  Establishment,
  SignalItem,
  TrainingItem,
  VigilanceAlert
} from '@/types';

// ==============================================================================
// PERSONNEL OFFICIEL DLVS (14 COLLABORATEURS — DR. SATCHIVI EN RESPONSABLE N°1)
// ==============================================================================
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-001',
    order: 1,
    email: 'jocelyne.satchivi@activia.sante.gouv',
    full_name: 'Dr. SATCHIVI Jocelyne KANLE',
    role: 'admin',
    role_label: 'Directrice (DLVS) / Administrateur',
    department: 'Direction (DLVS)',
    title: 'Pharmacien',
    post: 'Directrice des Licences, de la Vigilance et de la Surveillance du Marché (DLVS)',
    phone: '+229 21 30 01 01',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-002',
    order: 2,
    email: 'perrin.houngue@activia.sante.gouv',
    full_name: 'Dr. HOUNGUE Perrin',
    role: 'chef_service',
    role_label: 'Chef de Service (SVPS)',
    department: 'Service des Vigilances et des Produits de Santé (SVPS)',
    title: 'Pharmacien',
    post: 'Chef Service des Vigilances et des Produits de Santé (SVPS)',
    phone: '+229 21 30 01 02',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-003',
    order: 3,
    email: 'huibert.alofa@activia.sante.gouv',
    full_name: 'Dr. ALOFA Huibert',
    role: 'chef_service',
    role_label: 'Chef de Service (SSMUR)',
    department: 'Service de la Surveillance du Marché (SSMUR)',
    title: 'Pharmacien',
    post: 'Chef Service de la Surveillance du Marché et usages rationnels des Médicaments (SSMUR)',
    phone: '+229 21 30 01 03',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-004',
    order: 4,
    email: 'daniel.kintin@activia.sante.gouv',
    full_name: 'Dr. KINTIN Daniel',
    role: 'chef_service',
    role_label: 'Chef de Service (SL)',
    department: 'Service des Licences (SL)',
    title: 'Pharmacien',
    post: 'Chef Service des Licences (SL)',
    phone: '+229 21 30 01 04',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-005',
    order: 5,
    email: 'radihath.arouna@activia.sante.gouv',
    full_name: 'Dr. AROUNA Radihath',
    role: 'agent',
    role_label: 'Agent / Évaluatrice PSUR',
    department: 'Service des Vigilances et des Produits de Santé (SVPS)',
    title: 'Pharmacien',
    post: "Responsable de l'Évaluation des PSUR/PBRER / SVPS",
    phone: '+229 21 30 01 05',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-006',
    order: 6,
    email: 'sarath.fikara@activia.sante.gouv',
    full_name: 'Dr. FIKARA Sarath',
    role: 'agent',
    role_label: 'Agent / Comité Vigilances',
    department: 'Service des Vigilances et des Produits de Santé (SVPS)',
    title: 'Pharmacien',
    post: "Responsable de l'organisation du Comité Technique de Vigilances des Produits de Santé / SVPS",
    phone: '+229 21 30 01 06',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-007',
    order: 7,
    email: 'hermion.tonouewa@activia.sante.gouv',
    full_name: 'M. TONOUEWA Hermion',
    role: 'agent',
    role_label: 'Agent / Épidémiologiste',
    department: 'Service des Vigilances et des Produits de Santé (SVPS)',
    title: 'Epidémiologiste',
    post: 'Responsable de la Gestion des Données / SVPS',
    phone: '+229 21 30 01 07',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-008',
    order: 8,
    email: 'ella.lokoun@activia.sante.gouv',
    full_name: 'Dr. LOKOUN Ella',
    role: 'agent',
    role_label: 'Agent / Promotion & Publicité',
    department: 'Service de la Surveillance du Marché (SSMUR)',
    title: 'Pharmacien',
    post: 'Responsable de la promotion et de la publicité des Médicaments / SSMUR',
    phone: '+229 21 30 01 08',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-009',
    order: 9,
    email: 'joel.tonoukouin@activia.sante.gouv',
    full_name: 'Dr. TONOUKOUIN Joel',
    role: 'agent',
    role_label: 'Agent / Déchets & Post-comm.',
    department: 'Service de la Surveillance du Marché (SSMUR)',
    title: 'Pharmacien',
    post: 'Responsable des Activités liées à la surveillance post commercialisation et de la gestion des déchets pharmaceutiques / SSMUR',
    phone: '+229 21 30 01 09',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-010',
    order: 10,
    email: 'mael.dossouyovo@activia.sante.gouv',
    full_name: 'Dr. DOSSOU YOVO H. O. Mael',
    role: 'agent',
    role_label: 'Agent / Autorisations d’Achat',
    department: 'Service de la Surveillance du Marché (SSMUR)',
    title: 'Médecin Vétérinaire',
    post: 'Personne responsable des autorisations / SSMUR',
    phone: '+229 21 30 01 10',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-011',
    order: 11,
    email: 'irenee.ganhou@activia.sante.gouv',
    full_name: 'Dr. GANHOU Irenée',
    role: 'agent',
    role_label: 'Agent / Qualité & Falsifiés',
    department: 'Service de la Surveillance du Marché (SSMUR)',
    title: 'Pharmacien',
    post: 'Responsable des Produits de Santé de Qualité Inférieur ou Falsifiés / SSMUR',
    phone: '+229 21 30 01 11',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-012',
    order: 12,
    email: 'maria-carole.yambode@activia.sante.gouv',
    full_name: 'Dr. YAMBODE Maria-Carole',
    role: 'agent',
    role_label: 'Agent / Commissions Licences',
    department: 'Service des Licences (SL)',
    title: 'Pharmacien',
    post: 'Responsable des commissions de Licence / SL',
    phone: '+229 21 30 01 12',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-013',
    order: 13,
    email: 'jeanpaul.vigan@activia.sante.gouv',
    full_name: 'Dr. VIGAN Jean Paul',
    role: 'agent',
    role_label: 'Agent / Réceptions Licences',
    department: 'Service des Licences (SL)',
    title: 'Pharmacien',
    post: 'Responsable des réceptions / SL',
    phone: '+229 21 30 01 13',
    avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'usr-014',
    order: 14,
    email: 'larissa.adognon@activia.sante.gouv',
    full_name: 'Mme ADOGNON Larissa',
    role: 'secretariat',
    role_label: 'Secrétaire de Direction / Bureau du Courrier',
    department: 'Direction (DLVS)',
    title: 'Attaché des Services Administratifs',
    post: 'Secrétaire / DLVS (Bureau d’Ordre & Courriers)',
    phone: '+229 21 30 01 14',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

// ==============================================================================
// DONNÉES DE PRODUCTION PROPRES (DÉMARRAGE À BLANC SANS DONNÉES FICTIVES)
// ==============================================================================

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalFolders: 0,
  foldersInProgress: 0,
  foldersTreated: 0,
  foldersDelayed: 0,
  incomingMail: 0,
  outgoingMail: 0,
  activitiesInProgress: 0,
  activitiesDelayed: 0,
  pendingRequests: 0,
  openReports: 0,
  activeAlerts: 0
};

export const INITIAL_INCOMING_MAILS: IncomingMail[] = [];

export const INITIAL_OUTGOING_MAILS: OutgoingMail[] = [];

export const INITIAL_FOLDERS: Folder[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_ESTABLISHMENTS: Establishment[] = [];

export const INITIAL_SIGNALS: SignalItem[] = [];

export const INITIAL_ALERTS: VigilanceAlert[] = [];

export const INITIAL_TRAININGS: TrainingItem[] = [];
