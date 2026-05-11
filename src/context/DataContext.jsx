// src/context/DataContext.jsx
import { createContext, useState, useContext } from 'react';
import {
  initialUsers, initialCourses, initialProjects, initialInternships,
  initialTasks, initialApplications, initialProjectComments,
  initialTaskComments, initialInvitations, initialFavorites,
  initialMessages
} from '../assets/dummyData';

// --- FIXED: Moved getNow OUTSIDE the component so it never throws a ReferenceError ---
export function getNow() {
  const d = new Date();
  return `${d.toLocaleDateString('en-CA')} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

const DataContext = createContext();
export const useData = () => useContext(DataContext);

const initialThesisDrafts = [
  { id: "d1", projectId: "p1", name: "Chapter 1-3 Review.pdf", date: "2026-04-01", isFinal: false }
];

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [courses, setCourses] = useState(initialCourses);
  const [projects, setProjects] = useState(initialProjects);
  const [internships, setInternships] = useState(initialInternships);
  const [tasks, setTasks] = useState(initialTasks);
  const [applications, setApplications] = useState(initialApplications);
  const [projectComments, setProjectComments] = useState(initialProjectComments);
  const [taskComments, setTaskComments] = useState(initialTaskComments);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [messages, setMessages] = useState(initialMessages);
  const [thesisDrafts, setThesisDrafts] = useState(initialThesisDrafts);

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmAction = (message, confirmText = "Confirm", onConfirmCallback) => {
    setConfirmDialog({
      message, confirmText,
      onConfirm: () => { onConfirmCallback(); setConfirmDialog(null); },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const addUser = (newUser) => setUsers([...users, { ...newUser, id: users.length + 1 }]);
  const updateUserStatus = (userId, newStatus) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  const updateUser = (userId, data) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  const toggleUserActiveStatus = (userId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: (u.status || 'active') === 'active' ? 'deactivated' : 'active' } : u));
  const resetPassword = (email, newPassword) => setUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));

  const addCourse = (code, name) => setCourses([...courses, { id: `c${courses.length + 1}`, code, name }]);
  const updateCourse = (id, newCode, newName) => setCourses(courses.map(c => c.id === id ? { ...c, code: newCode, name: newName } : c));
  
  // Updated deleteCourse to use prev mapping
  const deleteCourse = (id) => {
    const courseToDelete = courses.find(c => c.id === id);
    if (!courseToDelete) return;
    const deletedCourseCode = courseToDelete.code;

    setCourses(prev => prev.filter(c => c.id !== id));
    setUsers(prev => prev.map(user => {
      if (user.role === 'Course Instructor' && user.linkedCourses?.includes(deletedCourseCode)) {
        return { ...user, linkedCourses: user.linkedCourses.filter(code => code !== deletedCourseCode) };
      }
      return user;
    }));
    setInvitations(prev => prev.filter(inv => !(inv.type === 'course_request' && inv.courseCode === deletedCourseCode)));
    if (showToast) showToast(`Course ${deletedCourseCode} deleted.`, "info");
  };

  const addProject = (p) => {
    const now = new Date();
    setProjects(prev => [...prev, {
      ...p, id: `p${prev.length + 1}`, creationDate: now.toLocaleDateString('en-CA'),
      timestamp: now.getTime(), status: 'active', rating: 0, ratings: []
    }]);
  };
  const updateProject = (id, updatedData) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  const deleteProject = (id) => setProjects(prev => prev.filter(p => p.id !== id));

  const rateProject = (projectId, instructorId, score) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const currentRatings = p.ratings || [];
        const updatedRatings = [...currentRatings.filter(r => r.instructorId !== instructorId), { instructorId, score }];
        const averageRating = updatedRatings.reduce((sum, r) => sum + r.score, 0) / updatedRatings.length;
        return { ...p, ratings: updatedRatings, rating: Math.round(averageRating) };
      }
      return p;
    }));
  };

  const flagProject = (projectId, reason) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isFlagged: true, flagReason: reason, status: 'deactivated' } : p));
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const admin = users.find(u => u.role === 'Administrator') || { id: 3 };
      setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'project_flagged', projectId: projectId, senderId: admin.id, receiverId: project.creatorId, status: 'info', read: false, text: reason, time: getNow() }]);
    }
    if (showToast) showToast("Project flagged and deactivated.", "error");
  };

  const submitAppeal = (id, msg) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, appealMessage: msg, status: 'active' } : p));
    if (showToast) showToast("Appeal submitted.", "success");
  };

  const resolveFlag = (id, deactivate) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isFlagged: false, status: deactivate ? 'deactivated' : 'active', flagReason: null, appealMessage: null } : p));
    if (!deactivate) {
      const project = projects.find(p => p.id === id);
      if (project) {
        const admin = users.find(u => u.role === 'Administrator') || { id: 3 };
        setInvitations(prev => [...prev, { id: `notif${Date.now()}_${Math.random()}`, type: 'project_reactivated', projectId: project.id, senderId: admin.id, receiverId: project.creatorId, status: 'info', read: false, time: getNow() }]);
      }
    }
    if (showToast) showToast(`Project ${deactivate ? 'deactivated' : 'reactivated'}.`, deactivate ? 'error' : 'success');
  };

  const toggleProjectStatus = (id) => setProjects(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'deactivated' : 'active' } : p));

  const uploadThesisDraft = (projectId, name, fileData) => {
    setThesisDrafts(prev => [...prev, { id: `d${Date.now()}`, projectId, name, fileData, date: new Date().toLocaleDateString('en-CA'), isFinal: false }]);
  };
  const setFinalDraft = (projectId, draftId) => setThesisDrafts(prev => prev.map(d => d.projectId === projectId ? { ...d, isFinal: d.id === draftId } : d));

  const addTask = (t) => {
    const newId = `t${Date.now()}`;
    setTasks(prev => [...prev, { ...t, id: newId }]);
    const project = projects.find(p => p.id === t.projectId);
    if (project && t.assigneeId !== project.creatorId) {
      setInvitations(prev => [...prev, {
        id: `notif${Date.now()}_task`, type: 'new_task', projectId: t.projectId, taskId: newId,
        senderId: project.creatorId, receiverId: t.assigneeId, status: 'info', read: false, text: t.description, time: getNow()
      }]);
    }
  };

  const updateTask = (id, updatedData) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  const toggleTaskStatus = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t));

  const addTaskComment = (c) => {
    setTaskComments(prev => [...prev, { ...c, id: `tc${Date.now()}`, date: new Date().toLocaleDateString('en-CA') }]);
    const task = tasks.find(t => t.id === c.taskId);
    if (task) {
      const project = projects.find(p => p.id === task.projectId);
      const receivers = [...new Set([task.assigneeId, project?.creatorId])].filter(Boolean);
      const newNotifs = receivers.map(rId => ({
        id: `notif${Date.now()}_${Math.random()}`, type: 'feedback_task', projectId: task.projectId, taskId: task.id,
        senderId: c.instructorId, receiverId: rId, status: 'info', read: false, text: c.text, time: getNow()
      }));
      setInvitations(prev => [...prev, ...newNotifs]);
    }
  };

  const updateTaskComment = (id, newText) => setTaskComments(prev => prev.map(c => c.id === id ? { ...c, text: newText } : c));
  const deleteTaskComment = (id) => setTaskComments(prev => prev.filter(c => c.id !== id));

  const addProjectComment = (c) => {
    setProjectComments(prev => [...prev, { ...c, id: `pc${Date.now()}`, date: new Date().toLocaleDateString('en-CA') }]);
    const project = projects.find(p => p.id === c.projectId);
    if (project) {
      const acceptedInvites = invitations.filter(inv => inv.projectId === project.id && inv.status === 'accepted');
      const receivers = [...new Set([project.creatorId, ...acceptedInvites.map(inv => inv.receiverId)])];
      const newNotifs = receivers.map(rId => ({
        id: `notif${Date.now()}_${Math.random()}`, type: 'feedback_project', projectId: project.id,
        senderId: c.instructorId, receiverId: rId, status: 'info', read: false, text: c.text, time: getNow()
      }));
      setInvitations(prev => [...prev, ...newNotifs]);
    }
  };
  const updateProjectComment = (id, newText) => setProjectComments(prev => prev.map(c => c.id === id ? { ...c, text: newText } : c));
  const deleteProjectComment = (id) => setProjectComments(prev => prev.filter(c => c.id !== id));

  const addInternship = (i) => {
    setInternships(prev => [...prev, { ...i, id: `i${Date.now()}`, postedDate: new Date().toLocaleDateString('en-CA'), status: 'hiring', isArchived: false }]);
    if (showToast) showToast("Internship posted successfully!");
  };
  const updateInternship = (id, data) => setInternships(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteInternship = (id) => setInternships(prev => prev.filter(i => i.id !== id));
  const toggleInternshipStatus = (id) => setInternships(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'hiring' ? 'filled' : 'hiring' } : i));
  const toggleArchiveInternship = (id) => setInternships(prev => prev.map(i => i.id === id ? { ...i, isArchived: !i.isArchived } : i));

  const addApplication = (a) => {
    setApplications(prev => [...prev, { ...a, id: `app${Date.now()}`, status: 'pending' }]);
    const internship = internships.find(i => i.id === a.internshipId);
    const employer = users.find(u => u.companyName === internship?.companyName);
    if (employer) {
      setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'new_application', internshipId: internship.id, senderId: a.studentId, receiverId: employer.id, status: 'info', read: false, time: getNow() }]);
    }
  };
  
  const updateApplicationStatus = (id, s) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: s } : a));
    if (s === 'accepted' || s === 'rejected') {
      const app = applications.find(a => a.id === id);
      if (app) {
        const internship = internships.find(i => i.id === app.internshipId);
        const employer = users.find(u => u.companyName === internship?.companyName);
        setInvitations(prev => [...prev, { id: `notif${Date.now()}_${Math.random()}`, type: 'application_update', internshipId: internship?.id, senderId: employer?.id || 3, receiverId: app.studentId, status: 'info', appStatus: s, read: false, time: getNow() }]);
      }
    }
  };

  const sendInvitation = (pId, sId, rId) => {
    const alreadyInvited = invitations.some(i => i.projectId === pId && i.receiverId === rId);
    if (alreadyInvited) return;
    setInvitations(prev => [...prev, { id: `inv${Date.now()}`, projectId: pId, senderId: sId, receiverId: rId, status: 'pending', read: false, time: getNow() }]);
  };

  const updateInvitationStatus = (id, s) => setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: s, read: true } : i));
  const deleteInvitation = (id) => setInvitations(prev => prev.filter(i => i.id !== id));
  const toggleNotificationRead = (id) => setInvitations(prev => prev.map(i => i.id === id ? { ...i, read: !i.read } : i));

  // --- FIXED: ROCK-SOLID LINK/UNLINK LOGIC ---
  const sendCourseRequest = (senderId, courseCodeOrId, actionType) => {
    // Fail-safe: Detects if your UI passed an ID (c1) instead of Code (CSEN701) and fixes it automatically
    const courseObj = courses.find(c => c.code === courseCodeOrId || c.id === courseCodeOrId);
    const actualCode = courseObj ? courseObj.code : courseCodeOrId;

    const alreadyRequested = invitations.some(i => i.type === 'course_request' && i.senderId === senderId && i.courseCode === actualCode && i.status === 'pending');
    if (alreadyRequested) {
      if (showToast) showToast(`You already have a pending ${actionType} request.`, "error");
      return;
    }
    const admin = users.find(u => u.role === 'Administrator');
    if (!admin) return;
    
    setInvitations(prev => [...prev, { id: `req${Date.now()}`, type: 'course_request', actionType, courseCode: actualCode, senderId, receiverId: admin.id, status: 'pending', read: false, time: getNow() }]);
    if (showToast) showToast(`${actionType === 'link' ? 'Link' : 'Unlink'} request sent!`);
  };

  const resolveCourseRequest = (reqId, newStatus) => {
    const req = invitations.find(i => i.id === reqId);
    if (!req) return;
    
    // 1. Safely mark notification as accepted/rejected
    setInvitations(prev => prev.map(i => i.id === reqId ? { ...i, status: newStatus, read: true } : i));

    // 2. If accepted, use the functional state update (prevUsers) to prevent memory closure bugs
    if (newStatus === 'accepted') {
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === req.senderId) {
          let updatedCourses = user.linkedCourses ? [...user.linkedCourses] : [];
          if (req.actionType === 'link' && !updatedCourses.includes(req.courseCode)) {
            updatedCourses.push(req.courseCode);
          } else if (req.actionType === 'unlink') {
            updatedCourses = updatedCourses.filter(c => c !== req.courseCode);
          }
          return { ...user, linkedCourses: updatedCourses };
        }
        return user;
      }));
    }
  };

  const toggleFavorite = (userId, itemId, type) => {
    const existing = favorites.find(f => f.userId === userId && f.itemId === itemId);
    if (existing) setFavorites(prev => prev.filter(f => f.id !== existing.id));
    else setFavorites(prev => [...prev, { id: `fav${Date.now()}`, userId, itemId, type }]);
  };

  const sendMessage = (senderId, receiverId, text) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-CA')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, senderId, receiverId, text, timestamp, read: false }]);
    setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'new_message', senderId: senderId, receiverId: receiverId, status: 'info', read: false, text: text, time: getNow() }]);
  };

  const markMessagesRead = (receiverId, senderId) => setMessages(prev => prev.map(m => (m.receiverId === receiverId && m.senderId === senderId) ? { ...m, read: true } : m));
  const markMessageNotificationsRead = (receiverId, senderId) => {
    setInvitations(prev => prev.map(inv => (inv.receiverId === receiverId && inv.senderId === senderId && inv.type === 'new_message') ? { ...inv, read: true } : inv));
  };

  return (
    <DataContext.Provider value={{
      users, addUser, updateUserStatus, updateUser, toggleUserActiveStatus, resetPassword,
      courses, addCourse, updateCourse, deleteCourse,
      projects, addProject, updateProject, deleteProject, rateProject, flagProject, submitAppeal, resolveFlag, toggleProjectStatus,
      thesisDrafts, uploadThesisDraft, setFinalDraft,
      internships, addInternship, updateInternship, deleteInternship, toggleInternshipStatus, toggleArchiveInternship,
      tasks, addTask, toggleTaskStatus, updateTask, deleteTask,
      applications, addApplication, updateApplicationStatus,
      projectComments, addProjectComment, updateProjectComment, deleteProjectComment,
      taskComments, addTaskComment, updateTaskComment, deleteTaskComment,
      invitations, sendInvitation, updateInvitationStatus, deleteInvitation, toggleNotificationRead,
      sendCourseRequest, resolveCourseRequest,
      favorites, toggleFavorite,
      messages, sendMessage, markMessagesRead, markMessageNotificationsRead,
      toast, showToast, confirmDialog, confirmAction
    }}>
      {children}
    </DataContext.Provider>
  );
};