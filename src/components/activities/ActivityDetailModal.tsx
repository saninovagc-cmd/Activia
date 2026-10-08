import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ActivityStatus, PriorityLevel, Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { 
  X, 
  Calendar, 
  User, 
  Folder, 
  FileText, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  History, 
  Paperclip, 
  Plus, 
  Send,
  Building,
  AlertTriangle,
  Download,
  ExternalLink
} from 'lucide-react';

import { FileUploadZone } from '@/components/common/FileUploadZone';
import { CompressedFileResult } from '@/lib/fileCompressor';

interface ActivityDetailModalProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onEdit,
}) => {
  const router = useRouter();
  const { 
    currentUser, 
    updateActivityStatus, 
    addTask, 
    updateTaskStatus, 
    addCommentToActivity,
    addDocumentToActivity,
    auditLogs 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'workflow' | 'documents' | 'history' | 'comments'>('general');
  const [commentText, setCommentText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.id);
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('moyenne');
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [docUploadName, setDocUploadName] = useState('');
  const [docUploadFileResult, setDocUploadFileResult] = useState<CompressedFileResult | null>(null);

  if (!activity) return null;

  // Filter audit logs specifically for this activity
  const activityLogs = auditLogs.filter(
    l => l.entity_id === activity.code || l.entity_name === activity.title
  );

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentToActivity(activity.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({
        activity_id: activity.id,
        title: newTaskTitle.trim(),
        assignee_id: newTaskAssignee,
        priority: newTaskPriority,
        due_date: newTaskDue || activity.due_date,
        status: 'a_faire'
      });
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: FileText },
    { id: 'workflow', label: `Workflow & Tâches (${activity.tasks?.length || 0})`, icon: CheckCircle },
    { id: 'documents', label: `Documents (${activity.documents?.length || 0})`, icon: Paperclip },
    { id: 'history', label: 'Historique & Audit', icon: History },
    { id: 'comments', label: `Commentaires (${activity.comments?.length || 0})`, icon: MessageSquare },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                {activity.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">{activity.activity_type}</span>
              <Badge priority={activity.priority} />
              <Badge status={activity.status} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">{activity.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(activity)}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status quick switcher bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Changer de statut :</span>
            {(['a_faire', 'en_cours', 'en_attente', 'termine', 'en_retard'] as ActivityStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => updateActivityStatus(activity.id, st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activity.status === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Avancement :</span>
            <span className="font-bold text-slate-900">{activity.progress_percentage}%</span>
            <div className="w-24 bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${activity.progress_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs (5 Onglets conformes à la section 34) */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* TAB 1: Informations générales */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description de la mission</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {activity.description || 'Aucune description détaillée renseignée.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Responsable Pilote
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">{activity.manager_name}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Service / Département
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">{activity.department}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-blue-600" />
                    Dossier Associé
                  </span>
                  {activity.associated_folder ? (
                    <div
                      onClick={() => {
                        onClose();
                        router.push('/folders');
                      }}
                      className="cursor-pointer group flex items-center gap-1 mt-1 font-semibold text-blue-700"
                    >
                      <span className="group-hover:underline">{activity.associated_folder}</span>
                      <ExternalLink className="w-3 h-3 text-blue-500" />
                    </div>
                  ) : (
                    <p className="font-semibold text-slate-400 mt-1">Aucun dossier lié</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Date de début
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">{activity.start_date}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    Date limite d’échéance
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">{activity.due_date}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Date de réalisation
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {activity.completed_at || 'En cours de réalisation'}
                  </p>
                </div>
              </div>

              {activity.collaborators?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Collaborateurs Associés</h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.collaborators.map((c) => (
                      <span key={c.id} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full font-medium border border-blue-200">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Workflow & Tâches */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Jalons & Décomposition des Tâches</h4>
                  <p className="text-[11px] text-slate-500">Chaque tâche fait progresser l'avancement global de l'activité.</p>
                </div>
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une tâche
                </button>
              </div>

              {/* Add task inline form */}
              {showAddTask && (
                <form onSubmit={handleCreateTask} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                  <p className="font-semibold text-blue-900">Nouvelle étape ou tâche opérationnelle</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Intitulé de la tâche..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium">Priorité</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="basse">Basse</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="haute">Haute</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium">Échéance</label>
                      <input
                        type="date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Task list */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {activity.tasks?.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    Aucune tâche n'est encore rattachée à cette activité.
                  </div>
                ) : (
                  activity.tasks.map((task) => (
                    <div key={task.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateTaskStatus(task.id, task.status === 'termine' ? 'en_cours' : 'termine')}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            task.status === 'termine'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {task.status === 'termine' && <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <p className={`font-semibold ${task.status === 'termine' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>Assigné : {task.assignee_name}</span>
                            <span>•</span>
                            <span>Échéance : {task.due_date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge priority={task.priority} />
                        <Badge status={task.status as ActivityStatus} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pièces Justificatives et Rapports</h4>
                  <p className="text-[11px] text-slate-500">Stockage sécurisé dans le coffre numérique avec contrôle d&apos;intégrité.</p>
                </div>
                <button
                  onClick={() => setShowUploadDoc(!showUploadDoc)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showUploadDoc ? 'Fermer' : 'Joindre un fichier'}</span>
                </button>
              </div>

              {showUploadDoc && (
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                  <span className="font-bold text-slate-800 text-xs block">
                    Sélectionnez un document depuis vos dossiers (compression automatique) :
                  </span>

                  <FileUploadZone
                    label="Choisir la pièce justificative dans vos dossiers"
                    helperText="Scans de PV, rapports, fiches de mission. Les images scannées sont fortement allégées."
                    selectedResult={docUploadFileResult}
                    onFileReady={(res) => {
                      setDocUploadFileResult(res);
                      setDocUploadName(res.fileName);
                    }}
                    onClear={() => {
                      setDocUploadFileResult(null);
                      setDocUploadName('');
                    }}
                  />

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Intitulé du document (ex: Compte_Rendu_Mission_Terrain.pdf)"
                      value={docUploadName}
                      onChange={(e) => setDocUploadName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUploadDoc(false);
                          setDocUploadFileResult(null);
                          setDocUploadName('');
                        }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const finalName = docUploadName.trim() || docUploadFileResult?.fileName;
                          if (finalName) {
                            addDocumentToActivity(activity.id, {
                              name: finalName,
                              file_type: (docUploadFileResult?.fileType as any) || 'PDF',
                              size_kb: docUploadFileResult?.compressedSizeKb || 420,
                              original_size_kb: docUploadFileResult?.originalSizeKb,
                              data_url: docUploadFileResult?.dataUrl,
                            });
                            setDocUploadName('');
                            setDocUploadFileResult(null);
                            setShowUploadDoc(false);
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Enregistrer la pièce
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activity.documents?.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 col-span-2 border border-dashed border-slate-200 rounded-xl">
                    Aucun document joint pour le moment.
                  </div>
                ) : (
                  activity.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 truncate max-w-[200px]">{doc.name}</p>
                          <p className="text-[11px] text-slate-500">{doc.size_kb} KB • Déposé le {doc.uploaded_at}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadSampleDocument(doc.name, activity.code, 'Activité')}
                        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Historique & Audit */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Journal d’Audit de l’Activité</h4>
                <p className="text-[11px] text-slate-500">Historique complet et horodaté de toutes les modifications apportées.</p>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-2">
                {activityLogs.length === 0 ? (
                  <p className="text-slate-500 text-xs pl-4">Aucune trace d'audit enregistrée pour cette activité.</p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-xs" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{log.user_name} ({log.user_role})</span>
                          <span className="text-[10px] text-slate-400">{log.created_at}</span>
                        </div>
                        <p className="text-slate-700 mt-1">{log.details}</p>
                        {log.old_value && log.new_value && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Passage de <span className="font-mono text-slate-800">{log.old_value}</span> à <span className="font-mono text-emerald-700 font-bold">{log.new_value}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Commentaires */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Observations et Échanges Collaboratifs</h4>
                <p className="text-[11px] text-slate-500">Fil de discussion interne entre les agents et le chef de service.</p>
              </div>

              {/* New comment input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter une observation ou consigne..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publier
                </button>
              </form>

              {/* Comment list */}
              <div className="space-y-3 pt-2">
                {activity.comments?.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">Aucun commentaire rédigé pour le moment.</p>
                ) : (
                  activity.comments.map((com) => (
                    <div key={com.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{com.author_name}</span>
                        <span className="text-[10px] text-slate-400">{com.created_at}</span>
                      </div>
                      <p className="text-slate-700">{com.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

