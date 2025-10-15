"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, LogOut, Sun, Moon } from "lucide-react";

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
  onViewChange,
  onToggleTheme,
  onLogout,
  isDark,
  onMenuToggle,
}: HeaderProps) {
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
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
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

            <Link href="/" className="text-2xl font-bold text-foreground">
              Pyson
            </Link>
          </div>

          <div className="flex items-center ">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="w-9 h-9 p-0 hover:cursor-pointer"
              aria-label="Cambiar tema"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-10"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[150px] truncate hidden md:block">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange?.("perfil")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onLogout?.()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
