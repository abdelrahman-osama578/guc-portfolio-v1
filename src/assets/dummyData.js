// src/assets/dummyData.js

export const initialUsers = [
  {
    id: 1,
    firstName: "Ahmed",
    lastName: "Student",
    email: "ahmed@student.guc.edu.eg",
    password: "password123",
    role: "Student",
    major: "MET",
    skills: ["React", "JavaScript", "Tailwind"],
    linkedin: "https://linkedin.com/in/ahmed",
    profilePic: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 2,
    firstName: "Mervat",
    lastName: "Instructor",
    email: "mervat@guc.edu.eg",
    password: "password123",
    role: "Course Instructor",
    linkedCourses: ["CSEN701", "BP"],
    profilePic: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 3,
    firstName: "Admin",
    lastName: "User",
    email: "admin@guc.edu.eg",
    password: "admin",
    role: "Administrator",
    profilePic: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: 4,
    companyName: "TechCorp",
    email: "hr@techcorp.com",
    password: "employer123",
    role: "Employer",
    status: "active",
    profilePic: "https://ui-avatars.com/api/?name=TechCorp"
  },
  {
    id: 5,
    firstName: "Sara",
    lastName: "Collaborator",
    email: "sara@student.guc.edu.eg",
    password: "password123",
    role: "Student",
    major: "MET",
    skills: ["React"],
    profilePic: "https://i.pravatar.cc/150?img=1"
  }
  

];


export const initialCourses = [
  { id: "c1", code: "CSEN701", name: "Software Engineering" },
  { id: "c2", code: "CSEN702", name: "Advanced Computer Networks" },
  { id: "c3", code: "BP", name: "Bachelor Project" }
];

export const initialProjects = [
  {
    id: "p1",
    title: "Portfolio Web Platform",
    creatorId: 1,
    courseId: "c1",
    githubLink: "https://github.com/ahmed/guc-portfolio",
    languages: ["JavaScript", "React", "Tailwind"],
    creationDate: "2026-03-10",
    visibility: "public",
    status: "active",
    rating: 4,
    isFlagged: false
  }
];

export const initialInternships = [
  {
    id: "i1",
    title: "Frontend Developer Intern",
    companyName: "TechCorp",
    duration: "3 months",
    skills: ["React", "JavaScript", "Tailwind"],
    deadline: "2026-06-01",
    postedDate: "2026-05-01",
    status: "hiring"
  },
  {
    id: 999, 
    title: "Legacy React Developer",
    companyName: "TechCorp", 
    postedDate: "2026-03-01",
    deadline: "2026-04-15", 
    startDate: "2026-04-20",
    endDate: "2026-05-05",  // THIS PAST DATE TRIGGERS THE AUTOMATIC COMPLETION
    location: "Cairo, Egypt",
    type: "Part-time",
    description: "This is a test internship.",
    requirements: ["React", "JavaScript"],
    status: "active" 
  }
];

export const initialTasks = [
  { id: "t1", projectId: "p1", description: "Design Figma wireframes", assigneeId: 1, status: "completed", deadline: "2026-03-12", order: 1 },
  { id: "t2", projectId: "p1", description: "Implement React Router", assigneeId: 1, status: "pending", deadline: "2026-04-10", order: 2 }
];

export const initialApplications = [
  { id: "app1", internshipId: "i1", studentId: 1, coverLetter: "I love React!", status: "pending" },{ id: "app2", internshipId: 999, studentId: 1, coverLetter: "I have the required experience.", status: "accepted" }

];

export const initialProjectComments = [
  { id: "pc1", projectId: "p1", instructorId: 2, text: "Great architecture.", date: "2026-03-15" }
];

export const initialTaskComments = [
  { id: "tc1", taskId: "t1", instructorId: 2, text: "Clean wireframes.", date: "2026-03-13" }
];

export const initialInvitations = [
  { id: "inv1", projectId: "p1", senderId: 1, receiverId: 2, status: "pending", read: false },
  { id: "inv2", projectId: "p1", senderId: 1, receiverId: 5, status: "accepted", read: true }
];

// Add to the bottom of src/assets/dummyData.js
export const initialFavorites = [
  { id: "f1", userId: 1, itemId: "p1", type: "project" } // Ahmed favorited his own project for testing
];

export const initialMessages = [
  { id: "m1", senderId: 2, receiverId: 1, text: "Ahmed, your architecture looks great!", timestamp: "2026-05-07 10:00", read: false }
];