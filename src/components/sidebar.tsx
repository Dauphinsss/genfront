"use client";

import { useState } from "react";
import { Home, Calendar, Settings, Archive } from "@/lib/icons";

interface SidebarProps {
  currentView: "inicio" | "perfil" | "pasados";
  onViewChange: (view: "inicio" | "perfil" | "pasados") => void;
  isCollapsed?: boolean;
}

export function Sidebar({
  currentView,
  onViewChange,
  isCollapsed = false,
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
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
        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => !item.disabled && onViewChange(item.view)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                      ${
                        item.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      ${!shouldExpand ? "justify-center" : ""}
                    `}
                    title={!shouldExpand ? item.label : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {shouldExpand && (
                      <span className="text-sm truncate whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Info */}
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
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile Sidebar Component
export function MobileSidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentView: "inicio" | "perfil" | "pasados";
  onViewChange: (view: "inicio" | "perfil" | "pasados") => void;
}) {
  const menuItems = [
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

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-background border-r border-border
          transition-transform duration-300 ease-in-out z-[70]
          md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full pt-16">
          {/* Logo/Header Area */}
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Pyson</h2>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        if (!item.disabled) {
                          onViewChange(item.view);
                          onClose();
                        }
                      }}
                      disabled={item.disabled}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }
                        ${
                          item.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Info */}
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
