'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Activity, 
  Task, 
  NotificationItem, 
  AuditLogItem, 
  DashboardStats,
  ActivityStatus,
  IncomingMail,
  OutgoingMail,
  IncomingMailStatus,
  OutgoingMailStatus,
  Folder,
  FolderStatus,
  FolderType,
  ActivityDocument,
  ActivityComment,
  DocumentItem,
  Establishment,
  SignalItem,
  SignalStep,
  TrainingItem,
  VigilanceAlert
} from '@/types';
import { 
  INITIAL_USERS, 
  INITIAL_ACTIVITIES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_DASHBOARD_STATS,
  INITIAL_INCOMING_MAILS,
  INITIAL_OUTGOING_MAILS,
  INITIAL_FOLDERS,
  INITIAL_DOCUMENTS,
  INITIAL_ESTABLISHMENTS,
  INITIAL_SIGNALS,
  INITIAL_ALERTS,
  INITIAL_TRAININGS
} from '@/lib/mockData';
import {
  loadAllDataFromDatabase,
  dbSaveActivity,
  dbUpdateActivity,
  dbDeleteActivity,
  dbSaveTask,
  dbUpdateTask,
  dbAddActivityComment,
  dbSaveIncomingMail,
  dbUpdateIncomingMail,
  dbSaveOutgoingMail,
  dbUpdateOutgoingMail,
  dbSaveFolder,
  dbUpdateFolder,
  dbSaveDocument,
  dbDeleteDocument,
  dbSaveEstablishment,
  dbUpdateEstablishment,
  dbSaveSignal,
  dbUpdateSignal,
  dbSaveTraining,
  dbUpdateTraining,
  dbSaveAlert,
  dbUpdateAlert,
  dbSaveAuditLog,
  ensureUuid,
  generateUuid,
  USER_ID_MAP
} from '@/lib/dbService';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  isDbConnected: boolean;
  isSyncing: boolean;
  refreshFromDatabase: () => Promise<void>;
  switchUser: (userId: string) => void;
  login: (identifier: string, pass: string) => { success: boolean; message?: string; user?: UserProfile };
  logout: () => void;
  updateUserPassword: (userId: string, newPass: string) => boolean;
  resetUserPassword: (userId: string) => string;
  // Activités & Tâches (Phase 1)
  activities: Activity[];
  tasks: Task[];
  addActivity: (activityData: Partial<Activity>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  updateActivityStatus: (id: string, status: ActivityStatus) => void;
  deleteActivity: (id: string) => void;
  addTask: (taskData: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: 'a_faire' | 'en_cours' | 'termine' | 'en_retard') => void;
  addCommentToActivity: (activityId: string, commentText: string) => void;
  // Courriers (Phase 2)
  incomingMails: IncomingMail[];
  outgoingMails: OutgoingMail[];
  addIncomingMail: (mailData: Partial<IncomingMail>) => IncomingMail;
  updateIncomingMailStatus: (id: string, status: IncomingMailStatus) => void;
  assignIncomingMail: (id: string, managerId: string) => void;
  addOutgoingMail: (mailData: Partial<OutgoingMail>) => OutgoingMail;
  updateOutgoingMailStatus: (id: string, status: OutgoingMailStatus) => void;
  // Dossiers & Demandes (Phase 2)
  folders: Folder[];
  addFolder: (folderData: Partial<Folder>) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  updateFolderStatus: (id: string, status: FolderStatus) => void;
  advanceFolderStep: (id: string) => void;
  // GED Documents (Phase 2)
  documents: DocumentItem[];
  addDocument: (docData: Partial<DocumentItem>) => DocumentItem;
  deleteDocument: (id: string) => void;
  // Établissements (Phase 3)
  establishments: Establishment[];
  addEstablishment: (data: Partial<Establishment>) => Establishment;
  updateEstablishment: (id: string, updates: Partial<Establishment>) => void;
  // Signalements & Vigilances / MAPI (Phase 3)
  signals: SignalItem[];
  addSignal: (data: Partial<SignalItem>) => SignalItem;
  updateSignalStep: (id: string, step: SignalStep) => void;
  updateSignal: (id: string, updates: Partial<SignalItem>) => void;
  // Formations des points focaux (Phase 3)
  trainings: TrainingItem[];
  addTraining: (data: Partial<TrainingItem>) => TrainingItem;
  updateTraining: (id: string, updates: Partial<TrainingItem>) => void;
  // Alertes de vigilance (Phase 3)
  alerts: VigilanceAlert[];
  addAlert: (data: Partial<VigilanceAlert>) => VigilanceAlert;
  closeAlert: (id: string) => void;
  // Toast notifications & Inter-Entity Actions
  toast: { id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (arg1: string, arg2?: 'success' | 'info' | 'warning' | 'error' | string) => void;
  hideToast: () => void;
  addCommentToFolder: (folderId: string, commentText: string) => void;
  addDocumentToFolder: (folderId: string, doc: { name: string; size_kb: number; file_type?: string }) => void;
  addDocumentToActivity: (activityId: string, doc: { name: string; size_kb: number; file_type?: string }) => void;
  createOutgoingResponseMail: (incomingMailId: string, subject?: string, notes?: string) => OutgoingMail;
  createFolderFromMail: (incomingMailId: string, folderType?: FolderType) => Folder;
  createAlertFromSignal: (signalId: string, riskLevel?: 'Faible' | 'Moyen' | 'Élevé' | 'Urgent', actionsRequired?: string) => VigilanceAlert;
  // Notifications & Audit & Stats
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  auditLogs: AuditLogItem[];
  stats: DashboardStats;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [incomingMails, setIncomingMails] = useState<IncomingMail[]>(INITIAL_INCOMING_MAILS);
  const [outgoingMails, setOutgoingMails] = useState<OutgoingMail[]>(INITIAL_OUTGOING_MAILS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [establishments, setEstablishments] = useState<Establishment[]>(INITIAL_ESTABLISHMENTS);
  const [signals, setSignals] = useState<SignalItem[]>(INITIAL_SIGNALS);
  const [trainings, setTrainings] = useState<TrainingItem[]>(INITIAL_TRAININGS);
  const [alerts, setAlerts] = useState<VigilanceAlert[]>(INITIAL_ALERTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isInitializedRef = React.useRef(false);

  const showToast = (arg1: string, arg2?: 'success' | 'info' | 'warning' | 'error' | string) => {
    const validTypes = ['success', 'info', 'warning', 'error'] as const;
    type ToastType = typeof validTypes[number];
    let message = arg1;
    let type: ToastType = 'success';

    if (validTypes.includes(arg1 as ToastType)) {
      type = arg1 as ToastType;
      message = (arg2 as string) || '';
    } else if (arg2 && validTypes.includes(arg2 as ToastType)) {
      type = arg2 as ToastType;
      message = arg1;
    }

    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Synchronisation avec la base de données Supabase
  const refreshFromDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await loadAllDataFromDatabase();
      if (res.success && res.data) {
        setIsDbConnected(true);
        if (res.data.activities && res.data.activities.length > 0) {
          setActivities(res.data.activities);
        }
        if (res.data.incomingMails && res.data.incomingMails.length > 0) {
          setIncomingMails(res.data.incomingMails);
        }
        if (res.data.outgoingMails && res.data.outgoingMails.length > 0) {
          setOutgoingMails(res.data.outgoingMails);
        }
        if (res.data.folders && res.data.folders.length > 0) {
          setFolders(res.data.folders);
        }
        if (res.data.documents && res.data.documents.length > 0) {
          setDocuments(res.data.documents);
        }
        if (res.data.establishments && res.data.establishments.length > 0) {
          setEstablishments(res.data.establishments);
        }
        if (res.data.signals && res.data.signals.length > 0) {
          setSignals(res.data.signals);
        }
        if (res.data.trainings && res.data.trainings.length > 0) {
          setTrainings(res.data.trainings);
        }
        if (res.data.alerts && res.data.alerts.length > 0) {
          setAlerts(res.data.alerts);
        }
        if (res.data.auditLogs && res.data.auditLogs.length > 0) {
          setAuditLogs(res.data.auditLogs);
        }
        if (res.data.notifications && res.data.notifications.length > 0) {
          setNotifications(res.data.notifications);
        }
      }
    } catch (e) {
      console.warn('Erreur synchronisation Supabase:', e);
      setIsDbConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Chargement initial au montage : LocalStorage instantané puis rafraîchissement Supabase
  useEffect(() => {
    try {
      // 1. Chargement instantané depuis LocalStorage pour éviter tout écran blanc
      const storedUsers = localStorage.getItem('activia_users');
      let currentUsersList = INITIAL_USERS;
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Migrer les anciens identifiants 'usr-00X' vers les UUIDs officiels Supabase
            const migrated = parsed.map((u: UserProfile) => {
              const matchedId = USER_ID_MAP[u.id] || u.id;
              const official = INITIAL_USERS.find(iu => iu.id === matchedId || iu.email === u.email);
              return official || { ...u, id: matchedId };
            });
            currentUsersList = migrated;
            setAllUsers(migrated);
          }
        } catch {}
      }

      const storedAuth = localStorage.getItem('activia_is_authenticated');
      if (storedAuth !== null) {
        setIsAuthenticated(storedAuth === 'true');
      }

      const storedUser = localStorage.getItem('activia_current_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const matchedId = USER_ID_MAP[parsed.id] || parsed.id;
          const match = currentUsersList.find((u: UserProfile) => u.id === matchedId || u.email === parsed.email);
          if (match) setCurrentUser(match);
        } catch {}
      }

      const storedActivities = localStorage.getItem('activia_activities');
      if (storedActivities) {
        try {
          const parsed = JSON.parse(storedActivities);
          if (Array.isArray(parsed) && parsed.length > 0) setActivities(parsed);
        } catch {}
      }

      const storedMailsIn = localStorage.getItem('activia_incoming_mails');
      if (storedMailsIn) {
        try {
          const parsed = JSON.parse(storedMailsIn);
          if (Array.isArray(parsed) && parsed.length > 0) setIncomingMails(parsed);
        } catch {}
      }

      const storedMailsOut = localStorage.getItem('activia_outgoing_mails');
      if (storedMailsOut) {
        try {
          const parsed = JSON.parse(storedMailsOut);
          if (Array.isArray(parsed) && parsed.length > 0) setOutgoingMails(parsed);
        } catch {}
      }

      const storedFolders = localStorage.getItem('activia_folders');
      if (storedFolders) {
        try {
          const parsed = JSON.parse(storedFolders);
          if (Array.isArray(parsed) && parsed.length > 0) setFolders(parsed);
        } catch {}
      }

      const storedDocs = localStorage.getItem('activia_documents');
      if (storedDocs) {
        try {
          const parsed = JSON.parse(storedDocs);
          if (Array.isArray(parsed) && parsed.length > 0) setDocuments(parsed);
        } catch {}
      }

      const storedEtabs = localStorage.getItem('activia_establishments');
      if (storedEtabs) {
        try {
          const parsed = JSON.parse(storedEtabs);
          if (Array.isArray(parsed) && parsed.length > 0) setEstablishments(parsed);
        } catch {}
      }

      const storedSignals = localStorage.getItem('activia_signals');
      if (storedSignals) {
        try {
          const parsed = JSON.parse(storedSignals);
          if (Array.isArray(parsed) && parsed.length > 0) setSignals(parsed);
        } catch {}
      }

      const storedTrainings = localStorage.getItem('activia_trainings');
      if (storedTrainings) {
        try {
          const parsed = JSON.parse(storedTrainings);
          if (Array.isArray(parsed) && parsed.length > 0) setTrainings(parsed);
        } catch {}
      }

      const storedAlerts = localStorage.getItem('activia_alerts');
      if (storedAlerts) {
        try {
          const parsed = JSON.parse(storedAlerts);
          if (Array.isArray(parsed) && parsed.length > 0) setAlerts(parsed);
        } catch {}
      }

      const storedLogs = localStorage.getItem('activia_audit_logs');
      if (storedLogs) {
        try {
          const parsed = JSON.parse(storedLogs);
          if (Array.isArray(parsed) && parsed.length > 0) setAuditLogs(parsed);
        } catch {}
      }

      const storedNotifs = localStorage.getItem('activia_notifications');
      if (storedNotifs) {
        try {
          const parsed = JSON.parse(storedNotifs);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch {}
      }
    } catch (e) {
      console.warn('Erreur lecture LocalStorage initiale', e);
    }

    // 2. Chargement de la source de vérité depuis la base de données Supabase
    setIsSyncing(true);
    loadAllDataFromDatabase()
      .then(res => {
        if (res.success && res.data) {
          setIsDbConnected(true);
          // Si Supabase contient des activités, elles priment
          if (res.data.activities && res.data.activities.length > 0) {
            setActivities(res.data.activities);
          } else {
            // Si la BDD est encore vide mais que l'utilisateur avait déjà saisi une activité en local
            const localActsRaw = localStorage.getItem('activia_activities');
            if (localActsRaw) {
              try {
                const localActs = JSON.parse(localActsRaw);
                if (Array.isArray(localActs) && localActs.length > 0) {
                  localActs.forEach(act => dbSaveActivity(act));
                }
              } catch {}
            }
          }

          if (res.data.incomingMails && res.data.incomingMails.length > 0) setIncomingMails(res.data.incomingMails);
          if (res.data.outgoingMails && res.data.outgoingMails.length > 0) setOutgoingMails(res.data.outgoingMails);
          if (res.data.folders && res.data.folders.length > 0) setFolders(res.data.folders);
          if (res.data.documents && res.data.documents.length > 0) setDocuments(res.data.documents);
          if (res.data.establishments && res.data.establishments.length > 0) setEstablishments(res.data.establishments);
          if (res.data.signals && res.data.signals.length > 0) setSignals(res.data.signals);
          if (res.data.trainings && res.data.trainings.length > 0) setTrainings(res.data.trainings);
          if (res.data.alerts && res.data.alerts.length > 0) setAlerts(res.data.alerts);
          if (res.data.auditLogs && res.data.auditLogs.length > 0) setAuditLogs(res.data.auditLogs);
          if (res.data.notifications && res.data.notifications.length > 0) setNotifications(res.data.notifications);
        } else {
          setIsDbConnected(false);
        }
      })
      .catch(err => {
        console.warn('Erreur chargement Supabase initial:', err);
        setIsDbConnected(false);
      })
      .finally(() => {
        setIsSyncing(false);
        isInitializedRef.current = true;
      });
  }, []);

  // Sauvegarde sécurisée dans LocalStorage (uniquement après initialisation réussie)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      localStorage.setItem('activia_users', JSON.stringify(allUsers));
      localStorage.setItem('activia_is_authenticated', String(isAuthenticated));
      localStorage.setItem('activia_current_user', JSON.stringify(currentUser));
      localStorage.setItem('activia_activities', JSON.stringify(activities));
      localStorage.setItem('activia_incoming_mails', JSON.stringify(incomingMails));
      localStorage.setItem('activia_outgoing_mails', JSON.stringify(outgoingMails));
      localStorage.setItem('activia_folders', JSON.stringify(folders));
      localStorage.setItem('activia_documents', JSON.stringify(documents));
      localStorage.setItem('activia_establishments', JSON.stringify(establishments));
      localStorage.setItem('activia_signals', JSON.stringify(signals));
      localStorage.setItem('activia_trainings', JSON.stringify(trainings));
      localStorage.setItem('activia_alerts', JSON.stringify(alerts));
      localStorage.setItem('activia_audit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('activia_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Erreur écriture LocalStorage', e);
    }
  }, [allUsers, isAuthenticated, currentUser, activities, incomingMails, outgoingMails, folders, documents, establishments, signals, trainings, alerts, auditLogs, notifications]);

  const allTasks: Task[] = activities.flatMap(act => act.tasks || []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        user_id: user.id,
        user_name: user.full_name,
        user_role: user.role_label,
        action: 'UPDATE',
        module: 'Sécurité',
        entity_type: 'user',
        entity_id: user.id,
        entity_name: user.full_name,
        details: `Connexion sous le profil ${user.full_name} (${user.role_label})`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const login = (identifier: string, pass: string): { success: boolean; message?: string; user?: UserProfile } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    const user = allUsers.find(u => 
      (u.username && u.username.toLowerCase() === cleanId) || 
      (u.email && u.email.toLowerCase() === cleanId)
    );

    if (!user) {
      return {
        success: false,
        message: `Identifiant ou adresse email introuvable. Format: initiale prénom + nom (ex: jsatchivi).`
      };
    }

    const effectivePassword = user.password || user.default_password;
    if (effectivePassword !== cleanPass) {
      return {
        success: false,
        message: `Mot de passe incorrect pour le compte de ${user.full_name}. Par défaut: nom + 123 (ex: satchivi123).`
      };
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('activia_is_authenticated', 'true');
    localStorage.setItem('activia_current_user', JSON.stringify(user));

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      user_id: user.id,
      user_name: user.full_name,
      user_role: user.role_label,
      action: 'LOGIN',
      module: 'Sécurité',
      entity_type: 'user',
      entity_id: user.id,
      entity_name: user.full_name,
      details: `Authentification réussie pour ${user.full_name} (${user.username})`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true, user };
  };

  const logout = () => {
    if (currentUser) {
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.role_label,
        action: 'LOGOUT',
        module: 'Sécurité',
        entity_type: 'user',
        entity_id: currentUser.id,
        entity_name: currentUser.full_name,
        details: `Déconnexion de la session pour ${currentUser.full_name}`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    setIsAuthenticated(false);
    localStorage.setItem('activia_is_authenticated', 'false');
    showToast('info', 'Vous avez été déconnecté avec succès.');
  };

  const updateUserPassword = (userId: string, newPass: string): boolean => {
    if (!newPass || newPass.trim().length < 4) {
      showToast('error', 'Le mot de passe doit comporter au moins 4 caractères.');
      return false;
    }
    let targetUserName = '';
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        targetUserName = u.full_name;
        return { ...u, password: newPass.trim() };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, password: newPass.trim() }));
    }

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      user_id: currentUser?.id || userId,
      user_name: currentUser?.full_name || targetUserName,
      user_role: currentUser?.role_label || 'Utilisateur',
      action: 'UPDATE',
      module: 'Sécurité',
      entity_type: 'user',
      entity_id: userId,
      entity_name: targetUserName,
      details: `Mise à jour du mot de passe pour ${targetUserName}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('success', `Mot de passe mis à jour avec succès pour ${targetUserName || 'le compte'}.`);
    return true;
  };

  const resetUserPassword = (userId: string): string => {
    let resetPass = '';
    let targetUserName = '';
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        resetPass = u.default_password;
        targetUserName = u.full_name;
        return { ...u, password: u.default_password };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, password: resetPass }));
    }

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      user_id: currentUser?.id || userId,
      user_name: currentUser?.full_name || targetUserName,
      user_role: currentUser?.role_label || 'Administrateur',
      action: 'UPDATE',
      module: 'Sécurité',
      entity_type: 'user',
      entity_id: userId,
      entity_name: targetUserName,
      details: `Réinitialisation du mot de passe par défaut (${resetPass}) pour ${targetUserName}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('info', `Mot de passe de ${targetUserName} réinitialisé à "${resetPass}".`);
    return resetPass;
  };

  // ==========================================
  // ACTIVITÉS & TÂCHES (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addActivity = (data: Partial<Activity>): Activity => {
    const newId = generateUuid();
    const newCode = `ACT-2026-${String(activities.length + 101).padStart(4, '0')}`;
    const newActivity: Activity = {
      id: newId,
      code: newCode,
      title: data.title || 'Nouvelle activité',
      description: data.description || '',
      activity_type: data.activity_type || 'Réglementaire',
      priority: data.priority || 'moyenne',
      status: data.status || 'a_faire',
      progress_percentage: data.progress_percentage || 0,
      manager_id: data.manager_id || currentUser.id,
      manager_name: data.manager_name || currentUser.full_name,
      collaborators: data.collaborators || [],
      department: data.department || currentUser.department,
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      due_date: data.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      associated_folder: data.associated_folder || '',
      documents: [],
      tasks: [],
      comments: [],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    // 1. Mise à jour instantanée du state React
    setActivities(prev => {
      const updated = [newActivity, ...prev];
      // Sécurité locale immédiate
      try { localStorage.setItem('activia_activities', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 2. Persistance directe dans la base de données Supabase
    dbSaveActivity(newActivity).then(success => {
      if (success) {
        showToast('Activité enregistrée avec succès dans la base de données', 'success');
      } else {
        console.warn('Sauvegarde BDD en attente de reconnexion, conservée en local.');
      }
    });

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Activités',
      entity_type: 'activity',
      entity_id: newCode,
      entity_name: newActivity.title,
      details: `Création de l'activité ${newCode} par ${currentUser.full_name}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(prev => [log, ...prev]);
    dbSaveAuditLog(log);

    if (newActivity.manager_id !== currentUser.id) {
      const notif: NotificationItem = {
        id: generateUuid(),
        user_id: newActivity.manager_id,
        title: 'Nouvelle activité assignée',
        message: `Vous êtes responsable de l'activité ${newCode}: ${newActivity.title}`,
        type: 'assignment',
        link: '/activities',
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return newActivity;
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => {
      const updatedList = prev.map(act => {
        if (act.id === id) {
          const updated = {
            ...act,
            ...updates,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'UPDATE',
            module: 'Activités',
            entity_type: 'activity',
            entity_id: act.code,
            entity_name: act.title,
            details: `Modification des paramètres de l'activité ${act.code}`,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);
          return updated;
        }
        return act;
      });
      try { localStorage.setItem('activia_activities', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Persistance directe dans Supabase
    dbUpdateActivity(id, updates);
  };

  const updateActivityStatus = (id: string, newStatus: ActivityStatus) => {
    let completed_at: string | undefined = undefined;
    let progress = 0;

    setActivities(prev => {
      const updatedList = prev.map(act => {
        if (act.id === id) {
          const oldStatus = act.status;
          progress = newStatus === 'termine' ? 100 : (oldStatus === 'termine' ? 50 : act.progress_percentage);
          completed_at = newStatus === 'termine' ? new Date().toISOString().split('T')[0] : undefined;

          const updated = {
            ...act,
            status: newStatus,
            progress_percentage: progress,
            completed_at,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'STATUS_CHANGE',
            module: 'Activités',
            entity_type: 'activity',
            entity_id: act.code,
            entity_name: act.title,
            details: `Passage du statut de "${oldStatus}" à "${newStatus}"`,
            old_value: oldStatus,
            new_value: newStatus,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);

          return updated;
        }
        return act;
      });
      try { localStorage.setItem('activia_activities', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Persistance directe dans Supabase
    dbUpdateActivity(id, {
      status: newStatus,
      progress_percentage: progress,
      completed_at,
    });
  };

  const deleteActivity = (id: string) => {
    const toDelete = activities.find(a => a.id === id);
    if (!toDelete) return;

    setActivities(prev => {
      const updatedList = prev.filter(a => a.id !== id);
      try { localStorage.setItem('activia_activities', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Persistance directe suppression Supabase
    dbDeleteActivity(id);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'DELETE',
      module: 'Activités',
      entity_type: 'activity',
      entity_id: toDelete.code,
      entity_name: toDelete.title,
      details: `Suppression définitive de l'activité ${toDelete.code}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);
  };

  const addTask = (data: Partial<Task>) => {
    if (!data.activity_id) return;
    const newTask: Task = {
      id: generateUuid(),
      activity_id: data.activity_id,
      title: data.title || 'Nouvelle tâche',
      description: data.description || '',
      assignee_id: data.assignee_id || currentUser.id,
      assignee_name: data.assignee_name || (allUsers.find(u => u.id === data.assignee_id)?.full_name || currentUser.full_name),
      priority: data.priority || 'moyenne',
      status: data.status || 'a_faire',
      due_date: data.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0]
    };

    setActivities(prev => {
      const updatedList = prev.map(act => {
        if (act.id === data.activity_id) {
          return {
            ...act,
            tasks: [...(act.tasks || []), newTask]
          };
        }
        return act;
      });
      try { localStorage.setItem('activia_activities', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Persistance directe dans Supabase table 'tasks'
    dbSaveTask(newTask);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Tâches',
      entity_type: 'task',
      entity_id: newTask.id,
      entity_name: newTask.title,
      details: `Création de la tâche affectée à ${newTask.assignee_name}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);
  };

  const updateTaskStatus = (taskId: string, newStatus: 'a_faire' | 'en_cours' | 'termine' | 'en_retard') => {
    let affectedTask: Task | undefined;
    let completedAt: string | undefined = undefined;

    setActivities(prev => {
      const updatedList = prev.map(act => {
        const hasTask = act.tasks.some(t => t.id === taskId);
        if (!hasTask) return act;

        const updatedTasks = act.tasks.map(t => {
          if (t.id === taskId) {
            completedAt = newStatus === 'termine' ? new Date().toISOString().split('T')[0] : undefined;
            affectedTask = {
              ...t,
              status: newStatus,
              completed_at: completedAt
            };
            return affectedTask;
          }
          return t;
        });

        const total = updatedTasks.length;
        const completed = updatedTasks.filter(t => t.status === 'termine').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : act.progress_percentage;

        // Mise à jour de la progression de l'activité en BDD également
        dbUpdateActivity(act.id, { progress_percentage: progress });

        return {
          ...act,
          tasks: updatedTasks,
          progress_percentage: progress
        };
      });
      try { localStorage.setItem('activia_activities', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Persistance directe dans Supabase table 'tasks'
    dbUpdateTask(taskId, {
      status: newStatus,
      completed_at: completedAt
    });

    if (affectedTask) {
      const log: AuditLogItem = {
        id: generateUuid(),
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.role_label,
        action: 'STATUS_CHANGE',
        module: 'Tâches',
        entity_type: 'task',
        entity_id: taskId,
        entity_name: affectedTask.title,
        details: `Statut de la tâche passé à "${newStatus}"`,
        old_value: (affectedTask as any).old_status || 'a_faire',
        new_value: newStatus,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setAuditLogs(logs => [log, ...logs]);
      dbSaveAuditLog(log);
    }
  };

  const addCommentToActivity = (activityId: string, commentText: string) => {
    const newComment = {
      id: generateUuid(),
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_role: currentUser.role_label,
      content: commentText,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setActivities(prev => {
      const updatedList = prev.map(act => {
        if (act.id === activityId) {
          return {
            ...act,
            comments: [...(act.comments || []), newComment]
          };
        }
        return act;
      });
      try { localStorage.setItem('activia_activities', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Persistance directe dans Supabase table 'activity_comments'
    dbAddActivityComment(activityId, newComment);
  };

  // ==========================================
  // COURRIERS (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addIncomingMail = (data: Partial<IncomingMail>): IncomingMail => {
    const nextNum = `ARR-2026-${String(incomingMails.length + 897).padStart(4, '0')}`;
    const newMail: IncomingMail = {
      id: generateUuid(),
      register_number: nextNum,
      receipt_date: data.receipt_date || new Date().toISOString().split('T')[0],
      reference: data.reference || 'REF-EXTERNE',
      sender: data.sender || 'Expéditeur non spécifié',
      sender_type: data.sender_type || 'Usager',
      subject: data.subject || 'Courrier sans objet',
      mail_type: data.mail_type || 'Officiel',
      department: data.department || 'Direction & SI Réglementaire',
      manager_id: data.manager_id,
      manager_name: data.manager_name,
      due_date: data.due_date || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: data.status || 'reception',
      priority: data.priority || 'moyenne',
      scanned_doc_name: data.scanned_doc_name,
      scanned_doc_url: data.scanned_doc_url,
      observations: data.observations || '',
      linked_folder_number: data.linked_folder_number,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setIncomingMails(prev => {
      const updated = [newMail, ...prev];
      try { localStorage.setItem('activia_incoming_mails', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // Sauvegarde directe BDD Supabase
    dbSaveIncomingMail(newMail);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Courriers',
      entity_type: 'mail',
      entity_id: nextNum,
      entity_name: newMail.subject,
      details: `Enregistrement du courrier entrant ${nextNum} par ${currentUser.full_name}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);

    return newMail;
  };

  const updateIncomingMailStatus = (id: string, newStatus: IncomingMailStatus) => {
    setIncomingMails(prev => {
      const updatedList = prev.map(m => {
        if (m.id === id) {
          const oldStatus = m.status;
          const updated = {
            ...m,
            status: newStatus,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'STATUS_CHANGE',
            module: 'Courriers',
            entity_type: 'mail',
            entity_id: m.register_number,
            entity_name: m.subject,
            details: `Changement du statut courrier de "${oldStatus}" à "${newStatus}"`,
            old_value: oldStatus,
            new_value: newStatus,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);
          return updated;
        }
        return m;
      });
      try { localStorage.setItem('activia_incoming_mails', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateIncomingMail(id, { status: newStatus });
  };

  const assignIncomingMail = (id: string, managerId: string) => {
    const manager = allUsers.find(u => u.id === managerId);
    if (!manager) return;

    setIncomingMails(prev => {
      const updatedList = prev.map(m => {
        if (m.id === id) {
          const updated = {
            ...m,
            manager_id: manager.id,
            manager_name: manager.full_name,
            status: 'traitement' as IncomingMailStatus,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'ASSIGN',
            module: 'Courriers',
            entity_type: 'mail',
            entity_id: m.register_number,
            entity_name: m.subject,
            details: `Courrier affecté à ${manager.full_name} (${manager.title})`,
            new_value: manager.full_name,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);

          const notif: NotificationItem = {
            id: generateUuid(),
            user_id: manager.id,
            title: 'Courrier officiel affecté',
            message: `Le courrier ${m.register_number} vous a été assigné pour instruction.`,
            type: 'assignment',
            link: '/mail',
            is_read: false,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setNotifications(notifs => [notif, ...notifs]);

          return updated;
        }
        return m;
      });
      try { localStorage.setItem('activia_incoming_mails', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateIncomingMail(id, {
      manager_id: manager.id,
      manager_name: manager.full_name,
      status: 'traitement' as IncomingMailStatus,
    });
  };

  const addOutgoingMail = (data: Partial<OutgoingMail>): OutgoingMail => {
    const nextNum = `DEP-2026-${String(outgoingMails.length + 414).padStart(4, '0')}`;
    const newMail: OutgoingMail = {
      id: generateUuid(),
      mail_number: nextNum,
      send_date: data.send_date || new Date().toISOString().split('T')[0],
      reference: data.reference || `ACT-REF/${nextNum}`,
      recipient: data.recipient || 'Destinataire non spécifié',
      subject: data.subject || 'Courrier sortant',
      mail_type: data.mail_type || 'Officiel',
      manager_id: data.manager_id || currentUser.id,
      manager_name: data.manager_name || currentUser.full_name,
      status: data.status || 'valide',
      document_name: data.document_name,
      document_url: data.document_url,
      linked_incoming_id: data.linked_incoming_id,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setOutgoingMails(prev => {
      const updated = [newMail, ...prev];
      try { localStorage.setItem('activia_outgoing_mails', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveOutgoingMail(newMail);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Courriers',
      entity_type: 'mail',
      entity_id: nextNum,
      entity_name: newMail.subject,
      details: `Émission du courrier sortant ${nextNum} à destination de ${newMail.recipient}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);

    return newMail;
  };

  const updateOutgoingMailStatus = (id: string, newStatus: OutgoingMailStatus) => {
    setOutgoingMails(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status: newStatus } : m);
      try { localStorage.setItem('activia_outgoing_mails', JSON.stringify(updated)); } catch {}
      return updated;
    });
    dbUpdateOutgoingMail(id, { status: newStatus });
  };

  // ==========================================
  // DOSSIERS & DEMANDES (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addFolder = (data: Partial<Folder>): Folder => {
    const nextNum = `DOS-2026-${String(folders.length + 90).padStart(4, '0')}`;
    const manager = allUsers.find(u => u.id === data.manager_id) || currentUser;

    const newFolder: Folder = {
      id: generateUuid(),
      folder_number: nextNum,
      folder_type: data.folder_type || 'Autorisation d’achat',
      applicant: data.applicant || 'Demandeur non spécifié',
      structure: data.structure || 'Établissement',
      receipt_date: data.receipt_date || new Date().toISOString().split('T')[0],
      manager_id: manager.id,
      manager_name: manager.full_name,
      priority: data.priority || 'moyenne',
      status: data.status || 'depot',
      progress_percentage: 10,
      due_date: data.due_date || new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      decision: 'En attente',
      observations: data.observations || '',
      documents: [],
      comments: [],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setFolders(prev => {
      const updated = [newFolder, ...prev];
      try { localStorage.setItem('activia_folders', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveFolder(newFolder);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Dossiers',
      entity_type: 'folder',
      entity_id: nextNum,
      entity_name: `${newFolder.folder_type} - ${newFolder.structure}`,
      details: `Création du dossier ${nextNum} déposé par ${newFolder.applicant}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);

    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => {
      const updatedList = prev.map(f => {
        if (f.id === id) {
          const updated = {
            ...f,
            ...updates,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'UPDATE',
            module: 'Dossiers',
            entity_type: 'folder',
            entity_id: f.folder_number,
            entity_name: f.structure,
            details: `Mise à jour du dossier ${f.folder_number}`,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);
          return updated;
        }
        return f;
      });
      try { localStorage.setItem('activia_folders', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateFolder(id, updates);
  };

  const updateFolderStatus = (id: string, newStatus: FolderStatus) => {
    const steps: FolderStatus[] = ['depot', 'reception', 'verification', 'complet', 'traitement', 'validation', 'decision', 'notification', 'cloture'];
    const idx = steps.indexOf(newStatus);
    const progress = idx >= 0 ? Math.round(((idx + 1) / steps.length) * 100) : 50;

    setFolders(prev => {
      const updatedList = prev.map(f => {
        if (f.id === id) {
          const oldStatus = f.status;
          const updated = {
            ...f,
            status: newStatus,
            progress_percentage: progress,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'STATUS_CHANGE',
            module: 'Dossiers',
            entity_type: 'folder',
            entity_id: f.folder_number,
            entity_name: f.structure,
            details: `Étape du dossier changée de "${oldStatus}" à "${newStatus}"`,
            old_value: oldStatus,
            new_value: newStatus,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);

          return updated;
        }
        return f;
      });
      try { localStorage.setItem('activia_folders', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateFolder(id, {
      status: newStatus,
      progress_percentage: progress,
    });
  };

  const advanceFolderStep = (id: string) => {
    const steps: FolderStatus[] = ['depot', 'reception', 'verification', 'complet', 'traitement', 'validation', 'decision', 'notification', 'cloture'];
    const folder = folders.find(f => f.id === id);
    if (!folder) return;
    const currentIndex = steps.indexOf(folder.status);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      updateFolderStatus(id, steps[currentIndex + 1]);
    }
  };

  const addCommentToFolder = (folderId: string, commentText: string) => {
    const newComment = {
      id: `com-${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_role: currentUser.role_label,
      content: commentText,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          comments: [...(f.comments || []), newComment]
        };
      }
      return f;
    }));

    showToast('Commentaire technique consigné au dossier', 'success');
  };

  const addDocumentToFolder = (folderId: string, doc: { name: string; size_kb: number; file_type?: string }) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const fileType = doc.file_type || (doc.name.endsWith('.docx') ? 'Word' : doc.name.endsWith('.xlsx') ? 'Excel' : 'PDF');
    const newDocItem: ActivityDocument = {
      id: `doc-${Date.now()}`,
      name: doc.name,
      file_type: fileType,
      size_kb: doc.size_kb,
      uploaded_at: new Date().toISOString().split('T')[0],
      uploaded_by_name: currentUser.full_name,
      url: '/storage/' + doc.name
    };

    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          documents: [...(f.documents || []), newDocItem]
        };
      }
      return f;
    }));

    addDocument({
      name: doc.name,
      file_type: (fileType as any),
      size_kb: doc.size_kb,
      entity_type: 'dossier',
      entity_id: folder.id,
      entity_ref: folder.folder_number
    });

    showToast(`Pièce "${doc.name}" versée au dossier`, 'success');
  };

  const addDocumentToActivity = (activityId: string, doc: { name: string; size_kb: number; file_type?: string }) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;

    const fileType = doc.file_type || (doc.name.endsWith('.docx') ? 'Word' : doc.name.endsWith('.xlsx') ? 'Excel' : 'PDF');
    const newDocItem: ActivityDocument = {
      id: `doc-${Date.now()}`,
      name: doc.name,
      file_type: fileType,
      size_kb: doc.size_kb,
      uploaded_at: new Date().toISOString().split('T')[0],
      uploaded_by_name: currentUser.full_name,
      url: '/storage/' + doc.name
    };

    setActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        return {
          ...a,
          documents: [...(a.documents || []), newDocItem]
        };
      }
      return a;
    }));

    addDocument({
      name: doc.name,
      file_type: (fileType as any),
      size_kb: doc.size_kb,
      entity_type: 'activite',
      entity_id: act.id,
      entity_ref: act.code
    });

    showToast(`Pièce "${doc.name}" rattachée à l'activité`, 'success');
  };

  const createOutgoingResponseMail = (incomingMailId: string, subject?: string, notes?: string): OutgoingMail => {
    const inMail = incomingMails.find(m => m.id === incomingMailId);
    const sub = subject || (inMail ? `Réponse à : ${inMail.subject}` : 'Courrier officiel de réponse');
    const recip = inMail ? inMail.sender : 'Destinataire officiel';

    if (inMail) {
      updateIncomingMailStatus(incomingMailId, 'reponse');
    }

    const newOut = addOutgoingMail({
      recipient: recip,
      reference: `REP-${inMail ? inMail.register_number : Date.now().toString().slice(-4)}`,
      subject: sub,
      mail_type: inMail ? inMail.mail_type : 'Officiel',
      status: 'en_validation',
      document_name: `Reponse_${inMail ? inMail.register_number : 'Officielle'}.pdf`
    });

    showToast(`Courrier sortant ${newOut.mail_number} initié en réponse à ${inMail?.register_number || 'ce pli'}`, 'success');
    return newOut;
  };

  const createFolderFromMail = (incomingMailId: string, folderType: FolderType = 'Autorisation d’achat'): Folder => {
    const inMail = incomingMails.find(m => m.id === incomingMailId);
    
    const newFolder = addFolder({
      folder_type: folderType,
      applicant: inMail?.sender || 'Demandeur identifié par courrier',
      structure: inMail?.sender || 'Établissement demandeur',
      observations: `Dossier créé automatiquement depuis le courrier entrant ${inMail?.register_number || ''} : ${inMail?.subject || ''}`,
      status: 'depot'
    });

    if (inMail) {
      setIncomingMails(prev => prev.map(m => m.id === incomingMailId ? { ...m, linked_folder_number: newFolder.folder_number, status: 'traitement' } : m));
    }

    showToast(`Dossier ${newFolder.folder_number} créé et lié au courrier ${inMail?.register_number}`, 'success');
    return newFolder;
  };

  const createAlertFromSignal = (signalId: string, riskLevel: 'Faible' | 'Moyen' | 'Élevé' | 'Urgent' = 'Urgent', actionsRequired: string = 'Quarantaine immédiate et diffusion de la note d’alerte'): VigilanceAlert => {
    const sig = signals.find(s => s.id === signalId);
    const newAlert = addAlert({
      product_name: sig ? sig.product_name : 'Produit sous alerte',
      source: sig ? `Signalement ${sig.signal_number} (${sig.reporter_name})` : 'Cellule de Vigilance',
      nature: sig ? sig.signal_type : 'Alerte Sanitaire Majeure',
      risk_level: riskLevel,
      description: sig ? sig.description : 'Menace sanitaire grave identifiée',
      actions_required: actionsRequired
    });

    if (sig) {
      updateSignal(signalId, { status: 'action_engagee', corrective_actions: `Alerte nationale ${newAlert.alert_number} déclenchée.` });
    }

    showToast(`Alerte Sanitaire ${newAlert.alert_number} déclenchée avec succès`, 'warning');
    return newAlert;
  };

  // ==========================================
  // GED DOCUMENTS (PHASE 2)
  // ==========================================

  // ==========================================
  // GED DOCUMENTS (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addDocument = (data: Partial<DocumentItem>): DocumentItem => {
    const newDoc: DocumentItem = {
      id: generateUuid(),
      name: data.name || 'Document_Sans_Titre.pdf',
      file_type: data.file_type || 'PDF',
      size_kb: data.size_kb || 450,
      entity_type: data.entity_type || 'dossier',
      entity_id: data.entity_id || 'fol-001',
      entity_ref: data.entity_ref || 'DOS-2026-0089',
      uploaded_by_id: currentUser.id,
      uploaded_by_name: currentUser.full_name,
      uploaded_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      file_url: data.file_url || '/storage/placeholder.pdf'
    };

    setDocuments(prev => {
      const updated = [newDoc, ...prev];
      try { localStorage.setItem('activia_documents', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveDocument(newDoc);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Dossiers',
      entity_type: 'folder',
      entity_id: newDoc.entity_ref,
      entity_name: newDoc.name,
      details: `Dépôt du document ${newDoc.name} (${newDoc.size_kb} KB) par ${currentUser.full_name}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);

    return newDoc;
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id);
      try { localStorage.setItem('activia_documents', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbDeleteDocument(id);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'DELETE',
      module: 'Dossiers',
      entity_type: 'folder',
      entity_id: doc.entity_ref,
      entity_name: doc.name,
      details: `Suppression du document ${doc.name} par ${currentUser.full_name}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);
  };

  // ==========================================
  // ÉTABLISSEMENTS (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addEstablishment = (data: Partial<Establishment>): Establishment => {
    const nextCode = `ETAB-2026-${String(establishments.length + 10).padStart(4, '0')}`;
    const newEtab: Establishment = {
      id: generateUuid(),
      code: nextCode,
      name: data.name || 'Nouvel Établissement',
      establishment_type: data.establishment_type || 'Officine',
      owner: data.owner || 'Propriétaire',
      responsible_pharmacist: data.responsible_pharmacist || 'Pharmacien Responsable',
      address: data.address || '',
      city: data.city || 'Ville',
      department: data.department || 'Direction Régionale',
      phone: data.phone || '',
      email: data.email || '',
      status: data.status || 'Actif',
      authorization_number: data.authorization_number || `AUT-${Date.now().toString().slice(-6)}`,
      auth_date: data.auth_date || new Date().toISOString().split('T')[0],
      documents: [],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    setEstablishments(prev => {
      const updated = [newEtab, ...prev];
      try { localStorage.setItem('activia_establishments', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveEstablishment(newEtab);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Sécurité',
      entity_type: 'user',
      entity_id: nextCode,
      entity_name: newEtab.name,
      details: `Enregistrement de l'établissement ${newEtab.name} (${newEtab.establishment_type})`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);

    return newEtab;
  };

  const updateEstablishment = (id: string, updates: Partial<Establishment>) => {
    setEstablishments(prev => {
      const updatedList = prev.map(e => {
        if (e.id === id) {
          return {
            ...e,
            ...updates,
            updated_at: new Date().toISOString().split('T')[0]
          };
        }
        return e;
      });
      try { localStorage.setItem('activia_establishments', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateEstablishment(id, updates);
  };

  // ==========================================
  // SIGNALEMENTS & MAPI & VIGILANCES (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addSignal = (data: Partial<SignalItem>): SignalItem => {
    const nextNum = `SIG-2026-${String(signals.length + 88).padStart(4, '0')}`;
    const manager = allUsers.find(u => u.id === data.manager_id) || currentUser;

    const newSignal: SignalItem = {
      id: generateUuid(),
      signal_number: nextNum,
      receipt_date: data.receipt_date || new Date().toISOString().split('T')[0],
      reporter_name: data.reporter_name || 'Déclarant non spécifié',
      reporter_type: data.reporter_type || 'Hôpital Public',
      product_name: data.product_name || 'Produit de santé',
      batch_number: data.batch_number || 'LOT-INCONNU',
      manufacturer: data.manufacturer || 'Fabricant',
      signal_type: data.signal_type || 'MAPI',
      severity: data.severity || 'Modérée',
      description: data.description || '',
      manager_id: manager.id,
      manager_name: manager.full_name,
      workflow_step: 'signalement',
      status: 'en_cours',
      sample_taken: Boolean(data.sample_taken),
      sample_code: data.sample_code,
      lab_name: data.lab_name,
      conclusion: data.conclusion,
      corrective_actions: data.corrective_actions,
      documents: [],
      comments: [],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSignals(prev => {
      const updated = [newSignal, ...prev];
      try { localStorage.setItem('activia_signals', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveSignal(newSignal);

    const log: AuditLogItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role_label,
      action: 'CREATE',
      module: 'Activités',
      entity_type: 'activity',
      entity_id: nextNum,
      entity_name: `${newSignal.signal_type} - ${newSignal.product_name}`,
      details: `Enregistrement du signalement ${nextNum} (${newSignal.severity})`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs(logs => [log, ...logs]);
    dbSaveAuditLog(log);

    return newSignal;
  };

  const updateSignalStep = (id: string, newStep: SignalStep) => {
    setSignals(prev => {
      const updatedList = prev.map(s => {
        if (s.id === id) {
          const oldStep = s.workflow_step;
          const updated = {
            ...s,
            workflow_step: newStep,
            status: newStep === 'cloture' ? 'cloture' : s.status,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          const log: AuditLogItem = {
            id: generateUuid(),
            user_id: currentUser.id,
            user_name: currentUser.full_name,
            user_role: currentUser.role_label,
            action: 'STATUS_CHANGE',
            module: 'Activités',
            entity_type: 'activity',
            entity_id: s.signal_number,
            entity_name: s.product_name,
            details: `Étape de traitement du signalement passée de "${oldStep}" à "${newStep}"`,
            old_value: oldStep,
            new_value: newStep,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          setAuditLogs(logs => [log, ...logs]);
          dbSaveAuditLog(log);

          return updated;
        }
        return s;
      });
      try { localStorage.setItem('activia_signals', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateSignal(id, {
      workflow_step: newStep,
      status: newStep === 'cloture' ? 'cloture' : 'en_cours',
    });
  };

  const updateSignal = (id: string, updates: Partial<SignalItem>) => {
    setSignals(prev => {
      const updatedList = prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            ...updates,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return s;
      });
      try { localStorage.setItem('activia_signals', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    dbUpdateSignal(id, updates);
  };

  // ==========================================
  // FORMATIONS (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addTraining = (data: Partial<TrainingItem>): TrainingItem => {
    const nextCode = `FORM-2026-${String(trainings.length + 17).padStart(3, '0')}`;
    const newTraining: TrainingItem = {
      id: generateUuid(),
      training_code: nextCode,
      participant_name: data.participant_name || 'Participant',
      function_title: data.function_title || 'Point Focal Pharmacovigilance',
      structure: data.structure || 'Structure Sanitaire',
      region: data.region || 'Région Lagunes',
      department: data.department || 'Vigilances Sanitaires & MAPI',
      theme: data.theme || 'Gestion des MAPI',
      training_date: data.training_date || new Date().toISOString().split('T')[0],
      trainer_name: data.trainer_name || currentUser.full_name,
      duration_hours: data.duration_hours || 8,
      result: data.result || 'Validé',
      certificate_issued: Boolean(data.certificate_issued),
      certificate_number: `CERT-2026-${Date.now().toString().slice(-4)}`,
      documents: [],
      created_at: new Date().toISOString().split('T')[0]
    };

    setTrainings(prev => {
      const updated = [newTraining, ...prev];
      try { localStorage.setItem('activia_trainings', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveTraining(newTraining);
    return newTraining;
  };

  const updateTraining = (id: string, updates: Partial<TrainingItem>) => {
    setTrainings(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      try { localStorage.setItem('activia_trainings', JSON.stringify(updated)); } catch {}
      return updated;
    });
    dbUpdateTraining(id, updates);
  };

  // ==========================================
  // ALERTES (PERSISTANCE DIRECTE BDD SUPABASE)
  // ==========================================

  const addAlert = (data: Partial<VigilanceAlert>): VigilanceAlert => {
    const nextNum = `ALT-2026-${String(alerts.length + 4).padStart(3, '0')}`;
    const newAlert: VigilanceAlert = {
      id: generateUuid(),
      alert_number: nextNum,
      alert_date: data.alert_date || new Date().toISOString().split('T')[0],
      source: data.source || 'Centre de Vigilance',
      product_name: data.product_name || 'Produit concerné',
      nature: data.nature || 'Alerte Sanitaire',
      risk_level: data.risk_level || 'Élevé',
      description: data.description || '',
      actions_required: data.actions_required || 'Quarantaine immédiate',
      manager_name: data.manager_name || currentUser.full_name,
      status: 'active'
    };

    setAlerts(prev => {
      const updated = [newAlert, ...prev];
      try { localStorage.setItem('activia_alerts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    dbSaveAlert(newAlert);

    // Send notifications to all agents
    const notif: NotificationItem = {
      id: generateUuid(),
      user_id: currentUser.id,
      title: `ALERTE SANITAIRE : ${newAlert.product_name}`,
      message: `${newAlert.nature} - ${newAlert.description}`,
      type: 'alert',
      link: '/signals',
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setNotifications(prev => [notif, ...prev]);

    return newAlert;
  };

  const closeAlert = (id: string) => {
    const closingDate = new Date().toISOString().split('T')[0];
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? {
        ...a,
        status: 'cloturee' as const,
        closing_date: closingDate
      } : a);
      try { localStorage.setItem('activia_alerts', JSON.stringify(updated)); } catch {}
      return updated;
    });
    dbUpdateAlert(id, { status: 'cloturee', closing_date: closingDate });
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const resetToDefaultData = () => {
    setActivities(INITIAL_ACTIVITIES);
    setIncomingMails(INITIAL_INCOMING_MAILS);
    setOutgoingMails(INITIAL_OUTGOING_MAILS);
    setFolders(INITIAL_FOLDERS);
    setDocuments(INITIAL_DOCUMENTS);
    setEstablishments(INITIAL_ESTABLISHMENTS);
    setSignals(INITIAL_SIGNALS);
    setTrainings(INITIAL_TRAININGS);
    setAlerts(INITIAL_ALERTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAllUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    try {
      localStorage.removeItem('activia_activities');
      localStorage.removeItem('activia_incoming_mails');
      localStorage.removeItem('activia_outgoing_mails');
      localStorage.removeItem('activia_folders');
      localStorage.removeItem('activia_documents');
      localStorage.removeItem('activia_establishments');
      localStorage.removeItem('activia_signals');
      localStorage.removeItem('activia_trainings');
      localStorage.removeItem('activia_alerts');
    } catch {}
  };

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;

  const computedStats: DashboardStats = {
    totalFolders: folders.length,
    foldersInProgress: folders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length,
    foldersTreated: folders.filter(f => f.status === 'cloture').length,
    foldersDelayed: folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture' && f.status !== 'rejete').length,
    incomingMail: incomingMails.length,
    outgoingMail: outgoingMails.length,
    activitiesInProgress: activities.filter(a => a.status === 'en_cours').length,
    activitiesDelayed: activities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length,
    pendingRequests: folders.filter(f => f.status === 'depot' || f.status === 'reception').length,
    openReports: signals.filter(s => s.status !== 'cloture').length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        isDbConnected,
        isSyncing,
        refreshFromDatabase,
        switchUser,
        login,
        logout,
        updateUserPassword,
        resetUserPassword,
        activities,
        tasks: allTasks,
        addActivity,
        updateActivity,
        updateActivityStatus,
        deleteActivity,
        addTask,
        updateTaskStatus,
        addCommentToActivity,
        incomingMails,
        outgoingMails,
        addIncomingMail,
        updateIncomingMailStatus,
        assignIncomingMail,
        addOutgoingMail,
        updateOutgoingMailStatus,
        folders,
        addFolder,
        updateFolder,
        updateFolderStatus,
        advanceFolderStep,
        documents,
        addDocument,
        deleteDocument,
        establishments,
        addEstablishment,
        updateEstablishment,
        signals,
        addSignal,
        updateSignalStep,
        updateSignal,
        trainings,
        addTraining,
        updateTraining,
        alerts,
        addAlert,
        closeAlert,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        stats: computedStats,
        resetToDefaultData,
        toast,
        showToast,
        hideToast,
        addCommentToFolder,
        addDocumentToFolder,
        addDocumentToActivity,
        createOutgoingResponseMail,
        createFolderFromMail,
        createAlertFromSignal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
