// src/pages/Projects/ProjectDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MessageSquare, Star, Folder, PlaySquare, Code, Edit, Trash2, Eye, FileText, X, Search, CheckSquare, ChevronUp, ChevronDown, User, Calendar, AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';
import CustomStatusDropdown from '../../components/portfolio/CustomStatusDropdown';
import CustomSelect from '../../components/common/CustomSelect'; 

const taskStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'post-poned', label: 'Postponed' },
  { value: 'completed', label: 'Completed' },
];

const visibilityOptions = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' }
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects, courses, tasks, addTask, updateTask, deleteTask, users,
    updateProject, deleteProject, rateProject, projectComments, addProjectComment, updateProjectComment, deleteProjectComment, 
    taskComments, addTaskComment, updateTaskComment, deleteTaskComment,
    invitations, sendInvitation, deleteInvitation,
    thesisDrafts, uploadThesisDraft, setFinalDraft, showToast, flagProject, submitAppeal, confirmAction
  } = useData();
  const { currentUser } = useAuth();

  const project = projects.find(p => p.id === id);
  const course = courses.find(c => c.id === project?.courseId);

  // States
  const [newProjComment, setNewProjComment] = useState('');
  const [newTaskCommentText, setNewTaskCommentText] = useState({});
  const [activeTaskComment, setActiveTaskComment] = useState(null);
  
  const [editingProjCommentId, setEditingProjCommentId] = useState(null);
  const [editProjCommentText, setEditProjCommentText] = useState('');
  
  // --- FIX: Task Comment Edit States ---
  const [editingTaskCommentId, setEditingTaskCommentId] = useState(null);
  const [editTaskCommentText, setEditTaskCommentText] = useState('');

  const [newDraftName, setNewDraftName] = useState('');
  const [newDraftFile, setNewDraftFile] = useState(null); 
  const [viewingPdf, setViewingPdf] = useState(null);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  
  // Task States
  const todayDateStr = new Date().toISOString().split('T')[0]; 
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState(todayDateStr);
  const [newTaskAssignee, setNewTaskAssignee] = useState(project?.creatorId || '');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});
  
  // Project Edit States
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [projFormData, setProjFormData] = useState({
    title: project?.title || '', courseId: project?.courseId || '',
    githubLink: project?.githubLink || '', languages: project?.languages?.join(', ') || '',
    demoVideo: project?.demoVideo || '', visibility: project?.visibility || 'private'
  });

  // Flag & Appeal States
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReasonText, setFlagReasonText] = useState('');
  const [appealText, setAppealText] = useState('');

  // Derived Data
  const ratings = project?.ratings || [];
  const totalRatings = ratings.length;
  const averageScore = totalRatings > 0 ? (ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings).toFixed(1) : 0;
  const myRating = ratings.find(r => r.instructorId === currentUser?.id)?.score || 0;

  const isCreator = currentUser?.id === project?.creatorId;
  const isAcceptedCollaborator = invitations?.some(inv => inv.projectId === id && inv.receiverId === currentUser?.id && inv.status === 'accepted');
  const isCourseInstructor = currentUser?.role === 'Course Instructor' && currentUser?.linkedCourses?.includes(course?.code);
  const canManageProject = isCreator || isAcceptedCollaborator;
  const canViewFeedback = canManageProject || isCourseInstructor || currentUser?.role === 'Administrator';

  const projectTasks = tasks.filter(t => t.projectId === id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const projComments = projectComments.filter(c => c.projectId === id);
  const projectDrafts = thesisDrafts?.filter(d => d.projectId === id) || [];
  const hasFinalDraft = projectDrafts.some(d => d.isFinal);
  const visibleDrafts = projectDrafts.filter(draft => {
    if (canManageProject) return true; 
    if (hasFinalDraft) return draft.isFinal; 
    return true; 
  });

  const teamMembers = [
    users.find(u => u.id === project?.creatorId),
    ...invitations.filter(inv => inv.projectId === id && inv.status === 'accepted').map(inv => users.find(u => u.id === inv.receiverId))
  ].filter(Boolean);

  const courseOptions = courses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }));
  const assigneeOptions = teamMembers.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }));

  const availableUsersToInvite = users.filter(u => {
    if (u.id === currentUser?.id) return false;
    if (u.role !== 'Student' && u.role !== 'Course Instructor') return false;
    if (inviteSearchQuery) {
      const query = inviteSearchQuery.toLowerCase();
      return `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    }
    return false;
  });

  useEffect(() => {
    if (project && !newTaskAssignee) setNewTaskAssignee(project.creatorId);
  }, [project]);

  if (!project) return <div className="p-8 text-center text-gray-500">Project not found.</div>;

  const handleDraftUploadChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewDraftName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setNewDraftFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDraftSubmit = () => {
    if (newDraftName && newDraftFile) {
      uploadThesisDraft(project.id, newDraftName, newDraftFile);
      setNewDraftName('');
      setNewDraftFile(null);
      if (showToast) showToast("Thesis draft uploaded successfully!");
    } else {
      if (showToast) showToast("Please select a file to upload.", "error");
    }
  };

  const handleViewPdf = (pdfData) => {
    if (!pdfData) return;
    if (pdfData.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Parts = pdfData.split(',');
        const binaryString = window.atob(base64Parts[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
        setViewingPdf(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
      } catch (err) { setViewingPdf(pdfData); }
    } else { setViewingPdf(pdfData); }
  };

  const handleUpdateProject = (e) => {
    e.preventDefault();
    updateProject(project.id, { ...projFormData, languages: projFormData.languages.split(',').map(l => l.trim()) });
    setIsEditingProj(false);
    if (showToast) showToast("Project updated successfully!");
  };

  const handleDeleteProject = () => {
    confirmAction("Are you sure you want to completely delete this project? This action cannot be undone.", "Delete Project", () => {
        deleteProject(project.id); navigate('/projects'); if (showToast) showToast("Project deleted.", "error");
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    const finalAssignee = course?.code === 'BP' ? project.creatorId : (parseInt(newTaskAssignee) || project.creatorId);
    addTask({
      projectId: project.id, description: newTaskDesc, assigneeId: finalAssignee,
      status: 'pending', deadline: newTaskDeadline,
      order: projectTasks.length > 0 ? Math.max(...projectTasks.map(t => t.order || 0)) + 1 : 1
    });
    setNewTaskDesc('');
    setNewTaskDeadline(todayDateStr);
    if (showToast) showToast("Task created successfully!");
  };

  const handleSaveEditTask = () => {
    updateTask(editingTaskId, editTaskData);
    setEditingTaskId(null);
    if (showToast) showToast("Task updated successfully!");
  };

  const moveTask = (task, direction) => {
    const idx = projectTasks.findIndex(t => t.id === task.id);
    if (direction === 'up' && idx > 0) {
      const prevTask = projectTasks[idx - 1];
      const taskOrder = task.order !== undefined ? task.order : idx + 1;
      const prevTaskOrder = prevTask.order !== undefined ? prevTask.order : idx;
      updateTask(task.id, { order: prevTaskOrder });
      updateTask(prevTask.id, { order: taskOrder });
    } else if (direction === 'down' && idx < projectTasks.length - 1) {
      const nextTask = projectTasks[idx + 1];
      const taskOrder = task.order !== undefined ? task.order : idx + 1;
      const nextTaskOrder = nextTask.order !== undefined ? nextTask.order : idx + 2;
      updateTask(task.id, { order: nextTaskOrder });
      updateTask(nextTask.id, { order: taskOrder });
    }
  };

  const handleAddProjComment = (e) => {
    e.preventDefault();
    if (!newProjComment.trim()) return;
    addProjectComment({ projectId: project.id, instructorId: currentUser.id, text: newProjComment });
    setNewProjComment('');
  };

  const handleSaveEditProjComment = (commentId) => {
    if (!editProjCommentText.trim()) return;
    updateProjectComment(commentId, editProjCommentText);
    setEditingProjCommentId(null);
    if (showToast) showToast("Feedback updated!");
  };

  const handleAddTaskComment = (taskId) => {
    if (!newTaskCommentText[taskId]?.trim()) return;
    addTaskComment({ taskId, instructorId: currentUser.id, text: newTaskCommentText[taskId] });
    setNewTaskCommentText({ ...newTaskCommentText, [taskId]: '' });
    setActiveTaskComment(null);
  };

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : 'User';
  };

  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!flagReasonText.trim()) return;
    flagProject(project.id, flagReasonText);
    setShowFlagModal(false);
    setFlagReasonText('');
  };

  const handleAppealSubmit = (e) => {
    e.preventDefault();
    if (!appealText.trim()) return;
    submitAppeal(project.id, appealText);
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm text-gray-500 hover:text-primary mb-4 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-primary">{project.title}</h2>
              {project.status === 'deactivated' && <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">DEACTIVATED</span>}
            </div>
            <p className="text-gray-500 font-medium">{course?.name} • Created {project.creationDate}</p>

            <div className="flex gap-2 mt-4">
              {isCreator && (
                <>
                  <button onClick={() => setIsEditingProj(true)} className="p-2 text-gray-400 hover:text-primary hover:scale-110 hover:bg-gray-50 rounded-lg transition-all" title="Edit Project"><Edit className="w-5 h-5" /></button>
                  <button onClick={handleDeleteProject} className="p-2 text-gray-400 hover:text-red-600 hover:scale-110 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-5 h-5" /></button>
                </>
              )}
              {(currentUser?.role === 'Administrator' || currentUser?.role === 'Course Instructor') && !project.isFlagged && (
                <button onClick={() => setShowFlagModal(true)} className="flex items-center text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                  <Flag className="w-3.5 h-3.5 mr-1" /> Flag Project
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase ${project.visibility === 'public' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{project.visibility}</span>
            <div className="flex items-center gap-1.5 mt-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm font-bold text-gray-800">{averageScore > 0 ? averageScore : '0.0'}</span>
              <div className="relative inline-flex">
                <div className="flex">{[1, 2, 3, 4, 5].map((star) => <Star key={`empty-${star}`} className="w-4 h-4 text-gray-200" />)}</div>
                <div className="flex absolute top-0 left-0 overflow-hidden" style={{ width: `${(averageScore / 5) * 100}%` }}>
                  {[1, 2, 3, 4, 5].map((star) => <Star key={`gold-${star}`} className="w-4 h-4 text-yellow-500 fill-current shrink-0" />)}
                </div>
              </div>
              <span className="text-xs text-gray-500 font-medium ml-1">({totalRatings})</span>
            </div>
          </div>
        </div>
      </div>

      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-2 flex items-center text-red-600"><Flag className="w-5 h-5 mr-2"/> Flag Project</h3>
            <p className="text-sm text-gray-500 mb-4">Flagging this project will automatically deactivate it. Please provide a reason (e.g., plagiarism).</p>
            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <textarea rows="3" required placeholder="Reason for flagging..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400" value={flagReasonText} onChange={e => setFlagReasonText(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowFlagModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">Submit Flag</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditingProj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Edit Project</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Project Title</label><input type="text" required className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.title} onChange={e => setProjFormData({ ...projFormData, title: e.target.value })} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <CustomSelect value={projFormData.courseId} onChange={(val) => setProjFormData({ ...projFormData, courseId: parseInt(val) })} options={courseOptions} className="w-full" />
              </div>
              <div><label className="block text-sm font-medium mb-1">GitHub Link</label><input type="url" className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.githubLink} onChange={e => setProjFormData({ ...projFormData, githubLink: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Demo Video Link</label><input type="url" className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.demoVideo} onChange={e => setProjFormData({ ...projFormData, demoVideo: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Languages (comma separated)</label><input type="text" required className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.languages} onChange={e => setProjFormData({ ...projFormData, languages: e.target.value })} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <CustomSelect value={projFormData.visibility} onChange={(val) => setProjFormData({ ...projFormData, visibility: val })} options={visibilityOptions} className="w-full" />
              </div>
              <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsEditingProj(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-gray-800">Save</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {project.isFlagged && isCreator && (
            <div className={`p-5 rounded-2xl shadow-sm border ${project.appealMessage ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`${project.appealMessage ? 'text-yellow-700' : 'text-red-700'} font-bold flex items-center text-lg`}>
                <AlertTriangle className="w-5 h-5 mr-2" /> 
                {project.appealMessage ? 'Project Flagged (Under Appeal Review)' : 'Project Flagged & Deactivated'}
              </h3>
              <p className={`text-sm mt-1 mb-4 ${project.appealMessage ? 'text-yellow-600' : 'text-red-600'}`}>
                <strong>Reason:</strong> {project.flagReason}
              </p>
              {!project.appealMessage ? (
                <form onSubmit={handleAppealSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input type="text" placeholder="Write a short appeal message to explain your situation..." required className="flex-1 px-3 py-2 text-sm border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-400" value={appealText} onChange={e => setAppealText(e.target.value)} />
                  <button type="submit" className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 whitespace-nowrap shadow-sm">Submit Appeal</button>
                </form>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-yellow-100">
                  <p className="text-sm font-bold text-yellow-700 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Appeal submitted!</p>
                  <p className="text-xs text-gray-600 mt-1">"{project.appealMessage}"</p>
                  <p className="text-xs text-gray-500 mt-1 italic">Your project is temporarily active while awaiting administrator review.</p>
                </div>
              )}
            </div>
          )}

          {course?.code === 'BP' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-purple-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary flex items-center"><Folder className="w-5 h-5 mr-2 text-purple-600" /> Thesis Drafts</h3>
                {hasFinalDraft && !canManageProject && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">FINAL DRAFT ONLY</span>}
              </div>
              <div className="space-y-3 mb-4">
                {visibleDrafts.length === 0 ? <p className="text-sm text-gray-500">No drafts available.</p> : null}
                {visibleDrafts.map(draft => (
                  <div key={draft.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3 ${draft.isFinal ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center overflow-hidden">
                      <FileText className={`w-5 h-5 mr-3 shrink-0 ${draft.isFinal ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="truncate"><p className="text-sm font-bold text-primary truncate">{draft.name}</p><p className="text-xs text-gray-500">Uploaded: {draft.date}</p></div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {draft.isFinal && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Final Draft</span>}
                      <button onClick={() => handleViewPdf(draft.fileData || '#')} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all" title="View"><Eye className="w-4 h-4" /></button>
                      {isCreator && !draft.isFinal && <button onClick={() => setFinalDraft(project.id, draft.id)} className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1.5 rounded hover:bg-purple-100 transition-colors">Mark Final</button>}
                    </div>
                  </div>
                ))}
              </div>
              {canManageProject && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-4 border-t border-purple-50">
                  <input type="file" accept=".pdf,.doc,.docx" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" onChange={handleDraftUploadChange} />
                  <button onClick={handleUploadDraftSubmit} className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">Upload Draft</button>
                </div>
              )}
            </div>
          )}

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center"><CheckSquare className="w-5 h-5 mr-2 text-blue-500" /> Task Management</h3>

            <div className="space-y-4 mb-6">
              {projectTasks.length === 0 && <p className="text-sm text-gray-500 italic">No tasks created yet.</p>}

              {projectTasks.map((task, index) => {
                const tComments = taskComments.filter(c => c.taskId === task.id);
                const canEditStatus = isCreator || currentUser?.id === task.assigneeId;

                return editingTaskId === task.id ? (
                  <form key={task.id} onSubmit={(e) => { e.preventDefault(); handleSaveEditTask(); }} className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-3 shadow-inner">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Edit Task</h4>
                    <input type="text" autoFocus value={editTaskData.description} onChange={e => setEditTaskData({ ...editTaskData, description: e.target.value })} className="border border-blue-200 p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-blue-400" />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="date" min={todayDateStr} value={editTaskData.deadline} onChange={e => setEditTaskData({ ...editTaskData, deadline: e.target.value })} className="border border-blue-200 p-2 rounded-lg text-sm flex-1 outline-none" />

                      {course?.code !== 'BP' && (
                        <CustomSelect 
                          value={editTaskData.assigneeId} 
                          onChange={(val) => setEditTaskData({ ...editTaskData, assigneeId: parseInt(val) })} 
                          options={assigneeOptions} 
                          className="flex-1 bg-white border-blue-200" 
                        />
                      )}
                      
                      <CustomStatusDropdown 
                        status={editTaskData.status}
                        options={taskStatusOptions}
                        onChange={(e) => setEditTaskData({ ...editTaskData, status: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <button type="button" onClick={() => setEditingTaskId(null)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div key={task.id} className="border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white transition-colors rounded-t-xl">
                      <div className="flex items-center gap-3 flex-1">
                        {isCreator && (
                          <div className="flex flex-col mr-1 items-center justify-center text-gray-300">
                            <button disabled={index === 0} onClick={() => moveTask(task, 'up')} className="hover:text-primary disabled:opacity-30 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                            <button disabled={index === projectTasks.length - 1} onClick={() => moveTask(task, 'down')} className="hover:text-primary disabled:opacity-30 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                          </div>
                        )}

                        <CustomStatusDropdown 
                          status={task.status}
                          options={taskStatusOptions}
                          disabled={!canEditStatus}
                          onChange={(e) => updateTask(task.id, { status: e.target.value })}
                        />

                        <div className="flex flex-col ml-1">
                          <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-primary'}`}>{task.description}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Assigned to: <span className="text-blue-600">{getUserName(task.assigneeId)}</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">{task.deadline}</span>

                        {isCreator && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingTaskId(task.id); setEditTaskData(task); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:scale-110 rounded transition-all" title="Edit Task"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => confirmAction("Are you sure?", "Delete", () => deleteTask(task.id))} className="p-1.5 text-gray-400 hover:text-red-600 hover:scale-110 rounded transition-all" title="Delete Task"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}

                        {isCourseInstructor && (
                          <button onClick={() => setActiveTaskComment(activeTaskComment === task.id ? null : task.id)} className="text-gray-400 hover:text-primary"><MessageSquare className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>

                    {canViewFeedback && tComments.length > 0 && (
                      <div className="p-4 bg-white border-t border-gray-50 space-y-2 rounded-b-xl">
                        {tComments.map(c => (
                          <div key={c.id} className="text-xs bg-blue-50/50 border border-blue-100/50 p-3 rounded-lg text-blue-900 group relative">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold">{getUserName(c.instructorId)} <span className="text-[10px] font-normal text-gray-500 ml-2">{c.date}</span></span>
                              {c.instructorId === currentUser?.id && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingTaskCommentId(c.id); setEditTaskCommentText(c.text); }} className="p-1 text-gray-400 hover:text-blue-600" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => confirmAction("Delete this feedback?", "Delete", () => deleteTaskComment(c.id))} className="p-1 text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              )}
                            </div>
                            
                            {editingTaskCommentId === c.id ? (
                              <form onSubmit={(e) => { e.preventDefault(); updateTaskComment(c.id, editTaskCommentText); setEditingTaskCommentId(null); }} className="flex gap-2 mt-2">
                                <input autoFocus type="text" className="flex-1 px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none" value={editTaskCommentText} onChange={e => setEditTaskCommentText(e.target.value)} />
                                <button type="button" onClick={() => setEditingTaskCommentId(null)} className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                              </form>
                            ) : (
                              <p className="text-gray-700 leading-relaxed">{c.text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isCourseInstructor && activeTaskComment === task.id && (
                      <form onSubmit={(e) => { e.preventDefault(); handleAddTaskComment(task.id); }} className="p-3 bg-white border-t border-gray-50 flex gap-2 rounded-b-xl">
                        <input autoFocus type="text" placeholder="Add feedback on this task... (Press Enter to save)" className="flex-1 text-xs px-3 py-2 border rounded-lg focus:ring-primary outline-none" value={newTaskCommentText[task.id] || ''} onChange={(e) => setNewTaskCommentText({ ...newTaskCommentText, [task.id]: e.target.value })} />
                        <button type="submit" className="text-xs bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">Save</button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>

            {isCreator && (
              <form onSubmit={handleAddTask} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 mt-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Create New Task</h4>
                <input type="text" required placeholder="Short task description (1 line)..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="date" min={todayDateStr} required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary text-gray-600" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />

                  {course?.code !== 'BP' ? (
                    <CustomSelect value={newTaskAssignee} onChange={(val) => setNewTaskAssignee(val)} options={[{ value: '', label: 'Assign to...' }, ...assigneeOptions]} className="flex-1 bg-white border-gray-300" />
                  ) : (
                    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 flex items-center">
                      Auto-assigned to Creator (BP)
                    </div>
                  )}

                  <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">Add Task</button>
                </div>
              </form>
            )}
          </div>

          {canViewFeedback && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-4">Instructor Feedback</h3>
              <div className="space-y-4 mb-4">
                {projComments.length === 0 ? <p className="text-sm text-gray-500">No feedback provided yet.</p> : null}
                {projComments.map(c => (
                  <div key={c.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-primary">
                        {getUserName(c.instructorId)} <span className="text-xs font-normal text-gray-400 ml-2">{c.date}</span>
                      </p>

                      {c.instructorId === currentUser?.id && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingProjCommentId(c.id); setEditProjCommentText(c.text); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:scale-110 rounded transition-all" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => confirmAction("Are you sure?", "Delete", () => deleteProjectComment(c.id))} className="p-1.5 text-gray-400 hover:text-red-600 hover:scale-110 rounded transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingProjCommentId === c.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleSaveEditProjComment(c.id); }} className="flex flex-col sm:flex-row gap-2 mt-2">
                        <input type="text" className="flex-1 px-3 py-1 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-sm outline-none" value={editProjCommentText} onChange={e => setEditProjCommentText(e.target.value)} autoFocus />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setEditingProjCommentId(null)} className="px-3 py-1 bg-white border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Save</button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-600">{c.text}</p>
                    )}
                  </div>
                ))}
              </div>

              {isCourseInstructor && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700">Leave a Review</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 mr-2">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => rateProject(project.id, currentUser.id, star)} className={`${star <= myRating ? 'text-yellow-500' : 'text-gray-300'} hover:scale-110 transition-transform`}>
                          <Star className={`w-5 h-5 ${star <= myRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleAddProjComment}>
                    <textarea rows="3" placeholder="Write overall project feedback... (Press Enter to save)" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-2 resize-none" value={newProjComment} onChange={(e) => setNewProjComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddProjComment(e); } }}></textarea>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition-colors shadow-sm">Post Feedback</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4">Project Details</h3>
            <div className="space-y-6">
              {project.githubLink && (<div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Repository</p><a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-gray-900 text-white w-full py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"><Code className="w-4 h-4" /> View Source Code</a></div>)}
              {project.demoVideo && (<div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Preview</p><a href={project.demoVideo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 w-full py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"><PlaySquare className="w-4 h-4" /> Watch Demo Video</a></div>)}
              <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Languages Used</p><div className="flex flex-wrap gap-2">{project.languages?.map(lang => <span key={lang} className="px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg text-xs">{lang}</span>)}</div></div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4">Manage Team</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src={users.find(u => u.id === project.creatorId)?.profilePic} alt="Creator" /></div><div><p className="text-sm font-bold text-primary">{users.find(u => u.id === project.creatorId)?.firstName}</p><p className="text-xs text-gray-500">Creator</p></div></div>
              </div>
              {invitations.filter(inv => inv.projectId === project.id && inv.status !== 'info').map(inv => {
                const receiver = users.find(u => u.id === inv.receiverId);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3"><img src={receiver?.profilePic} className="w-8 h-8 rounded-full" alt="" /><div><p className="text-sm font-bold text-primary">{receiver?.firstName}</p><p className={`text-xs capitalize ${inv.status === 'accepted' ? 'text-green-600' : inv.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{inv.status}</p></div></div>
                    {isCreator && <button onClick={() => confirmAction(`Remove ${receiver?.firstName}?`, "Remove", () => deleteInvitation(inv.id))} className="text-gray-400 hover:text-red-500 text-xs font-medium">Remove</button>}
                  </div>
                );
              })}
            </div>
            {isCreator && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-primary mb-2">Invite User</p>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input type="text" placeholder="Search by name or email..." className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-primary" value={inviteSearchQuery} onChange={(e) => setInviteSearchQuery(e.target.value)} />
                </div>
                {inviteSearchQuery.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg shadow-sm bg-white mt-1">
                    {availableUsersToInvite.length > 0 ? (
                      availableUsersToInvite.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { sendInvitation(project.id, currentUser.id, u.id); setInviteSearchQuery(''); }}>
                          <div className="flex items-center gap-2"><img src={u.profilePic} className="w-6 h-6 rounded-full" alt="" /><div className="overflow-hidden"><p className="text-xs font-bold text-primary truncate">{u.firstName} {u.lastName}</p><p className="text-[10px] text-gray-500 truncate">{u.email}</p></div></div><span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase font-bold tracking-wider ml-2">Invite</span>
                        </div>
                      ))
                    ) : (<p className="p-3 text-xs text-center text-gray-500">No matching users found.</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;