"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  currentView?: "inicio" | "perfil" | "pasados";
  onViewChange?: (view: "inicio" | "perfil" | "pasados") => void;
  onToggleTheme?: () => void;
  onLogout?: () => void; // Added onLogout prop
  isDark?: boolean;
}

export function Header({
  user,
  currentView = "inicio",
  onViewChange,
  onToggleTheme,
  onLogout,
  isDark,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtrar currentView para mostrar solo las opciones del menú
  const menuCurrentView = currentView === "pasados" ? "inicio" : currentView;

  if (!user) {
    return (
      <header className="w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-foreground">Pyson</div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="w-9 h-9 p-0"
            >
              {isDark ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-foreground">Pyson</div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onViewChange?.("inicio")}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                menuCurrentView === "inicio"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => onViewChange?.("perfil")}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                menuCurrentView === "perfil"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Perfil
            </button>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cerrar sesión
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="w-9 h-9 p-0 hidden sm:flex"
            >
              {isDark ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </Button>

            <div className="hidden md:flex items-center space-x-3">
              <img
                src={user.avatar || "/placeholder.svg?height=32&width=32"}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-border"
              />
              <span className="text-sm font-medium">{user.name}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 p-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2">
                <img
                  src={user.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-border"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  onViewChange?.("inicio");
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                  menuCurrentView === "inicio"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => {
                  onViewChange?.("perfil");
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                  menuCurrentView === "perfil"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                Perfil
              </button>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Tema
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTheme}
                  className="w-9 h-9 p-0"
                >
                  {isDark ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </Button>
              </div>
              <button
                onClick={() => {
                  onLogout?.();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
