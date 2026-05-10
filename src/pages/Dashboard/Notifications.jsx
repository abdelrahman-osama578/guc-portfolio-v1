// src/pages/Dashboard/Notifications.jsx
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, MailOpen, Mail, MessageSquare, Briefcase, BellOff } from 'lucide-react';

const Notifications = () => {
  const { invitations, projects, internships, users, updateInvitationStatus, toggleNotificationRead, resolveCourseRequest, updateUser } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleToggleMute = () => {
    updateUser(currentUser.id, { notificationsMuted: !currentUser.notificationsMuted });
  };

  const myNotifications = currentUser?.notificationsMuted ? [] : invitations.filter(inv => inv.receiverId === currentUser?.id);

  const getProject = (id) => projects.find(p => p.id === id);
  const getInternship = (id) => internships.find(i => i.id === id);
  const getSender = (id) => users.find(u => u.id === id);

  // Smart Navigation Handler
  // Smart Navigation Handler
  // Smart Navigation Handler
  const handleActionClick = (notif) => {
    if (!notif.read) toggleNotificationRead(notif.id);

    // If it's a project flag or a course request for an Admin, send to Admin Panel
    if (currentUser?.role === 'Administrator' && (notif.type === 'project_flagged' || notif.type === 'course_request')) {
      navigate('/admin'); // <--- Update this to your exact Admin route name
      return;
    }

    // Standard routing for everyone else
    if (notif.projectId) {
      navigate(`/projects/${notif.projectId}`);
    } else if (notif.type === 'new_message') {
      navigate('/messages');
    } else if (notif.type === 'new_application') {
      navigate('/manage-applicants');
    } else if (notif.type === 'application_update') {
      navigate('/'); 
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          {currentUser?.notificationsMuted ? <BellOff className="w-6 h-6 mr-2" /> : <Bell className="w-6 h-6 mr-2" />}
          Notifications
        </h2>

        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm border ${currentUser?.notificationsMuted
              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
        >
          {currentUser?.notificationsMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          {currentUser?.notificationsMuted ? 'Turn On Notifications' : 'Turn Off All Notifications'}
        </button>
      </div>

      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
        {currentUser?.notificationsMuted ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Notifications are turned off</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              You will not see any new alerts, requests, or messages here until you turn notifications back on.
            </p>
          </div>
        ) : myNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">You have no new notifications.</p>
        ) : (
          <div className="space-y-4">
            {myNotifications.map(notif => {
              const sender = getSender(notif.senderId);
              const isCourseReq = notif.type === 'course_request';
              const project = !isCourseReq && notif.projectId ? getProject(notif.projectId) : null;
              const internship = notif.type === 'new_application' || notif.type === 'application_update' ? getInternship(notif.internshipId) : null;

              let messageText = null;
              if (notif.type === 'course_request') {
                messageText = <><span className="font-bold">{sender?.firstName} {sender?.lastName}</span> requested to <span className="font-bold text-primary uppercase">{notif.actionType}</span> the course <span className="font-bold">{notif.courseCode}</span>.</>;
              } else if (notif.type === 'feedback_project') {
                messageText = <><span className="font-bold">{sender?.firstName} {sender?.lastName}</span> left new instructor feedback on your project <span className="font-bold text-primary">{project?.title}</span>.</>;
              } else if (notif.type === 'feedback_task') {
                messageText = <><span className="font-bold">{sender?.firstName} {sender?.lastName}</span> left feedback on a task assigned to you in <span className="font-bold text-primary">{project?.title}</span>.</>;
              } else if (notif.type === 'project_flagged') {
                messageText = <><span className="font-bold text-red-600">ACTION REQUIRED:</span> Your project <span className="font-bold text-primary">{project?.title}</span> has been flagged and deactivated. <span className="block mt-1 text-xs text-red-500 font-bold">Reason: {notif.reason || project?.flagReason}</span></>;
              } else if (notif.type === 'project_reactivated') {
                messageText = <><span className="font-bold text-green-600">GOOD NEWS:</span> Administrator <span className="font-bold">{sender?.firstName}</span> has reviewed your appeal and <span className="font-bold text-green-600 uppercase">reactivated</span> your project <span className="font-bold text-primary">{project?.title}</span>.</>;
              } else if (notif.type === 'new_message') {
                messageText = <><span className="font-bold">{sender?.firstName || sender?.companyName} {sender?.lastName || ''}</span> sent you a new private message.</>;
              } else if (notif.type === 'new_application') {
                messageText = <><span className="font-bold">{sender?.firstName} {sender?.lastName}</span> submitted an application for your <span className="font-bold text-primary">{internship?.title}</span> position.</>;
              } else if (notif.type === 'application_update') {
                messageText = <>Your application for the <span className="font-bold text-primary">{internship?.title}</span> role at <span className="font-bold">{internship?.companyName}</span> was <span className={`font-bold uppercase ${notif.appStatus === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>{notif.appStatus}</span>.</>;
              } else {
                messageText = <><span className="font-bold">{sender?.firstName} {sender?.lastName}</span> invited you to collaborate on <span className="font-bold text-primary">{project?.title}</span>.</>;
              }

              const isMsgOrFeedback = notif.type?.includes('feedback') || notif.type === 'new_message';
              const isApplicationEvent = notif.type === 'new_application' || notif.type === 'application_update';

              // Determine if this notification has a valid destination link
const isActionable = notif.projectId || notif.type === 'new_message' || notif.type === 'new_application' || notif.type === 'application_update' || (currentUser?.role === 'Administrator' && (notif.type === 'course_request' || notif.type === 'project_flagged'));              return (
                <div key={notif.id} className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>

                  <div className="flex items-start gap-4 flex-1 w-full">
                    <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMsgOrFeedback ? 'bg-purple-100 text-purple-600' : isApplicationEvent ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isMsgOrFeedback ? <MessageSquare className="w-5 h-5" /> : isApplicationEvent ? <Briefcase className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 mt-1">
                      {/* --- REQ: Actionable Notification Text Link --- */}
                      {isActionable ? (
                        <button
                          onClick={() => handleActionClick(notif)}
                          className="text-sm text-gray-800 leading-relaxed text-left hover:underline hover:text-primary transition-all focus:outline-none inline"
                        >
                          {messageText}
                        </button>
                      ) : (
                        <p className="text-sm text-gray-800 leading-relaxed inline">{messageText}</p>
                      )}

                      {notif.status !== 'info' && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md mt-2 block w-fit
                          ${notif.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${notif.status === 'accepted' ? 'bg-green-100 text-green-700' : ''}
                          ${notif.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          Status: {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:ml-4">
                    <button
                      onClick={() => toggleNotificationRead(notif.id)}
                      className={`p-2 rounded-full transition-colors ${notif.read ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-blue-500 hover:text-blue-700 hover:bg-blue-100 bg-white'}`}
                      title={notif.read ? "Mark as unread" : "Mark as read"}
                    >
                      {notif.read ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                    </button>

                    {notif.status === 'pending' && !isMsgOrFeedback && !isApplicationEvent && (
                      <>
                        <button onClick={() => isCourseReq ? resolveCourseRequest(notif.id, 'accepted') : updateInvitationStatus(notif.id, 'accepted')} className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors shadow-sm"><Check className="w-4 h-4 mr-1" /> Accept</button>
                        <button onClick={() => isCourseReq ? resolveCourseRequest(notif.id, 'rejected') : updateInvitationStatus(notif.id, 'rejected')} className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors shadow-sm"><X className="w-4 h-4 mr-1" /> Reject</button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;