// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { users } = useData();
  const [currentUser, setCurrentUser] = useState(null);

  // --- THE FIX: Auto-sync currentUser with the main database ---
  // If anything about this user changes in DataContext, instantly update their active session!
  useEffect(() => {
    if (currentUser) {
      const freshUserData = users.find(u => u.id === currentUser.id);
      if (freshUserData) {
        setCurrentUser(freshUserData);
      }
    }
  }, [users]);

  // Requirement 1: Login using email and password
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  // Requirement 1: Logout
  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};