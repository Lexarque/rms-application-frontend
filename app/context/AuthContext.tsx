import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import { api } from "../lib/axios"; // your axios instance

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<LoginResult>; // now async
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("rms_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      ;
      const userData: User = {
        username: data.username,
        role: data.role,
      };

      localStorage.setItem("token", data.token);          // for axios interceptor
      localStorage.setItem("rms_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err: any) {
      console.log("Login error:", err);
      // Axios wraps HTTP errors — pull the message from the response body
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid username or password.";

      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rms_user");
    localStorage.removeItem("token");
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