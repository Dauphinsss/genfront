"use client";

import { useAuth } from "@/components/context/AuthContext";
import { SidebarItem } from "./SidebarItem";
import { BookOpen, Users, Settings, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DashboardView } from "../dashboard";

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { privileges, user } = useAuth();
  const [adminOpen, setAdminOpen] = useState(true);

  const adminPrivileges = privileges.filter((p) => 
    p.name === "manage_users" || 
    p.name === "manage_privileges" || 
    p.name === "system_settings"
  );

  const hasAdminPrivileges = adminPrivileges.length > 0;

  if (!hasAdminPrivileges) {
    return null;
  }

  return (
    <aside className="bg-background border-r border-border w-64 hidden md:flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Panel</h2>
        <p className="text-xs text-muted-foreground mt-1 truncate">{user?.name}</p>
      </div>

      <nav className="space-y-2 flex-1">
        <button 
          onClick={() => onViewChange("inicio")}
          className="w-full"
        >
          <SidebarItem 
            icon={BookOpen} 
            label="Cursos" 
            isActive={currentView === "inicio"}
          />
        </button>

        {hasAdminPrivileges && (
          <div className="mt-4">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">Administración</span>
              </div>
              {adminOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {adminOpen && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-border pl-2">
                {privileges.some((p) => p.name === "manage_users") && (
                  <button 
                    onClick={() => onViewChange("admin-users")}
                    className="w-full"
                  >
                    <SidebarItem 
                      icon={Users} 
                      label="Gestión de Usuarios" 
                      isActive={currentView === "admin-users"}
                    />
                  </button>
                )}

                {privileges.some((p) => p.name === "manage_privileges") && (
                  <button 
                    onClick={() => onViewChange("admin-privileges")}
                    className="w-full"
                  >
                    <SidebarItem 
                      icon={Shield} 
                      label="Gestión de Privilegios"
                      isActive={currentView === "admin-privileges"}
                    />
                  </button>
                )}

                {privileges.some((p) => p.name === "system_settings") && (
                  <button className="w-full">
                    <SidebarItem 
                      icon={Settings} 
                      label="Configuración"
                      isActive={false}
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Pyson v1.0
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {adminPrivileges.length} privilegio{adminPrivileges.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  );
}