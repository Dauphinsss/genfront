"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "@/lib/icons";
import { useEffect, useRef } from "react"

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  currentView?: string;
  onViewChange?: (view: string) => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  isDark?: boolean;
  onMenuToggle?: () => void;
}

export function Header({
  user,
  currentView = "inicio",
  onViewChange,
  onToggleTheme,
  onLogout,
  isDark,
  onMenuToggle,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuCurrentView = ["admin-users", "admin-privileges", "admin-courses", "pasados"].includes(currentView) 
    ? "inicio" 
    : currentView;

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-3">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
                className="w-10 h-10 p-0 hover:bg-secondary"
              >
                <Menu className="" />
              </Button>
            )}
            <a href="/" className="text-2xl font-bold text-foreground" aria-label="Ir a la página principal">
            Pyson
          </a>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onViewChange?.("inicio")}
              className={`text-sm font-medium transition-colors hover:text-foreground hover:cursor-pointer ${
                menuCurrentView === "inicio"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Inicio
            </button>
            
            <button
              onClick={() => onViewChange?.("perfil")}
              className={`text-sm font-medium transition-colors hover:text-foreground hover:cursor-pointer ${
                menuCurrentView === "perfil"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Perfil
            </button>

            <button
              onClick={onLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
            >
              Cerrar sesión
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="w-9 h-9 p-0 hidden sm:flex hover:cursor-pointer"
              aria-label="Cambiar tema"
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

            <div className="relative hidden md:block">
              <button
                onClick={() => setIsUserMenuOpen(v => !v)}
                className="flex items-center gap-3 focus:outline-none hover:cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="Abrir menú de usuario"  
              >
                <Image
                  src={user.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={user.name}
                width={32}
                height={32}
                  className="w-8 h-8 rounded-full border border-border"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </button>

              {isUserMenuOpen && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50"
                >
                  <button
                    onClick={() => {
                      onViewChange?.("perfil")
                      setIsUserMenuOpen(false)
                    }}
                    className={
                      `w-full text-left px-4 py-2 text-sm hover:bg-secondary hover:text-foreground hover:cursor-pointer`
                    }
                  >
                    Perfil
                  </button>

                  <button
                    onClick={() => {
                      onLogout?.()
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary hover:text-foreground hover:cursor-pointer"
                    role="menuitem"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>  

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 p-0"
              aria-label="Abrir menú móvil"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
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
              <a href="/settings" className="flex items-center space-x-3 px-3 py-2" aria-label="Ir a ajustes de perfil">
                <Image
                  src={user.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-border"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </a>
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
                aria-label="Ir a ajustes de perfil"
              >
                Configuración
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