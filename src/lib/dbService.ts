import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Activity, 
  Task, 
  ActivityComment, 
  IncomingMail, 
  OutgoingMail, 
  Folder, 
  DocumentItem, 
  Establishment, 
  SignalItem, 
  TrainingItem, 
  VigilanceAlert, 
  AuditLogItem, 
  NotificationItem,
  UserProfile
} from '@/types';

// Regex validation UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mapping rétrocompatibilité anciens identifiants 'usr-00X' -> Supabase UUIDs
export const USER_ID_MAP: Record<string, string> = {
  'usr-001': 'a0000000-0000-0000-0000-000000000001',
  'usr-002': 'a0000000-0000-0000-0000-000000000002',
  'usr-003': 'a0000000-0000-0000-0000-000000000003',
  'usr-004': 'a0000000-0000-0000-0000-000000000004',
  'usr-005': 'a0000000-0000-0000-0000-000000000005',
  'usr-006': 'a0000000-0000-0000-0000-000000000006',
  'usr-007': 'a0000000-0000-0000-0000-000000000007',
  'usr-008': 'a0000000-0000-0000-0000-000000000008',
  'usr-009': 'a0000000-0000-0000-0000-000000000009',
  'usr-010': 'a0000000-0000-0000-0000-000000000010',
  'usr-011': 'a0000000-0000-0000-0000-000000000011',
  'usr-012': 'a0000000-0000-0000-0000-000000000012',
  'usr-013': 'a0000000-0000-0000-0000-000000000013',
  'usr-014': 'a0000000-0000-0000-0000-000000000014',
};

export const normalizeUserId = (id?: string | null): string | null => {
  if (!id) return null;
  const trimmed = id.trim();
  if (USER_ID_MAP[trimmed]) return USER_ID_MAP[trimmed];
  if (UUID_REGEX.test(trimmed)) return trimmed;
  return null;
};

export const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ensureUuid = (id?: string | null): string => {
  if (!id) return generateUuid();
  const trimmed = id.trim();
  if (USER_ID_MAP[trimmed]) return USER_ID_MAP[trimmed];
  if (UUID_REGEX.test(trimmed)) return trimmed;
  return generateUuid();
};

// ==============================================================================
// CHARGEMENT COMPLET DES DONNÉES DEPUIS SUPABASE
// ==============================================================================

export interface DatabasePayload {
  activities?: Activity[];
  incomingMails?: IncomingMail[];
  outgoingMails?: OutgoingMail[];
  folders?: Folder[];
  documents?: DocumentItem[];
  establishments?: Establishment[];
  signals?: SignalItem[];
  trainings?: TrainingItem[];
  alerts?: VigilanceAlert[];
  auditLogs?: AuditLogItem[];
  notifications?: NotificationItem[];
  profiles?: UserProfile[];
}

export const loadAllDataFromDatabase = async (): Promise<{ success: boolean; data?: DatabasePayload; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase n’est pas configuré' };
  }

  try {
    const [
      activitiesRes,
      tasksRes,
      commentsRes,
      incomingRes,
      outgoingRes,
      foldersRes,
      docsRes,
      etabsRes,
      signalsRes,
      trainingsRes,
      alertsRes,
      logsRes,
      notifsRes,
    ] = await Promise.all([
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_comments').select('*').order('created_at', { ascending: true }),
      supabase.from('incoming_mails').select('*').order('created_at', { ascending: false }),
      supabase.from('outgoing_mails').select('*').order('created_at', { ascending: false }),
      supabase.from('folders').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('establishments').select('*').order('created_at', { ascending: false }),
      supabase.from('signals_vigilance').select('*').order('created_at', { ascending: false }),
      supabase.from('trainings').select('*').order('created_at', { ascending: false }),
      supabase.from('alerts').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(250),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    // Assembler les activités avec leurs tâches et commentaires
    const rawTasks = tasksRes.data || [];
    const rawComments = commentsRes.data || [];
    const rawDocs = docsRes.data || [];

    const activities: Activity[] = (activitiesRes.data || []).map((row: any) => {
      const actTasks: Task[] = rawTasks
        .filter((t: any) => t.activity_id === row.id)
        .map((t: any) => ({
          id: t.id,
          activity_id: t.activity_id,
          activity_code: row.code,
          activity_title: row.title,
          title: t.title,
          description: t.description || '',
          assignee_id: t.assignee_id || '',
          assignee_name: t.assignee_name || '',
          priority: t.priority || 'moyenne',
          status: t.status || 'a_faire',
          due_date: t.due_date,
          completed_at: t.completed_at || undefined,
          created_at: t.created_at ? t.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
        }));

      const actComments: ActivityComment[] = rawComments
        .filter((c: any) => c.activity_id === row.id)
        .map((c: any) => ({
          id: c.id,
          author_id: c.author_id || '',
          author_name: c.author_name || 'Utilisateur',
          author_role: c.author_role || 'Agent',
          content: c.content,
          created_at: c.created_at ? c.created_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16),
        }));

      const actDocs = rawDocs
        .filter((d: any) => d.entity_type === 'activite' && d.entity_id === row.id)
        .map((d: any) => ({
          id: d.id,
          name: d.name,
          file_type: d.file_type || 'PDF',
          size_kb: d.size_kb || 0,
          uploaded_at: d.created_at ? d.created_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16),
          uploaded_by_name: d.uploaded_by_name || 'Collaborateur',
          url: d.file_url || undefined,
        }));

      return {
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description || '',
        activity_type: row.activity_type || 'Réglementaire',
        priority: row.priority || 'moyenne',
        status: row.status || 'a_faire',
        progress_percentage: Number(row.progress_percentage || 0),
        manager_id: row.manager_id || '',
        manager_name: row.manager_name || '',
        collaborators: [],
        department: row.department || '',
        start_date: row.start_date,
        due_date: row.due_date,
        completed_at: row.completed_at || undefined,
        associated_folder: row.associated_folder || '',
        documents: actDocs,
        tasks: actTasks,
        comments: actComments,
        created_at: row.created_at ? row.created_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16),
        updated_at: row.updated_at ? row.updated_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16),
      };
    });

    const incomingMails: IncomingMail[] = (incomingRes.data || []).map((m: any) => ({
      id: m.id,
      register_number: m.register_number,
      receipt_date: m.receipt_date,
      reference: m.reference,
      sender: m.sender,
      sender_type: m.sender_type,
      subject: m.subject,
      mail_type: m.mail_type,
      department: m.department,
      manager_id: m.manager_id,
      manager_name: m.manager_name,
      due_date: m.due_date,
      status: m.status,
      priority: m.priority,
      scanned_doc_name: m.scanned_doc_name,
      scanned_doc_url: m.scanned_doc_url,
      observations: m.observations,
      linked_folder_id: m.linked_folder_id,
      linked_folder_number: m.linked_folder_number,
      created_at: m.created_at ? m.created_at.replace('T', ' ').substring(0, 16) : '',
      updated_at: m.updated_at ? m.updated_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const outgoingMails: OutgoingMail[] = (outgoingRes.data || []).map((m: any) => ({
      id: m.id,
      mail_number: m.mail_number,
      send_date: m.send_date,
      reference: m.reference,
      recipient: m.recipient,
      subject: m.subject,
      mail_type: m.mail_type,
      manager_id: m.manager_id,
      manager_name: m.manager_name,
      status: m.status,
      document_name: m.document_name,
      document_url: m.document_url,
      linked_incoming_id: m.linked_incoming_id,
      created_at: m.created_at ? m.created_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const folders: Folder[] = (foldersRes.data || []).map((f: any) => ({
      id: f.id,
      folder_number: f.folder_number,
      folder_type: f.folder_type,
      applicant: f.applicant,
      structure: f.structure,
      receipt_date: f.receipt_date,
      manager_id: f.manager_id,
      manager_name: f.manager_name,
      priority: f.priority,
      status: f.status,
      progress_percentage: Number(f.progress_percentage || 0),
      due_date: f.due_date,
      decision: f.decision,
      decision_date: f.decision_date,
      decision_notes: f.decision_notes,
      observations: f.observations,
      documents: [],
      comments: [],
      created_at: f.created_at ? f.created_at.replace('T', ' ').substring(0, 16) : '',
      updated_at: f.updated_at ? f.updated_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const documents: DocumentItem[] = (docsRes.data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      file_type: d.file_type,
      size_kb: Number(d.size_kb || 0),
      entity_type: d.entity_type,
      entity_id: d.entity_id,
      entity_ref: d.entity_ref,
      uploaded_by_id: d.uploaded_by_id || '',
      uploaded_by_name: d.uploaded_by_name || '',
      uploaded_at: d.created_at ? d.created_at.replace('T', ' ').substring(0, 16) : '',
      file_url: d.file_url,
    }));

    const establishments: Establishment[] = (etabsRes.data || []).map((e: any) => ({
      id: e.id,
      code: e.code,
      name: e.name,
      establishment_type: e.establishment_type,
      owner: e.owner,
      responsible_pharmacist: e.responsible_pharmacist,
      address: e.address,
      city: e.city,
      department: e.department,
      phone: e.phone,
      email: e.email,
      status: e.status,
      authorization_number: e.authorization_number,
      auth_date: e.auth_date,
      expiry_date: e.expiry_date,
      documents: [],
      created_at: e.created_at ? e.created_at.replace('T', ' ').substring(0, 16) : '',
      updated_at: e.updated_at ? e.updated_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const signals: SignalItem[] = (signalsRes.data || []).map((s: any) => ({
      id: s.id,
      signal_number: s.signal_number,
      receipt_date: s.receipt_date,
      reporter_name: s.reporter_name,
      reporter_type: s.reporter_type,
      product_name: s.product_name,
      batch_number: s.batch_number,
      manufacturer: s.manufacturer || '',
      signal_type: s.signal_type,
      severity: s.severity,
      description: s.description,
      manager_id: s.manager_id,
      manager_name: s.manager_name,
      workflow_step: s.workflow_step,
      status: s.status,
      sample_taken: Boolean(s.sample_taken),
      sample_code: s.sample_code,
      lab_name: s.lab_name,
      lab_result: s.lab_result,
      imputability_score: s.imputability_score,
      conclusion: s.conclusion,
      corrective_actions: s.corrective_actions,
      documents: [],
      comments: [],
      created_at: s.created_at ? s.created_at.replace('T', ' ').substring(0, 16) : '',
      updated_at: s.updated_at ? s.updated_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const trainings: TrainingItem[] = (trainingsRes.data || []).map((t: any) => ({
      id: t.id,
      training_code: t.training_code,
      participant_name: t.participant_name,
      function_title: t.function_title,
      structure: t.structure,
      region: t.region,
      department: t.department,
      theme: t.theme,
      training_date: t.training_date,
      trainer_name: t.trainer_name,
      duration_hours: Number(t.duration_hours || 8),
      result: t.result,
      certificate_issued: Boolean(t.certificate_issued),
      certificate_number: t.certificate_number,
      documents: [],
      created_at: t.created_at ? t.created_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const alerts: VigilanceAlert[] = (alertsRes.data || []).map((a: any) => ({
      id: a.id,
      alert_number: a.alert_number,
      alert_date: a.alert_date,
      source: a.source,
      product_name: a.product_name,
      nature: a.nature,
      risk_level: a.risk_level,
      description: a.description,
      actions_required: a.actions_required,
      manager_name: a.manager_name,
      status: a.status,
      closing_date: a.closing_date,
    }));

    const auditLogs: AuditLogItem[] = (logsRes.data || []).map((l: any) => ({
      id: l.id,
      user_id: l.user_id || '',
      user_name: l.user_name || '',
      user_role: l.user_role || '',
      action: l.action,
      module: l.module,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      entity_name: l.entity_name,
      details: l.details || '',
      old_value: l.old_value,
      new_value: l.new_value,
      created_at: l.created_at ? l.created_at.replace('T', ' ').substring(0, 16) : '',
    }));

    const notifications: NotificationItem[] = (notifsRes.data || []).map((n: any) => ({
      id: n.id,
      user_id: n.user_id || '',
      title: n.title,
      message: n.message,
      type: n.type || 'system',
      link: n.link,
      is_read: Boolean(n.is_read),
      created_at: n.created_at ? n.created_at.replace('T', ' ').substring(0, 16) : '',
    }));

    return {
      success: true,
      data: {
        activities,
        incomingMails,
        outgoingMails,
        folders,
        documents,
        establishments,
        signals,
        trainings,
        alerts,
        auditLogs,
        notifications,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Erreur chargement Supabase:', errorMsg);
    return { success: false, error: errorMsg };
  }
};

// ==============================================================================
// PERSISTANCE DIRECTE ACTIVITÉS & TÂCHES (PHASE 1)
// ==============================================================================

export const dbSaveActivity = async (activity: Activity): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(activity.id),
      code: activity.code,
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type,
      priority: activity.priority,
      status: activity.status,
      progress_percentage: activity.progress_percentage || 0,
      manager_id: normalizeUserId(activity.manager_id),
      manager_name: activity.manager_name || null,
      department: activity.department,
      start_date: activity.start_date,
      due_date: activity.due_date,
      completed_at: activity.completed_at ? new Date(activity.completed_at).toISOString() : null,
      associated_folder: activity.associated_folder || null,
    };

    const { error } = await supabase.from('activities').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveActivity Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveActivity:', e);
    return false;
  }
};

export const dbUpdateActivity = async (id: string, updates: Partial<Activity>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.activity_type !== undefined) payload.activity_type = updates.activity_type;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.progress_percentage !== undefined) payload.progress_percentage = updates.progress_percentage;
    if (updates.manager_id !== undefined) payload.manager_id = normalizeUserId(updates.manager_id);
    if (updates.manager_name !== undefined) payload.manager_name = updates.manager_name;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.start_date !== undefined) payload.start_date = updates.start_date;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date;
    if (updates.completed_at !== undefined) payload.completed_at = updates.completed_at ? new Date(updates.completed_at).toISOString() : null;
    if (updates.associated_folder !== undefined) payload.associated_folder = updates.associated_folder;

    const { error } = await supabase.from('activities').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateActivity Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateActivity:', e);
    return false;
  }
};

export const dbDeleteActivity = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) {
      console.error('Erreur dbDeleteActivity Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbDeleteActivity:', e);
    return false;
  }
};

export const dbSaveTask = async (task: Task): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(task.id),
      activity_id: ensureUuid(task.activity_id),
      title: task.title,
      assignee_id: normalizeUserId(task.assignee_id),
      assignee_name: task.assignee_name || null,
      priority: task.priority || 'moyenne',
      status: task.status || 'a_faire',
      due_date: task.due_date,
      completed_at: task.completed_at ? new Date(task.completed_at).toISOString() : null,
    };

    const { error } = await supabase.from('tasks').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveTask Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveTask:', e);
    return false;
  }
};

export const dbUpdateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date;
    if (updates.completed_at !== undefined) payload.completed_at = updates.completed_at ? new Date(updates.completed_at).toISOString() : null;
    if (updates.assignee_id !== undefined) payload.assignee_id = normalizeUserId(updates.assignee_id);
    if (updates.assignee_name !== undefined) payload.assignee_name = updates.assignee_name;

    const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);
    if (error) {
      console.error('Erreur dbUpdateTask Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateTask:', e);
    return false;
  }
};

export const dbAddActivityComment = async (activityId: string, comment: ActivityComment): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(comment.id),
      activity_id: ensureUuid(activityId),
      author_id: normalizeUserId(comment.author_id),
      author_name: comment.author_name,
      author_role: comment.author_role,
      content: comment.content,
    };
    const { error } = await supabase.from('activity_comments').insert(payload);
    if (error) {
      console.error('Erreur dbAddActivityComment Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbAddActivityComment:', e);
    return false;
  }
};

// ==============================================================================
// PERSISTANCE DIRECTE COURRIERS & DOSSIERS & GED (PHASE 2)
// ==============================================================================

export const dbSaveIncomingMail = async (mail: IncomingMail): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(mail.id),
      register_number: mail.register_number,
      receipt_date: mail.receipt_date,
      reference: mail.reference,
      sender: mail.sender,
      sender_type: mail.sender_type || null,
      subject: mail.subject,
      mail_type: mail.mail_type,
      department: mail.department,
      manager_id: normalizeUserId(mail.manager_id),
      manager_name: mail.manager_name || null,
      due_date: mail.due_date,
      status: mail.status,
      priority: mail.priority,
      scanned_doc_name: mail.scanned_doc_name || null,
      scanned_doc_url: mail.scanned_doc_url || null,
      observations: mail.observations || null,
      linked_folder_id: mail.linked_folder_id || null,
      linked_folder_number: mail.linked_folder_number || null,
    };
    const { error } = await supabase.from('incoming_mails').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveIncomingMail Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveIncomingMail:', e);
    return false;
  }
};

export const dbUpdateIncomingMail = async (id: string, updates: Partial<IncomingMail>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.manager_id !== undefined) payload.manager_id = normalizeUserId(updates.manager_id);
    if (updates.manager_name !== undefined) payload.manager_name = updates.manager_name;
    if (updates.linked_folder_id !== undefined) payload.linked_folder_id = updates.linked_folder_id;
    if (updates.linked_folder_number !== undefined) payload.linked_folder_number = updates.linked_folder_number;
    if (updates.observations !== undefined) payload.observations = updates.observations;

    const { error } = await supabase.from('incoming_mails').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateIncomingMail Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateIncomingMail:', e);
    return false;
  }
};

export const dbSaveOutgoingMail = async (mail: OutgoingMail): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(mail.id),
      mail_number: mail.mail_number,
      send_date: mail.send_date,
      reference: mail.reference,
      recipient: mail.recipient,
      subject: mail.subject,
      mail_type: mail.mail_type,
      manager_id: normalizeUserId(mail.manager_id),
      manager_name: mail.manager_name,
      status: mail.status,
      document_name: mail.document_name || null,
      document_url: mail.document_url || null,
      linked_incoming_id: mail.linked_incoming_id ? ensureUuid(mail.linked_incoming_id) : null,
    };
    const { error } = await supabase.from('outgoing_mails').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveOutgoingMail Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveOutgoingMail:', e);
    return false;
  }
};

export const dbUpdateOutgoingMail = async (id: string, updates: Partial<OutgoingMail>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.manager_id !== undefined) payload.manager_id = normalizeUserId(updates.manager_id);
    if (updates.manager_name !== undefined) payload.manager_name = updates.manager_name;
    if (updates.document_name !== undefined) payload.document_name = updates.document_name;
    if (updates.document_url !== undefined) payload.document_url = updates.document_url;

    const { error } = await supabase.from('outgoing_mails').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateOutgoingMail Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateOutgoingMail:', e);
    return false;
  }
};

export const dbSaveFolder = async (folder: Folder): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(folder.id),
      folder_number: folder.folder_number,
      folder_type: folder.folder_type,
      applicant: folder.applicant,
      structure: folder.structure,
      receipt_date: folder.receipt_date,
      manager_id: normalizeUserId(folder.manager_id),
      manager_name: folder.manager_name,
      priority: folder.priority,
      status: folder.status,
      progress_percentage: folder.progress_percentage || 0,
      due_date: folder.due_date,
      decision: folder.decision || 'En attente',
      decision_date: folder.decision_date || null,
      decision_notes: folder.decision_notes || null,
      observations: folder.observations || null,
    };
    const { error } = await supabase.from('folders').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveFolder Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveFolder:', e);
    return false;
  }
};

export const dbUpdateFolder = async (id: string, updates: Partial<Folder>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.progress_percentage !== undefined) payload.progress_percentage = updates.progress_percentage;
    if (updates.decision !== undefined) payload.decision = updates.decision;
    if (updates.decision_date !== undefined) payload.decision_date = updates.decision_date;
    if (updates.decision_notes !== undefined) payload.decision_notes = updates.decision_notes;
    if (updates.manager_id !== undefined) payload.manager_id = normalizeUserId(updates.manager_id);
    if (updates.manager_name !== undefined) payload.manager_name = updates.manager_name;
    if (updates.observations !== undefined) payload.observations = updates.observations;

    const { error } = await supabase.from('folders').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateFolder Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateFolder:', e);
    return false;
  }
};

export const dbSaveDocument = async (doc: DocumentItem): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(doc.id),
      name: doc.name,
      file_type: doc.file_type,
      size_kb: doc.size_kb || 0,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
      entity_ref: doc.entity_ref,
      uploaded_by_id: normalizeUserId(doc.uploaded_by_id),
      uploaded_by_name: doc.uploaded_by_name || null,
      file_url: doc.file_url,
    };
    const { error } = await supabase.from('documents').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveDocument Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveDocument:', e);
    return false;
  }
};

export const dbDeleteDocument = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      console.error('Erreur dbDeleteDocument Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbDeleteDocument:', e);
    return false;
  }
};

// ==============================================================================
// PERSISTANCE DIRECTE VIGILANCES & MÉTIERS (PHASE 3)
// ==============================================================================

export const dbSaveEstablishment = async (etab: Establishment): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(etab.id),
      code: etab.code,
      name: etab.name,
      establishment_type: etab.establishment_type,
      owner: etab.owner,
      responsible_pharmacist: etab.responsible_pharmacist,
      address: etab.address,
      city: etab.city,
      department: etab.department,
      phone: etab.phone || null,
      email: etab.email || null,
      status: etab.status,
      authorization_number: etab.authorization_number,
      auth_date: etab.auth_date,
      expiry_date: etab.expiry_date || null,
    };
    const { error } = await supabase.from('establishments').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveEstablishment Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveEstablishment:', e);
    return false;
  }
};

export const dbUpdateEstablishment = async (id: string, updates: Partial<Establishment>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.responsible_pharmacist !== undefined) payload.responsible_pharmacist = updates.responsible_pharmacist;

    const { error } = await supabase.from('establishments').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateEstablishment Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateEstablishment:', e);
    return false;
  }
};

export const dbSaveSignal = async (sig: SignalItem): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(sig.id),
      signal_number: sig.signal_number,
      receipt_date: sig.receipt_date,
      reporter_name: sig.reporter_name,
      reporter_type: sig.reporter_type,
      product_name: sig.product_name,
      batch_number: sig.batch_number,
      manufacturer: sig.manufacturer || null,
      signal_type: sig.signal_type,
      severity: sig.severity,
      description: sig.description,
      manager_id: normalizeUserId(sig.manager_id),
      manager_name: sig.manager_name,
      workflow_step: sig.workflow_step,
      status: sig.status,
      sample_taken: Boolean(sig.sample_taken),
      sample_code: sig.sample_code || null,
      lab_name: sig.lab_name || null,
      lab_result: sig.lab_result || null,
      imputability_score: sig.imputability_score || null,
      conclusion: sig.conclusion || null,
      corrective_actions: sig.corrective_actions || null,
    };
    const { error } = await supabase.from('signals_vigilance').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveSignal Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveSignal:', e);
    return false;
  }
};

export const dbUpdateSignal = async (id: string, updates: Partial<SignalItem>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.workflow_step !== undefined) payload.workflow_step = updates.workflow_step;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.manager_id !== undefined) payload.manager_id = normalizeUserId(updates.manager_id);
    if (updates.manager_name !== undefined) payload.manager_name = updates.manager_name;
    if (updates.sample_taken !== undefined) payload.sample_taken = updates.sample_taken;
    if (updates.sample_code !== undefined) payload.sample_code = updates.sample_code;
    if (updates.lab_name !== undefined) payload.lab_name = updates.lab_name;
    if (updates.lab_result !== undefined) payload.lab_result = updates.lab_result;
    if (updates.imputability_score !== undefined) payload.imputability_score = updates.imputability_score;
    if (updates.conclusion !== undefined) payload.conclusion = updates.conclusion;
    if (updates.corrective_actions !== undefined) payload.corrective_actions = updates.corrective_actions;

    const { error } = await supabase.from('signals_vigilance').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateSignal Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateSignal:', e);
    return false;
  }
};

export const dbSaveTraining = async (tr: TrainingItem): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(tr.id),
      training_code: tr.training_code,
      participant_name: tr.participant_name,
      function_title: tr.function_title,
      structure: tr.structure,
      region: tr.region,
      department: tr.department,
      theme: tr.theme,
      training_date: tr.training_date,
      trainer_name: tr.trainer_name,
      duration_hours: tr.duration_hours || 8,
      result: tr.result,
      certificate_issued: Boolean(tr.certificate_issued),
      certificate_number: tr.certificate_number || null,
    };
    const { error } = await supabase.from('trainings').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveTraining Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveTraining:', e);
    return false;
  }
};

export const dbUpdateTraining = async (id: string, updates: Partial<TrainingItem>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = {};
    if (updates.result !== undefined) payload.result = updates.result;
    if (updates.certificate_issued !== undefined) payload.certificate_issued = updates.certificate_issued;
    if (updates.certificate_number !== undefined) payload.certificate_number = updates.certificate_number;

    const { error } = await supabase.from('trainings').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateTraining Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateTraining:', e);
    return false;
  }
};

export const dbSaveAlert = async (al: VigilanceAlert): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(al.id),
      alert_number: al.alert_number,
      alert_date: al.alert_date,
      source: al.source,
      product_name: al.product_name,
      nature: al.nature,
      risk_level: al.risk_level,
      description: al.description,
      actions_required: al.actions_required,
      manager_name: al.manager_name,
      status: al.status,
      closing_date: al.closing_date || null,
    };
    const { error } = await supabase.from('alerts').upsert(payload);
    if (error) {
      console.error('Erreur dbSaveAlert Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveAlert:', e);
    return false;
  }
};

export const dbUpdateAlert = async (id: string, updates: Partial<VigilanceAlert>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.closing_date !== undefined) payload.closing_date = updates.closing_date;

    const { error } = await supabase.from('alerts').update(payload).eq('id', id);
    if (error) {
      console.error('Erreur dbUpdateAlert Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbUpdateAlert:', e);
    return false;
  }
};

export const dbSaveAuditLog = async (log: AuditLogItem): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(log.id),
      user_id: normalizeUserId(log.user_id),
      user_name: log.user_name,
      user_role: log.user_role || null,
      action: log.action,
      module: log.module,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      entity_name: log.entity_name,
      details: log.details || null,
      old_value: log.old_value || null,
      new_value: log.new_value || null,
    };
    const { error } = await supabase.from('audit_logs').insert(payload);
    if (error) {
      console.error('Erreur dbSaveAuditLog Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveAuditLog:', e);
    return false;
  }
};

export const dbSaveNotification = async (notif: NotificationItem): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: ensureUuid(notif.id),
      user_id: normalizeUserId(notif.user_id),
      title: notif.title,
      message: notif.message,
      type: notif.type || 'system',
      link: notif.link || null,
      is_read: notif.is_read || false,
    };
    const { error } = await supabase.from('notifications').insert(payload);
    if (error) {
      console.error('Erreur dbSaveNotification Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception dbSaveNotification:', e);
    return false;
  }
};
