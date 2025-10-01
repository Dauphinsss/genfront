"use client";

import { Dashboard } from "@/components/dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Header } from "@/components/header";
import { LoginSection } from "@/components/login-section";
import ParticleBackground from "@/components/particleBackground";
import TextCircleFollower from "@/components/textCircleFollower";
import { useState, useEffect } from "react";
import { UserWithRoles } from "@/types/user";
import { getPrimaryRole, isAdmin } from "@/lib/roles";

export default function Home() {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const savedUser = localStorage.getItem("pyson_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Simular roles para demo - en producción esto vendría del backend
        const userWithRoles: UserWithRoles = {
          ...parsedUser,
          user_id: parsedUser.id || "1",
          first_name: parsedUser.name?.split(" ")[0] || "",
          last_name: parsedUser.name?.split(" ").slice(1).join(" ") || "",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          roles: [
            // Simular rol de administrador para demo
            {
              role_id: "3",
              name: "administrador",
              description: "Administrador del sistema",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z"
            }
          ],
          primaryRole: getPrimaryRole([
            {
              role_id: "3",
              name: "administrador",
              description: "Administrador del sistema",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z"
            }
          ])
        };
        setUser(userWithRoles);
      }

      const savedTheme = localStorage.getItem("pyson_theme");
      const prefersDark =
        savedTheme === "dark" ||
        (!savedTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);

      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("pyson_theme", newIsDark ? "dark" : "light");
  };

  const handleLogin = async (provider: "google" | "microsoft") => {
    console.log("[v0] Logging in with:", provider);
    setIsAuthLoading(true);

    if (provider === "google") {
      window.location.href = `http://localhost:4000/auth/google`;
    } else {
      window.location.href = `http://localhost:4000/auth/microsoft`;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("pyson_user");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando Pyson...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Verificar si es administrador y mostrar panel de admin
    if (isAdmin(user)) {
      return (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />
      );
    }

    // Dashboard normal para estudiantes y docentes
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />
    );
  }

  return (
    <>
      <TextCircleFollower />
      <main className="min-h-screen bg-background">
        <Header onToggleTheme={toggleTheme} isDark={isDark} />
        <ParticleBackground />
        <LoginSection onLogin={handleLogin} isLoading={isAuthLoading} />
      </main>
    </>
  );
}
