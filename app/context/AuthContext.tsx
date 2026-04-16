import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  admin: { username: "admin", password: "admin123", role: "Manager", name: "Ahmad Zulkifli" },
  staff: { username: "staff", password: "staff123", role: "Staff", name: "Siti Norzahra" },
  kitchen: { username: "kitchen", password: "kitchen123", role: "Kitchen", name: "Razif Hamdan" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("rms_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = (username: string, password: string): LoginResult => {
    const found = Object.values(MOCK_USERS).find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      const userData: User = { username: found.username, role: found.role, name: found.name };
      setUser(userData);
      localStorage.setItem("rms_user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: "Invalid username or password." };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}