"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserWithRoles } from "@/types/user";
import { AdminSection, AdminSectionConfig } from "@/types/admin";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { UserManagement } from "./user-management";
import { AdminOverview } from "./admin-overview";
import { CourseManagement } from "./course-management";
import { ExamManagement } from "./exam-management";
import { ReportsSection } from "./reports-section";
import { ConfigurationSection } from "./configuration-section";
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";

interface AdminDashboardProps {
  user: UserWithRoles;
  onLogout: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

const adminSections: AdminSectionConfig[] = [
  {
    id: "overview",
    name: "Panel General",
    icon: LayoutDashboard,
    description: "Resumen general de la plataforma"
  },
  {
    id: "users",
    name: "Usuarios",
    icon: Users,
    description: "Gestión de usuarios y roles"
  },
  {
    id: "courses",
    name: "Cursos",
    icon: BookOpen,
    description: "Administración de cursos"
  },
  {
    id: "exams",
    name: "Exámenes",
    icon: FileText,
    description: "Gestión de exámenes y evaluaciones"
  },
  {
    id: "reports",
    name: "Reportes",
    icon: BarChart3,
    description: "Análisis y estadísticas"
  },
  {
    id: "config",
    name: "Configuración",
    icon: Settings,
    description: "Configuración del sistema"
  }
];

export function AdminDashboard({ 
  user, 
  onLogout, 
  onToggleTheme, 
  isDark 
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <UserManagement />;
      case "courses":
        return <CourseManagement />;
      case "exams":
        return <ExamManagement />;
      case "reports":
        return <ReportsSection />;
      case "config":
        return <ConfigurationSection />;
      default:
        return <AdminOverview />;
    }
  };

  const currentSection = adminSections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AdminHeader 
        user={user}
        onLogout={onLogout}
        onToggleTheme={onToggleTheme}
        isDark={isDark}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            sections={adminSections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r z-50 lg:hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Administración</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <AdminSidebar
                sections={adminSections}
                activeSection={activeSection}
                onSectionChange={(section: AdminSection) => {
                  setActiveSection(section);
                  setSidebarOpen(false);
                }}
                mobile
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-[calc(100vh-4rem)]">
          <div className="p-4 lg:p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Panel Admin</span>
                <span>/</span>
                <span className="text-foreground">{currentSection?.name}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {currentSection?.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentSection?.description}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}