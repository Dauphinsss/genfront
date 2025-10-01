"use client";

import { AdminDashboard } from "@/components/admin-dashboard";
import { useState, useEffect } from "react";
import { UserWithRoles } from "@/types/user";
import { isAdmin } from "@/lib/roles";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const savedUser = localStorage.getItem("pyson_user");
      if (!savedUser) {
        redirect("/");
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      // Aquí verificarías los roles del usuario desde tu API
      const userWithRoles: UserWithRoles = {
        ...parsedUser,
        user_id: parsedUser.id || "1",
        first_name: parsedUser.name?.split(" ")[0] || "",
        last_name: parsedUser.name?.split(" ").slice(1).join(" ") || "",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles: [
          {
            role_id: "3",
            name: "administrador",
            description: "Administrador del sistema",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
          }
        ],
        primaryRole: "administrador"
      };

      if (!isAdmin(userWithRoles)) {
        redirect("/");
        return;
      }

      setUser(userWithRoles);
      setIsLoading(false);
    };

    checkAdminAccess();
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("pyson_user");
    redirect("/");
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("pyson_theme", newIsDark ? "dark" : "light");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verificando acceso de administrador...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={handleLogout}
      onToggleTheme={toggleTheme}
      isDark={isDark}
    />
  );
}