"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { User, Role, UserRoleType } from "@/types/user";
import { 
  translateRole, 
  getRoleBadgeVariant, 
  ROLE_NAMES 
} from "@/lib/roles";
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  User as UserIcon,
  GraduationCap,
  Check,
  X
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Mock data - En producción esto vendría de tu API
const mockUsers: (User & { roles: Role[] })[] = [
  {
    user_id: "1",
    name: "Steven Castro",
    email: "steven@example.com",
    avatar: "",
    first_name: "Steven",
    last_name: "Castro",
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    roles: [
      {
        role_id: "1",
        name: "estudiante",
        description: "Estudiante de la plataforma",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
  },
  {
    user_id: "2",
    name: "María García",
    email: "maria@example.com",
    avatar: "",
    first_name: "María",
    last_name: "García",
    is_active: true,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    roles: [
      {
        role_id: "2",
        name: "docente",
        description: "Docente de la plataforma",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
  },
  {
    user_id: "3",
    name: "Carlos López",
    email: "carlos@example.com",
    avatar: "",
    first_name: "Carlos",
    last_name: "López",
    is_active: true,
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
    roles: [
      {
        role_id: "3",
        name: "administrador",
        description: "Administrador del sistema",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
  },
  {
    user_id: "4",
    name: "Ana Martínez",
    email: "ana@example.com",
    avatar: "",
    first_name: "Ana",
    last_name: "Martínez",
    is_active: true,
    created_at: "2024-01-12T10:00:00Z",
    updated_at: "2024-01-12T10:00:00Z",
    roles: [
      {
        role_id: "2",
        name: "docente",
        description: "Docente de la plataforma",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
  }
];

const availableRoles: Role[] = [
  {
    role_id: "1",
    name: "estudiante",
    description: "Estudiante de la plataforma",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    role_id: "2",
    name: "docente",
    description: "Docente de la plataforma",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    role_id: "3",
    name: "administrador",
    description: "Administrador del sistema",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

interface RoleAssignmentDialogProps {
  user: User & { roles: Role[] };
  onRoleUpdate: (userId: string, newRoles: Role[]) => void;
}

function RoleAssignmentDialog({ user, onRoleUpdate }: RoleAssignmentDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(user.roles || []);
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleToggle = (role: Role) => {
    setSelectedRoles(prev => {
      const exists = prev.find(r => r.role_id === role.role_id);
      if (exists) {
        return prev.filter(r => r.role_id !== role.role_id);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSave = () => {
    onRoleUpdate(user.user_id, selectedRoles);
    setIsOpen(false);
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case ROLE_NAMES.ADMIN:
        return Shield;
      case ROLE_NAMES.TEACHER:
        return GraduationCap;
      case ROLE_NAMES.STUDENT:
        return UserIcon;
      default:
        return UserIcon;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <Shield className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Gestionar Roles</span>
          <span className="sm:hidden">Roles</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Gestionar Roles - {user.name}</DialogTitle>
          <DialogDescription className="text-sm">
            Asigna o remueve roles para este usuario. Un usuario puede tener múltiples roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Roles Disponibles</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.some(r => r.role_id === role.role_id);
                const Icon = getRoleIcon(role.name);
                
                return (
                  <div 
                    key={role.role_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleRoleToggle(role)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {translateRole(role.name)}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<(User & { roles: Role[] })[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      selectedRoleFilter === "all" || 
      user.roles.some(role => role.name === selectedRoleFilter);

    return matchesSearch && matchesRole;
  });

  const handleRoleUpdate = async (userId: string, newRoles: Role[]) => {
    // Guardar roles originales para poder revertir en caso de error
    const originalUser = users.find(u => u.user_id === userId);
    const originalRoles = originalUser?.roles || [];

    try {
      // Optimistic update - actualizar UI inmediatamente
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, roles: newRoles }
            : user
        )
      );

      // Usar el servicio para actualizar roles
      const { UserRoleService } = await import('@/services/userRoleService');
      
      const result = await UserRoleService.updateUserRoles({
        userId: parseInt(userId),
        roleIds: newRoles.map(role => parseInt(role.role_id))
      });

      console.log('Roles actualizados exitosamente:', result);

      // Opcional: Actualizar con los datos del servidor si es necesario
      // setUsers(prev => 
      //   prev.map(user => 
      //     user.user_id === userId 
      //       ? { ...user, roles: result.user.roles }
      //       : user
      //   )
      // );

    } catch (error) {
      console.error('Error al actualizar roles:', error);
      
      // Revertir cambios en caso de error
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, roles: originalRoles }
            : user
        )
      );

      // Mostrar error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar los roles: ${errorMessage}`);
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
      user.roles.forEach(role => {
        acc[role.name] = (acc[role.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      total: users.length,
      estudiantes: stats[ROLE_NAMES.STUDENT] || 0,
      docentes: stats[ROLE_NAMES.TEACHER] || 0,
      administradores: stats[ROLE_NAMES.ADMIN] || 0
    };
  };

  const stats = getRoleStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.estudiantes}</div>
            <p className="text-xs text-muted-foreground">Rol predeterminado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Docentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.docentes}</div>
            <p className="text-xs text-muted-foreground">Creadores de contenido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.administradores}</div>
            <p className="text-xs text-muted-foreground">Acceso completo</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Administra roles, permisos y accesos de usuarios
              </p>
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="estudiante">Estudiantes</option>
              <option value="docente">Docentes</option>
              <option value="administrador">Administradores</option>
            </select>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div 
                key={user.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 gap-4"
              >
                {/* User Info Section */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="font-medium truncate">{user.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge 
                            key={role.role_id}
                            variant={getRoleBadgeVariant(role.name)}
                            className="text-xs"
                          >
                            {translateRole(role.name)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.roles.length} rol{user.roles.length !== 1 ? "es" : ""} asignado{user.roles.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <Badge 
                    variant={user.is_active ? "default" : "destructive"}
                    className="shrink-0"
                  >
                    {user.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                  
                  <RoleAssignmentDialog 
                    user={user}
                    onRoleUpdate={handleRoleUpdate}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                      <DropdownMenuItem>Editar usuario</DropdownMenuItem>
                      <DropdownMenuItem>Ver actividad</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        {user.is_active ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}