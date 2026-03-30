/* ──────────────────────────────────────────────
   Delhi RoadWatch — Auth Context (localStorage)
   ────────────────────────────────────────────── */

import { createContext, useContext, useState, useEffect } from 'react';
import { loginCitizen, loginPolice, loginAdmin, signupCitizen } from '../data/db';

const AuthContext = createContext(null);
const SESSION_KEY = 'rw_user';

function saveSession(user)  { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { } }
function clearSession()     { try { sessionStorage.removeItem(SESSION_KEY); } catch { } }
function loadSession()      { try { const s = sessionStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  function setUser(user) {
    if (user) saveSession(user);
    else clearSession();
    setCurrentUser(user);
  }

  useEffect(() => {
    const stored = loadSession();
    if (stored) setCurrentUser(stored);
    setReady(true);
  }, []);

  async function login(role, identifier, password) {
    try {
      let result;
      if (role === 'citizen')     result = await loginCitizen(identifier, password);
      else if (role === 'police') result = await loginPolice(identifier, password);
      else                        result = await loginAdmin(identifier, password);

      if (result.success) { setUser(result.user); return { success: true, user: result.user }; }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: 'Login error: ' + err.message };
    }
  }

  async function signup(name, email, phone, aadhaar, password) {
    try {
      const result = await signupCitizen(name, email, phone, aadhaar, password);
      if (result.success) { setUser(result.user); return { success: true, user: result.user }; }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: 'Signup failed: ' + err.message };
    }
  }

  function logout() { clearSession(); setCurrentUser(null); }

  function setUserDirectly(user) { setUser(user); }

  return (
    <AuthContext.Provider value={{ currentUser, setUserDirectly, login, signup, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
