"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin" | "superadmin" | "pilot" | "crew";
  loyaltyTier: string;
  loyaltyPoints: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isCrew: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ONLY admin pages require login — portal/auth/landing are PUBLIC
const adminPaths = ["/dashboard", "/flights", "/bookings", "/fleet", "/crew", "/customers", "/revenue", "/notifications", "/settings"];
const crewPaths = ["/panel"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { checkAuth(); }, []);

  // Route protection — only admin/crew pages
  useEffect(() => {
    if (loading) return;
    const isAdminPath = adminPaths.some(p => pathname.startsWith(p));
    const isCrewPath = crewPaths.some(p => pathname.startsWith(p));

    if (isAdminPath && !user) {
      router.replace("/auth");
      return;
    }
    if (isAdminPath && user && !["admin", "superadmin"].includes(user.role)) {
      router.replace("/");
      return;
    }
    if (isCrewPath && !user) {
      router.replace("/auth");
      return;
    }
    if (isCrewPath && user && !["pilot", "crew", "admin", "superadmin"].includes(user.role)) {
      router.replace("/");
      return;
    }
  }, [user, loading, pathname]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.data.user);
        const role = data.data.user.role;
        if (["admin", "superadmin"].includes(role)) router.push("/dashboard");
        else if (["pilot", "crew"].includes(role)) router.push("/panel");
        else router.push("/portal");
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials" };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (body: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.data?.user);
        router.push("/portal");
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" }).catch(() => {});
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAdmin: !!user && ["admin", "superadmin"].includes(user.role),
      isCrew: !!user && ["pilot", "crew"].includes(user.role),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
