"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { UserWithRoles } from "@/types/user";
import { translateRole } from "@/lib/roles";
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  Eye,
  Bell
} from "lucide-react";

interface AdminHeaderProps {
  user: UserWithRoles;
  onLogout: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
  onMenuClick?: () => void;
}

export function AdminHeader({ 
  user, 
  onLogout, 
  onToggleTheme, 
  isDark,
  onMenuClick 
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">Pyson</h1>
          <Badge variant="destructive" className="text-xs">
            Admin
          </Badge>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Student View Link */}
          <Button 
            variant="outline" 
            size="sm"
            className="hidden sm:flex"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver sitio estudiante
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="w-4 h-4" />
          </Button>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleTheme}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {translateRole(user.primaryRole)}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}