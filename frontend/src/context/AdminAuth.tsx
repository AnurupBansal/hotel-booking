"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { adminLogin, adminGetMe } from "@/services/api";

type AdminUser = {
  id: string;
  username: string;
  name: string;
};

type AdminAuthContextType = {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for stored token
  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : null;

    if (!stored) {
      setLoading(false);
      return;
    }

    adminGetMe(stored)
      .then((user) => {
        setAdmin(user);
        setToken(stored);
      })
      .catch(() => {
        sessionStorage.removeItem("admin_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await adminLogin(username, password);
    setToken(result.token);
    setAdmin(result.admin);
    sessionStorage.setItem("admin_token", result.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    sessionStorage.removeItem("admin_token");
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
