"use client";

import { useState, useMemo } from "react";
import { Home, BookOpen, Calendar, Settings, Archive, Shield, Users, ChevronDown, ChevronRight, Edit, BookOpen } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";

export type DashboardView = "inicio" | "perfil" | "pasados" | string;

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isCollapsed?: boolean;
}

interface PrivilegeConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  viewId: string;
}

const PRIVILEGE_CONFIGS: Record<string, PrivilegeConfig> = {
  manage_users: {
    icon: Users,
    label: "Gestionar Usuarios",
    viewId: "admin-users"
  },
  manage_courses: {
    icon: Archive,
    label: "Gestionar Cursos",
    viewId: "admin-courses"
  },

  view_base_course: {
    icon: BookOpen,
    label: "Curso Base",
    viewId: "admin-base-course",
  },

  edit_base_course: {
    icon: Edit,
    label: "Editar Curso Base",
    viewId: "admin-base-course-edit",
  },
};

const TEACHER_PRIVILEGE_CONFIGS: Record<string, PrivilegeConfig> = {
  create_topics: {
    icon: BookOpen,
    label: "Crear Tópicos",
    viewId: "teacher-topics"
  },
};

const TEACHER_PRIVILEGE_CONFIGS: Record<string, PrivilegeConfig> = {
  create_topics: {
    icon: BookOpen,
    label: "Crear Tópicos",
    viewId: "teacher-topics"
  },
};

const STATIC_MENU_ITEMS = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    view: "inicio" as const,
  },
  {
    id: "calendario",
    label: "Calendario",
    icon: Calendar,
    view: "inicio" as const,
    disabled: true,
  },
  {
    id: "pasados",
    label: "Clases archivadas",
    icon: Archive,
    view: "pasados" as const,
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    view: "perfil" as const,
  },
];

const useDynamicAdminItems = () => {
  const { privileges } = useAuth();
  
  return useMemo(
    () =>
      privileges
        .filter((privilege) => PRIVILEGE_CONFIGS[privilege.name])
        .map((privilege) => {
          const config = PRIVILEGE_CONFIGS[privilege.name];
          return {
            id: config.viewId,
            label: config.label,
            icon: config.icon,
            view: config.viewId,
            privilegeName: privilege.name,
          };
        }),
    [privileges]
  );
};

const useDynamicTeacherItems = () => {
  const { privileges } = useAuth();
  
  return useMemo(
    () =>
      privileges
        .filter((privilege) => TEACHER_PRIVILEGE_CONFIGS[privilege.name])
        .map((privilege) => {
          const config = TEACHER_PRIVILEGE_CONFIGS[privilege.name];
          return {
            id: config.viewId,
            label: config.label,
            icon: config.icon,
            view: config.viewId,
            privilegeName: privilege.name,
          };
        }),
    [privileges]
  );
};

interface MenuItemProps {
  item: typeof STATIC_MENU_ITEMS[0];
  isActive: boolean;
  shouldExpand: boolean;
  onViewChange: (view: DashboardView) => void;
  onClose?: () => void;
}

const MenuItem = ({ item, isActive, shouldExpand, onViewChange, onClose }: MenuItemProps) => {
  const Icon = item.icon;
  
  return (
    <li key={item.id}>
      <button
        onClick={() => {
          if (!item.disabled) {
            onViewChange(item.view);
            onClose?.();
          }
        }}
        disabled={item.disabled}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-all duration-200
          ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}
          ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${!shouldExpand ? "justify-center" : ""}
        `}
        title={!shouldExpand ? item.label : ""}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {shouldExpand && <span className="text-sm truncate whitespace-nowrap">{item.label}</span>}
      </button>
    </li>
  );
};

interface AdminSectionProps {
  dynamicAdminItems: ReturnType<typeof useDynamicAdminItems>;
  currentView: DashboardView;
  shouldExpand: boolean;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  onViewChange: (view: DashboardView) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

interface TeacherSectionProps {
  dynamicTeacherItems: ReturnType<typeof useDynamicTeacherItems>;
  currentView: DashboardView;
  shouldExpand: boolean;
  teacherOpen: boolean;
  setTeacherOpen: (open: boolean) => void;
  onViewChange: (view: DashboardView) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const TeacherSection = ({
  dynamicTeacherItems,
  currentView,
  shouldExpand,
  teacherOpen,
  setTeacherOpen,
  onViewChange,
  onClose,
  isMobile = false,
}: TeacherSectionProps) => {
  if (dynamicTeacherItems.length === 0) return null;

  return (
    <>
      <li className="my-2">
        <div className={`h-px bg-border/50 ${shouldExpand ? "mx-2" : ""}`} />
      </li>
      <li>
        <button
          onClick={() => shouldExpand && setTeacherOpen(!teacherOpen)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200
            ${isMobile ? "text-neutral-300" : "text-muted-foreground"}
            ${shouldExpand ? "hover:bg-secondary cursor-pointer" : "cursor-default"}
            ${!shouldExpand ? "justify-center" : ""}
          `}
        >
          {shouldExpand ? (
            <>
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium truncate whitespace-nowrap flex-1 text-left">
                Profesor
              </span>
              {teacherOpen ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
            </>
          ) : (
            <BookOpen className="w-5 h-5 flex-shrink-0" />
          )}
        </button>

        {shouldExpand && teacherOpen && (
          <ul className="mt-1 ml-7 space-y-1">
            {dynamicTeacherItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.view);
                      onClose?.();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200 text-sm
                      ${
                        isActive
                          ? isMobile
                            ? "bg-neutral-800 text-neutral-300 font-medium"
                            : "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    </>
  );
};

const AdminSection = ({
  dynamicAdminItems,
  currentView,
  shouldExpand,
  adminOpen,
  setAdminOpen,
  onViewChange,
  onClose,
  isMobile = false,
}: AdminSectionProps) => {
  if (dynamicAdminItems.length === 0) return null;

  return (
    <>
      <li className="my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </li>

      <li>
        <button
          onClick={() => shouldExpand && setAdminOpen(!adminOpen)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-muted-foreground hover:bg-secondary hover:text-foreground
            transition-all duration-200
            ${!shouldExpand ? "justify-center" : ""}
          `}
          title={!shouldExpand ? "Administración" : ""}
        >
          <Shield className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
          {shouldExpand && (
            <>
              <span className="text-sm font-medium flex-1 text-left truncate whitespace-nowrap">
                Administración
              </span>
              {adminOpen ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
            </>
          )}
        </button>

        {shouldExpand && adminOpen && (
          <ul className="mt-1 ml-7 space-y-1">
            {dynamicAdminItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.view);
                      onClose?.();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200 text-sm
                      ${
                        isActive
                          ? isMobile
                            ? "bg-neutral-800 text-neutral-300 font-medium"
                            : "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    </>
  );
};

export function Sidebar({
  currentView,
  onViewChange,
  isCollapsed = false,
}: SidebarProps) {
  const { privileges } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
  
  const dynamicTeacherItems = useDynamicTeacherItems();
  const dynamicAdminItems = useDynamicAdminItems();
  const shouldExpand = !isCollapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border
        transition-all duration-200 ease-in-out z-40
        ${shouldExpand ? "w-64" : "w-16"}
        hidden md:block
      `}
    >
      <div className="flex flex-col h-full">
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {/* Menú estático */}
            {STATIC_MENU_ITEMS.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={currentView === item.view}
                shouldExpand={shouldExpand}
                onViewChange={onViewChange}
              />
            ))}

            {/* Sección Profesor */}
            <TeacherSection
              dynamicTeacherItems={dynamicTeacherItems}
              currentView={currentView}
              shouldExpand={shouldExpand}
              teacherOpen={teacherOpen}
              setTeacherOpen={setTeacherOpen}
              onViewChange={onViewChange}
            />

            {/* Administración Dinámica */}
            <AdminSection
              dynamicAdminItems={dynamicAdminItems}
              currentView={currentView}
              shouldExpand={shouldExpand}
              adminOpen={adminOpen}
              setAdminOpen={setAdminOpen}
              onViewChange={onViewChange}
            />
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div
            className={`
              text-xs text-muted-foreground space-y-1
              transition-opacity duration-200 ease-in-out
              ${shouldExpand ? "opacity-100" : "opacity-0"}
            `}
          >
            <p className="whitespace-nowrap">Pyson Learning Platform</p>
            <p className="text-[10px] whitespace-nowrap">Versión 1.0.0</p>
            {dynamicAdminItems.length > 0 && (
              <div className="pt-2 mt-2 border-t border-border/50">
                <p className="text-[10px] text-neutral-300 font-medium whitespace-nowrap flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin ({privileges.length})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}export function MobileSidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}) {
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const dynamicTeacherItems = useDynamicTeacherItems();
  const dynamicAdminItems = useDynamicAdminItems();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-background border-r border-border
          transition-transform duration-300 ease-in-out z-[70]
          md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full pt-16">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Pyson</h2>
            {dynamicAdminItems.length > 0 && (
              <p className="text-xs text-neutral-300 font-medium mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Panel Admin
              </p>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {/* Menú estático */}
              {STATIC_MENU_ITEMS.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={currentView === item.view}
                  shouldExpand={true}
                  onViewChange={onViewChange}
                  onClose={onClose}
                />
              ))}

              {/* Sección Profesor */}
              <TeacherSection
                dynamicTeacherItems={dynamicTeacherItems}
                currentView={currentView}
                shouldExpand={true}
                teacherOpen={teacherOpen}
                setTeacherOpen={setTeacherOpen}
                onViewChange={onViewChange}
                onClose={onClose}
                isMobile
              />

              {/* Administración Dinámica */}
              <AdminSection
                dynamicAdminItems={dynamicAdminItems}
                currentView={currentView}
                shouldExpand={true}
                adminOpen={adminOpen}
                setAdminOpen={setAdminOpen}
                onViewChange={onViewChange}
                onClose={onClose}
                isMobile
              />
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Pyson Learning Platform</p>
              <p className="text-[10px]">Versión 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}