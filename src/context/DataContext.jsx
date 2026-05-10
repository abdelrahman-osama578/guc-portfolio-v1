// src/context/DataContext.jsx
import { createContext, useState, useContext } from 'react';
import {
  initialUsers, initialCourses, initialProjects, initialInternships,
  initialTasks, initialApplications, initialProjectComments,
  initialTaskComments, initialInvitations, initialFavorites,
  initialMessages
} from '../assets/dummyData';

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

  // --- UI STATES ---
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // REQ: Custom Confirmation Modal

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- REQ: Custom Confirmation Function ---
  const confirmAction = (message, confirmText = "Confirm", onConfirmCallback) => {
    setConfirmDialog({
      message,
      confirmText,
      onConfirm: () => {
        onConfirmCallback();
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const addUser = (newUser) => setUsers([...users, { ...newUser, id: users.length + 1 }]);
  const updateUserStatus = (userId, newStatus) => setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  const updateUser = (userId, data) => setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
  const toggleUserActiveStatus = (userId) => setUsers(users.map(u => u.id === userId ? { ...u, status: (u.status || 'active') === 'active' ? 'deactivated' : 'active' } : u));
  const resetPassword = (email, newPassword) => setUsers(users.map(u => u.email === email ? { ...u, password: newPassword } : u));

  const addCourse = (code, name) => setCourses([...courses, { id: `c${courses.length + 1}`, code, name }]);
  const updateCourse = (id, newCode, newName) => setCourses(courses.map(c => c.id === id ? { ...c, code: newCode, name: newName } : c));
  // --- UPDATED: deleteCourse with Cascading Unlink ---
  const deleteCourse = (id) => {
    // 1. Find the course code before we delete it so we know what to unlink
    const courseToDelete = courses.find(c => c.id === id);
    if (!courseToDelete) return;
    const deletedCourseCode = courseToDelete.code;

    // 2. Delete the course from the courses array
    setCourses(prevCourses => prevCourses.filter(c => c.id !== id));

    // 3. Remove the linkage from ALL instructors
    setUsers(prevUsers => prevUsers.map(user => {
      // If the user is an instructor and has this course linked
      if (user.role === 'Course Instructor' && user.linkedCourses?.includes(deletedCourseCode)) {
        return {
          ...user,
          // Filter out the deleted course code
          linkedCourses: user.linkedCourses.filter(code => code !== deletedCourseCode)
        };
      }
      return user; // Return other users untouched
    }));

    // 4. CLEANUP: Delete any pending link/unlink requests for this specific course in the Admin Queue
    setInvitations(prevInvitations => prevInvitations.filter(inv =>
      !(inv.type === 'course_request' && inv.courseCode === deletedCourseCode)
    ));

    if (showToast) showToast(`Course ${deletedCourseCode} deleted and unlinked from instructors.`, "info");
  };
  const addProject = (p) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setProjects([...projects, { ...p, id: `p${projects.length + 1}`, creationDate: localDate, status: 'active', rating: 0, ratings: [] }]);
  };
  const updateProject = (id, updatedData) => setProjects(projects.map(p => p.id === id ? { ...p, ...updatedData } : p));
  const deleteProject = (id) => setProjects(projects.filter(p => p.id !== id));

  const rateProject = (projectId, instructorId, score) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const currentRatings = p.ratings || [];
        const updatedRatings = [
          ...currentRatings.filter(r => r.instructorId !== instructorId),
          { instructorId, score }
        ];
        const totalScore = updatedRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / updatedRatings.length;
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
      setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'project_flagged', projectId: projectId, senderId: admin.id, receiverId: project.creatorId, status: 'info', read: false, reason: reason }]);
    }
    if (showToast) showToast("Project flagged and deactivated.", "error");
  };

  const submitAppeal = (id, msg) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, appealMessage: msg, status: 'active' } : p));
    if (showToast) showToast("Appeal submitted. Project temporarily reactivated pending review.", "success");
  };

  const resolveFlag = (id, deactivate) => {
    // 1. Update the project status
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isFlagged: false, status: deactivate ? 'deactivated' : 'active', flagReason: null, appealMessage: null } : p));

    // 2. NEW: Notify the student if their project was successfully reactivated!
    if (!deactivate) {
      const project = projects.find(p => p.id === id);
      if (project) {
        const admin = users.find(u => u.role === 'Administrator') || { id: 3 };
        setInvitations(prev => [...prev, {
          id: `notif${Date.now()}_${Math.random()}`,
          type: 'project_reactivated',
          projectId: project.id,
          senderId: admin.id,
          receiverId: project.creatorId,
          status: 'info',
          read: false
        }]);
      }
    }

    if (showToast) showToast(`Project ${deactivate ? 'deactivated permanently' : 'reactivated successfully'}.`, deactivate ? 'error' : 'success');
  };

  const toggleProjectStatus = (id) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'active' ? 'deactivated' : 'active';
        if (showToast) showToast(`Project ${newStatus}!`, newStatus === 'active' ? 'success' : 'error');
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const uploadThesisDraft = (projectId, name, fileData) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setThesisDrafts([...thesisDrafts, { id: `d${Date.now()}`, projectId, name, fileData, date: localDate, isFinal: false }]);
  };
  const setFinalDraft = (projectId, draftId) => setThesisDrafts(thesisDrafts.map(d => d.projectId === projectId ? { ...d, isFinal: d.id === draftId } : d));

  const addTask = (t) => setTasks([...tasks, { ...t, id: `t${Date.now()}` }]);
  const updateTask = (id, updatedData) => setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, ...updatedData } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const toggleTaskStatus = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t));

  const addTaskComment = (c) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setTaskComments([...taskComments, { ...c, id: `tc${taskComments.length + 1}`, date: localDate }]);
    const task = tasks.find(t => t.id === c.taskId);
    if (task) {
      setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'feedback_task', projectId: task.projectId, taskId: task.id, senderId: c.instructorId, receiverId: task.assigneeId, status: 'info', read: false }]);
    }
  };

  const addProjectComment = (c) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setProjectComments([...projectComments, { ...c, id: `pc${projectComments.length + 1}`, date: localDate }]);
    const project = projects.find(p => p.id === c.projectId);
    if (project) {
      setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'feedback_project', projectId: project.id, senderId: c.instructorId, receiverId: project.creatorId, status: 'info', read: false }]);
    }
  };
  const updateProjectComment = (id, newText) => setProjectComments(projectComments.map(c => c.id === id ? { ...c, text: newText } : c));
  const deleteProjectComment = (id) => setProjectComments(projectComments.filter(c => c.id !== id));

  const addInternship = (i) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setInternships([...internships, { ...i, id: `i${Date.now()}`, postedDate: localDate, status: 'hiring', isArchived: false }]);
    if (showToast) showToast("Internship posted successfully!");
  };
  const updateInternship = (id, data) => {
    setInternships(internships.map(i => i.id === id ? { ...i, ...data } : i));
    if (showToast) showToast("Internship updated successfully!");
  };
  const deleteInternship = (id) => {
    setInternships(internships.filter(i => i.id !== id));
    if (showToast) showToast("Internship deleted.", "error");
  };
  const toggleInternshipStatus = (id) => setInternships(internships.map(i => i.id === id ? { ...i, status: i.status === 'hiring' ? 'filled' : 'hiring' } : i));
  const toggleArchiveInternship = (id) => setInternships(internships.map(i => i.id === id ? { ...i, isArchived: !i.isArchived } : i));

  // --- REQ 89: Application logic + Notification to Employer & Student ---
  const addApplication = (a) => {
    setApplications([...applications, { ...a, id: `app${Date.now()}`, status: 'pending' }]);
    const internship = internships.find(i => i.id === a.internshipId);
    const employer = users.find(u => u.companyName === internship?.companyName);
    if (employer) {
      setInvitations(prev => [...prev, {
        id: `notif${Date.now()}`, type: 'new_application', internshipId: internship.id,
        senderId: a.studentId, receiverId: employer.id, status: 'info', read: false
      }]);
    }
    if (showToast) showToast("Application submitted successfully!");
  };
  const updateApplicationStatus = (id, s) => {
    setApplications(applications.map(a => a.id === id ? { ...a, status: s } : a));
    if (s === 'accepted' || s === 'rejected') {
      const app = applications.find(a => a.id === id);
      if (app) {
        const internship = internships.find(i => i.id === app.internshipId);
        const employer = users.find(u => u.companyName === internship?.companyName);
        setInvitations(prev => [...prev, {
          id: `notif${Date.now()}_${Math.random()}`, type: 'application_update', internshipId: internship?.id,
          senderId: employer?.id || 3, receiverId: app.studentId, status: 'info', appStatus: s, read: false
        }]);
        if (showToast) showToast(`Applicant ${s} and notified!`, s === 'accepted' ? 'success' : 'info');
      }
    }
  };

  const sendInvitation = (pId, sId, rId) => {
    const alreadyInvited = invitations.some(i => i.projectId === pId && i.receiverId === rId);
    if (alreadyInvited) {
      if (showToast) showToast("This user has already been invited.", "error");
      return;
    }
    setInvitations([...invitations, { id: `inv${Date.now()}`, projectId: pId, senderId: sId, receiverId: rId, status: 'pending', read: false }]);
    if (showToast) showToast("Invitation sent!");
  };

  const updateInvitationStatus = (id, s) => setInvitations(invitations.map(i => i.id === id ? { ...i, status: s, read: true } : i));
  const deleteInvitation = (id) => setInvitations(invitations.filter(i => i.id !== id));
  const toggleNotificationRead = (id) => setInvitations(invitations.map(i => i.id === id ? { ...i, read: !i.read } : i));

  const sendCourseRequest = (senderId, courseCode, actionType) => {
    const alreadyRequested = invitations.some(i => i.type === 'course_request' && i.senderId === senderId && i.courseCode === courseCode && i.status === 'pending');
    if (alreadyRequested) {
      if (showToast) showToast(`You already have a pending ${actionType} request for this course.`, "error");
      return;
    }
    const admin = users.find(u => u.role === 'Administrator');
    if (!admin) return;
    setInvitations(prev => [...prev, { id: `req${Date.now()}`, type: 'course_request', actionType, courseCode, senderId, receiverId: admin.id, status: 'pending', read: false }]);
    if (showToast) showToast(`${actionType === 'link' ? 'Link' : 'Unlink'} request sent to Administrator!`);
  };

  const resolveCourseRequest = (reqId, newStatus) => {
    const req = invitations.find(i => i.id === reqId);
    if (!req) return;
    setInvitations(invitations.map(i => i.id === reqId ? { ...i, status: newStatus, read: true } : i));

    if (newStatus === 'accepted') {
      const instructor = users.find(u => u.id === req.senderId);
      if (instructor) {
        let updatedCourses = instructor.linkedCourses || [];
        if (req.actionType === 'link' && !updatedCourses.includes(req.courseCode)) {
          updatedCourses = [...updatedCourses, req.courseCode];
        } else if (req.actionType === 'unlink') {
          updatedCourses = updatedCourses.filter(c => c !== req.courseCode);
        }
        updateUser(instructor.id, { linkedCourses: updatedCourses });
      }
    }
  };

  const toggleFavorite = (userId, itemId, type) => {
    const existing = favorites.find(f => f.userId === userId && f.itemId === itemId);
    if (existing) setFavorites(favorites.filter(f => f.id !== existing.id));
    else setFavorites([...favorites, { id: `fav${Date.now()}`, userId, itemId, type }]);
  };

  const sendMessage = (senderId, receiverId, text) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-CA')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages([...messages, { id: `m${Date.now()}`, senderId, receiverId, text, timestamp, read: false }]);
    setInvitations(prev => [...prev, { id: `notif${Date.now()}`, type: 'new_message', senderId: senderId, receiverId: receiverId, status: 'info', read: false }]);
  };

  const markMessagesRead = (receiverId, senderId) => setMessages(messages.map(m => (m.receiverId === receiverId && m.senderId === senderId) ? { ...m, read: true } : m));
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
      projectComments, addProjectComment, updateProjectComment, deleteProjectComment, taskComments, addTaskComment,
      invitations, sendInvitation, updateInvitationStatus, deleteInvitation, toggleNotificationRead,
      sendCourseRequest, resolveCourseRequest,
      favorites, toggleFavorite,
      messages, sendMessage, markMessagesRead, markMessageNotificationsRead,
      toast, showToast,
      confirmDialog, confirmAction // <-- NEW MODAL STATE EXPORTED
    }}>
      {children}
    </DataContext.Provider>
  );
};