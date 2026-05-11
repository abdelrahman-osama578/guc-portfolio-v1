// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { users } = useData();
  const [currentUser, setCurrentUser] = useState(null);

  // Auto-sync currentUser with the main database
  useEffect(() => {
    if (currentUser) {
      const freshUserData = users.find(u => u.id === currentUser.id);
      if (freshUserData) {
        setCurrentUser(freshUserData);
      }
    }
  }, [users]);

  // --- FIXED: Check User Status during Login ---
  const login = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
      if (user.status === 'deactivated') {
        return { success: false, error: "Your account has been deactivated by an administrator." };
      }
      if (user.status === 'pending_admin_approval') {
        return { success: false, error: "Your account is still pending administrator approval." };
      }
      if (user.status === 'rejected') {
        return { success: false, error: "Your registration request was rejected by an administrator." };
      }
      
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: "Invalid email or password. Please try again." };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};