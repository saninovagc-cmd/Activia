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

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
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
  const [allUsers] = useState<UserProfile[]>(INITIAL_USERS);
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

  const DATA_VERSION = '2026.10.dlvs.clean.v1';

  // Load from localStorage on mount with version validation
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem('activia_data_version');
      if (storedVersion !== DATA_VERSION) {
        localStorage.clear();
        localStorage.setItem('activia_data_version', DATA_VERSION);
        setCurrentUser(INITIAL_USERS[0]);
        return;
      }

      const storedActivities = localStorage.getItem('activia_activities');
      if (storedActivities) setActivities(JSON.parse(storedActivities));

      const storedUser = localStorage.getItem('activia_current_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const match = INITIAL_USERS.find(u => u.id === parsed.id);
        if (match) setCurrentUser(match);
      }

      const storedMailsIn = localStorage.getItem('activia_incoming_mails');
      if (storedMailsIn) setIncomingMails(JSON.parse(storedMailsIn));

      const storedMailsOut = localStorage.getItem('activia_outgoing_mails');
      if (storedMailsOut) setOutgoingMails(JSON.parse(storedMailsOut));

      const storedFolders = localStorage.getItem('activia_folders');
      if (storedFolders) setFolders(JSON.parse(storedFolders));

      const storedDocs = localStorage.getItem('activia_documents');
      if (storedDocs) setDocuments(JSON.parse(storedDocs));

      const storedEtabs = localStorage.getItem('activia_establishments');
      if (storedEtabs) setEstablishments(JSON.parse(storedEtabs));

      const storedSignals = localStorage.getItem('activia_signals');
      if (storedSignals) setSignals(JSON.parse(storedSignals));

      const storedTrainings = localStorage.getItem('activia_trainings');
      if (storedTrainings) setTrainings(JSON.parse(storedTrainings));

      const storedAlerts = localStorage.getItem('activia_alerts');
      if (storedAlerts) setAlerts(JSON.parse(storedAlerts));

      const storedLogs = localStorage.getItem('activia_audit_logs');
      if (storedLogs) setAuditLogs(JSON.parse(storedLogs));

      const storedNotifs = localStorage.getItem('activia_notifications');
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (e) {
      console.warn('LocalStorage not available or parse error', e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
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
      localStorage.setItem('activia_current_user', JSON.stringify(currentUser));
    } catch (e) {
      console.warn('LocalStorage write error', e);
    }
  }, [activities, incomingMails, outgoingMails, folders, documents, establishments, signals, trainings, alerts, auditLogs, notifications, currentUser]);

  const allTasks: Task[] = activities.flatMap(act => act.tasks || []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
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

  // ==========================================
  // ACTIVITÉS & TÂCHES
  // ==========================================

  const addActivity = (data: Partial<Activity>): Activity => {
    const newCode = `ACT-2026-${String(activities.length + 101).padStart(4, '0')}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
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

    setActivities(prev => [newActivity, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    if (newActivity.manager_id !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
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
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        const updated = {
          ...act,
          ...updates,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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
        return updated;
      }
      return act;
    }));
  };

  const updateActivityStatus = (id: string, newStatus: ActivityStatus) => {
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        const oldStatus = act.status;
        const progress = newStatus === 'termine' ? 100 : (oldStatus === 'termine' ? 50 : act.progress_percentage);
        const completed_at = newStatus === 'termine' ? new Date().toISOString().split('T')[0] : undefined;

        const updated = {
          ...act,
          status: newStatus,
          progress_percentage: progress,
          completed_at,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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

        return updated;
      }
      return act;
    }));
  };

  const deleteActivity = (id: string) => {
    const toDelete = activities.find(a => a.id === id);
    if (!toDelete) return;

    setActivities(prev => prev.filter(a => a.id !== id));

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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
  };

  const addTask = (data: Partial<Task>) => {
    if (!data.activity_id) return;
    const newTask: Task = {
      id: `tsk-${Date.now()}`,
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

    setActivities(prev => prev.map(act => {
      if (act.id === data.activity_id) {
        return {
          ...act,
          tasks: [...(act.tasks || []), newTask]
        };
      }
      return act;
    }));

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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
  };

  const updateTaskStatus = (taskId: string, newStatus: 'a_faire' | 'en_cours' | 'termine' | 'en_retard') => {
    let affectedTask: Task | undefined;
    setActivities(prev => prev.map(act => {
      const hasTask = act.tasks.some(t => t.id === taskId);
      if (!hasTask) return act;

      const updatedTasks = act.tasks.map(t => {
        if (t.id === taskId) {
          affectedTask = t;
          return {
            ...t,
            status: newStatus,
            completed_at: newStatus === 'termine' ? new Date().toISOString().split('T')[0] : undefined
          };
        }
        return t;
      });

      const total = updatedTasks.length;
      const completed = updatedTasks.filter(t => t.status === 'termine').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : act.progress_percentage;

      return {
        ...act,
        tasks: updatedTasks,
        progress_percentage: progress
      };
    }));

    if (affectedTask) {
      const log: AuditLogItem = {
        id: `log-${Date.now()}`,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.role_label,
        action: 'STATUS_CHANGE',
        module: 'Tâches',
        entity_type: 'task',
        entity_id: taskId,
        entity_name: affectedTask.title,
        details: `Statut de la tâche passé à "${newStatus}"`,
        old_value: affectedTask.status,
        new_value: newStatus,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setAuditLogs(logs => [log, ...logs]);
    }
  };

  const addCommentToActivity = (activityId: string, commentText: string) => {
    const newComment = {
      id: `com-${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_role: currentUser.role_label,
      content: commentText,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          comments: [...(act.comments || []), newComment]
        };
      }
      return act;
    }));
  };

  // ==========================================
  // COURRIERS (PHASE 2)
  // ==========================================

  const addIncomingMail = (data: Partial<IncomingMail>): IncomingMail => {
    const nextNum = `ARR-2026-${String(incomingMails.length + 897).padStart(4, '0')}`;
    const newMail: IncomingMail = {
      id: `in-${Date.now()}`,
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

    setIncomingMails(prev => [newMail, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    return newMail;
  };

  const updateIncomingMailStatus = (id: string, newStatus: IncomingMailStatus) => {
    setIncomingMails(prev => prev.map(m => {
      if (m.id === id) {
        const oldStatus = m.status;
        const updated = {
          ...m,
          status: newStatus,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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
        return updated;
      }
      return m;
    }));
  };

  const assignIncomingMail = (id: string, managerId: string) => {
    const manager = allUsers.find(u => u.id === managerId);
    if (!manager) return;

    setIncomingMails(prev => prev.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          manager_id: manager.id,
          manager_name: manager.full_name,
          status: 'traitement' as IncomingMailStatus,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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

        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
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
    }));
  };

  const addOutgoingMail = (data: Partial<OutgoingMail>): OutgoingMail => {
    const nextNum = `DEP-2026-${String(outgoingMails.length + 414).padStart(4, '0')}`;
    const newMail: OutgoingMail = {
      id: `out-${Date.now()}`,
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

    setOutgoingMails(prev => [newMail, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    return newMail;
  };

  const updateOutgoingMailStatus = (id: string, newStatus: OutgoingMailStatus) => {
    setOutgoingMails(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: newStatus
        };
      }
      return m;
    }));
  };

  // ==========================================
  // DOSSIERS & DEMANDES (PHASE 2)
  // ==========================================

  const addFolder = (data: Partial<Folder>): Folder => {
    const nextNum = `DOS-2026-${String(folders.length + 90).padStart(4, '0')}`;
    const manager = allUsers.find(u => u.id === data.manager_id) || currentUser;

    const newFolder: Folder = {
      id: `fol-${Date.now()}`,
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

    setFolders(prev => [newFolder, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => {
      if (f.id === id) {
        const updated = {
          ...f,
          ...updates,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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
        return updated;
      }
      return f;
    }));
  };

  const updateFolderStatus = (id: string, newStatus: FolderStatus) => {
    const steps: FolderStatus[] = ['depot', 'reception', 'verification', 'complet', 'traitement', 'validation', 'decision', 'notification', 'cloture'];
    const idx = steps.indexOf(newStatus);
    const progress = idx >= 0 ? Math.round(((idx + 1) / steps.length) * 100) : 50;

    setFolders(prev => prev.map(f => {
      if (f.id === id) {
        const oldStatus = f.status;
        const updated = {
          ...f,
          status: newStatus,
          progress_percentage: progress,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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

        return updated;
      }
      return f;
    }));
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

  const addDocument = (data: Partial<DocumentItem>): DocumentItem => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
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

    setDocuments(prev => [newDoc, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    return newDoc;
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    setDocuments(prev => prev.filter(d => d.id !== id));

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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
  };

  // ==========================================
  // ÉTABLISSEMENTS (PHASE 3)
  // ==========================================

  const addEstablishment = (data: Partial<Establishment>): Establishment => {
    const nextCode = `ETAB-2026-${String(establishments.length + 10).padStart(4, '0')}`;
    const newEtab: Establishment = {
      id: `etab-${Date.now()}`,
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

    setEstablishments(prev => [newEtab, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    return newEtab;
  };

  const updateEstablishment = (id: string, updates: Partial<Establishment>) => {
    setEstablishments(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          ...updates,
          updated_at: new Date().toISOString().split('T')[0]
        };
      }
      return e;
    }));
  };

  // ==========================================
  // SIGNALEMENTS & MAPI & VIGILANCES (PHASE 3)
  // ==========================================

  const addSignal = (data: Partial<SignalItem>): SignalItem => {
    const nextNum = `SIG-2026-${String(signals.length + 88).padStart(4, '0')}`;
    const manager = allUsers.find(u => u.id === data.manager_id) || currentUser;

    const newSignal: SignalItem = {
      id: `sig-${Date.now()}`,
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

    setSignals(prev => [newSignal, ...prev]);

    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
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

    return newSignal;
  };

  const updateSignalStep = (id: string, newStep: SignalStep) => {
    setSignals(prev => prev.map(s => {
      if (s.id === id) {
        const oldStep = s.workflow_step;
        const updated = {
          ...s,
          workflow_step: newStep,
          status: newStep === 'cloture' ? 'cloture' : s.status,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        const log: AuditLogItem = {
          id: `log-${Date.now()}`,
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

        return updated;
      }
      return s;
    }));
  };

  const updateSignal = (id: string, updates: Partial<SignalItem>) => {
    setSignals(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return s;
    }));
  };

  // ==========================================
  // FORMATIONS (PHASE 3)
  // ==========================================

  const addTraining = (data: Partial<TrainingItem>): TrainingItem => {
    const nextCode = `FORM-2026-${String(trainings.length + 17).padStart(3, '0')}`;
    const newTraining: TrainingItem = {
      id: `t-${Date.now()}`,
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

    setTrainings(prev => [newTraining, ...prev]);
    return newTraining;
  };

  const updateTraining = (id: string, updates: Partial<TrainingItem>) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // ==========================================
  // ALERTES (PHASE 3)
  // ==========================================

  const addAlert = (data: Partial<VigilanceAlert>): VigilanceAlert => {
    const nextNum = `ALT-2026-${String(alerts.length + 4).padStart(3, '0')}`;
    const newAlert: VigilanceAlert = {
      id: `alt-${Date.now()}`,
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

    setAlerts(prev => [newAlert, ...prev]);

    // Send notifications to all agents
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
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
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'cloturee',
      closing_date: new Date().toISOString().split('T')[0]
    } : a));
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
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
    localStorage.setItem('activia_data_version', DATA_VERSION);
  };

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;

  const computedStats: DashboardStats = {
    totalFolders: folders.length,
    foldersInProgress: folders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length,
    foldersTreated: folders.filter(f => f.status === 'cloture').length,
    foldersDelayed: folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length,
    incomingMail: incomingMails.length,
    outgoingMail: outgoingMails.length,
    activitiesInProgress: activities.filter(a => a.status === 'en_cours').length,
    activitiesDelayed: activities.filter(a => a.status === 'en_retard').length,
    pendingRequests: folders.filter(f => f.status === 'depot' || f.status === 'reception').length,
    openReports: signals.filter(s => s.status !== 'cloture').length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
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
