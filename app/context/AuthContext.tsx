import React, { createContext, useContext, useState, useEffect } from "react";
import type { Role, User } from "../types";
import { api } from "../lib/axios";
import { useQueryClient } from "@tanstack/react-query";

interface AuthResult {
  success: boolean;
  message?: string;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string; role?: Role }>;
  register: (
    username: string,
    password: string,
    fullName: string,
    phoneNumber?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("rms_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleAuthResponse = (data: any) => {
    const userData: User = {
      id: data.id,
      username: data.username,
      role: data.role,
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("rms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      handleAuthResponse(data);
      return { success: true, role: data.role };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid username or password.";
      return { success: false, message };
    }
  };
  const register = async (
    username: string,
    password: string,
    fullName: string,
    phoneNumber?: string,
  ): Promise<AuthResult> => {
    try {
      const { data } = await api.post("/auth/register", {
        username,
        password,
        fullName,
        phoneNumber,
      });
      handleAuthResponse(data);
      return { success: true };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rms_user");
    localStorage.removeItem("token");
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
