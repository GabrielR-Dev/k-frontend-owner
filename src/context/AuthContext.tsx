import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Role, User } from "../types";
import { authService } from "../services/auth.service";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  updateUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    lastName: string;
    phone: string;
    role: Role;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = "kiago_user";

function readStoredUser(): User | null {
  if (!localStorage.getItem("kiago_token")) return null;

  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [loading, setLoading] = useState(true);

  const updateUser = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  useEffect(() => {
    const load = async () => {
      if (!localStorage.getItem("kiago_token")) return setLoading(false);
      try {
        updateUser(await authService.me());
      } catch {
        authService.logout();
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };
    load();
    const logoutHandler = () => {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    };
    window.addEventListener("kiago:logout", logoutHandler);
    return () => window.removeEventListener("kiago:logout", logoutHandler);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    updateUser(result.user || (await authService.me()));
  };

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    lastName: string;
    phone: string;
    role: Role;
  }) => {
    await authService.register(payload);
    await login(payload.email, payload.password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, updateUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
