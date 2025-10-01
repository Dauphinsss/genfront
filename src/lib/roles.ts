import { User, Role, UserRoleType } from '@/types/user';

export const ROLE_NAMES = {
  STUDENT: 'estudiante',
  TEACHER: 'docente', 
  ADMIN: 'administrador'
} as const;

export const ROLE_HIERARCHY = {
  [ROLE_NAMES.STUDENT]: 1,
  [ROLE_NAMES.TEACHER]: 2,
  [ROLE_NAMES.ADMIN]: 3
} as const;

/**
 * Determina el rol principal del usuario basado en jerarquía
 */
export function getPrimaryRole(roles: Role[]): UserRoleType {
  if (!roles || roles.length === 0) return ROLE_NAMES.STUDENT;
  
  // Ordenar por jerarquía y tomar el más alto
  const sortedRoles = roles.sort((a, b) => 
    (ROLE_HIERARCHY[b.name as UserRoleType] || 0) - (ROLE_HIERARCHY[a.name as UserRoleType] || 0)
  );
  
  return (sortedRoles[0]?.name as UserRoleType) || ROLE_NAMES.STUDENT;
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(user: User, roleName: UserRoleType): boolean {
  return user.roles?.some(role => role.name === roleName) || false;
}

/**
 * Verifica si el usuario es administrador
 */
export function isAdmin(user: User): boolean {
  return hasRole(user, ROLE_NAMES.ADMIN);
}

/**
 * Verifica si el usuario es docente
 */
export function isTeacher(user: User): boolean {
  return hasRole(user, ROLE_NAMES.TEACHER);
}

/**
 * Verifica si el usuario es estudiante
 */
export function isStudent(user: User): boolean {
  return hasRole(user, ROLE_NAMES.STUDENT);
}

/**
 * Obtiene los nombres de roles del usuario
 */
export function getRoleNames(user: User): string[] {
  return user.roles?.map(role => role.name) || [];
}

/**
 * Verifica si el usuario tiene permisos de administración
 */
export function canManageUsers(user: User): boolean {
  return isAdmin(user);
}

/**
 * Obtiene el color del badge según el rol
 */
export function getRoleBadgeVariant(roleName: string): "default" | "secondary" | "destructive" | "outline" {
  switch (roleName) {
    case ROLE_NAMES.ADMIN:
      return "destructive";
    case ROLE_NAMES.TEACHER:
      return "default";
    case ROLE_NAMES.STUDENT:
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Traduce el nombre del rol al español
 */
export function translateRole(roleName: string): string {
  switch (roleName) {
    case ROLE_NAMES.ADMIN:
      return "Administrador";
    case ROLE_NAMES.TEACHER:
      return "Docente";
    case ROLE_NAMES.STUDENT:
      return "Estudiante";
    default:
      return roleName;
  }
}