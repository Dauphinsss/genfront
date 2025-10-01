export interface Role {
  role_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_role_id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  avatar: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export type UserRoleType = 'estudiante' | 'docente' | 'administrador';

export interface UserWithRoles extends User {
  roles: Role[];
  primaryRole: UserRoleType;
}