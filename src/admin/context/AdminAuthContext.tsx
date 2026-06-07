import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { db, AdminUser } from "../data/mockDb";

type AuthState = {
  user: AdminUser | null;
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  hasRole: (...roles: AdminUser["role"][]) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

const SESSION_KEY = "velox-admin-session";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    db.init();
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        const users = db.getUsers();
        const u = users.find((x) => x.id === session.userId && x.active);
        if (u) setUser(u);
      }
    } catch {}
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    await new Promise((r) => setTimeout(r, 500)); // simulate latency
    const users = db.getUsers();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { ok: false, error: "Email inconnu" };
    if (!u.active) return { ok: false, error: "Compte désactivé" };
    if (u.password !== password) return { ok: false, error: "Mot de passe incorrect" };

    // Update last login
    u.lastLogin = new Date().toISOString();
    const all = db.getUsers().map((x) => (x.id === u.id ? u : x));
    db.saveUsers(all);

    setUser(u);
    const session = { userId: u.id, ts: Date.now() };
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    db.addLog({ userId: u.id, userName: u.fullName, action: "USER_LOGIN", entity: "Auth", details: "Connexion réussie" });
    return { ok: true };
  };

  const logout = () => {
    if (user) {
      db.addLog({ userId: user.id, userName: user.fullName, action: "USER_LOGOUT", entity: "Auth", details: "Déconnexion" });
    }
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const hasRole = (...roles: AdminUser["role"][]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return <AuthContext.Provider value={{ user, login, logout, hasRole }}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
