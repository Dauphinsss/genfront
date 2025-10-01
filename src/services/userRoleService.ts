// Servicios para gestión de usuarios y roles
export interface UpdateUserRolesRequest {
  userId: number;
  roleIds: number[];
}

export interface UpdateUserRolesResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: {
      id: number;
      name: string;
      description: string;
    }[];
  };
}

export interface GetUsersResponse {
  success: boolean;
  users: {
    id: number;
    email: string;
    name: string | null;
    provider: string;
    providerId: string;
    createdAt: string;
    avatar: string | null;
    roles: {
      id: number;
      name: string;
      description: string;
      createdAt?: string;
      updatedAt?: string;
    }[];
  }[];
}

export interface GetRolesResponse {
  success: boolean;
  roles: {
    id: number;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export class UserRoleService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  /**
   * Obtiene el token de autenticación desde localStorage
   */
  private static getAuthToken(): string {
    // Buscar el token en diferentes lugares donde puede estar almacenado
    const token = localStorage.getItem('auth_token') || 
                 localStorage.getItem('pyson_token') || 
                 localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor inicia sesión nuevamente.');
    }
    
    return token;
  }

  /**
   * Maneja las respuestas de la API y los errores
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('auth_token');
        localStorage.removeItem('pyson_token');
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción.');
      }

      const errorData = await response.json().catch(() => ({ 
        message: `Error ${response.status}: ${response.statusText}` 
      }));
      
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Actualiza los roles de un usuario
   */
  static async updateUserRoles(request: UpdateUserRolesRequest): Promise<UpdateUserRolesResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/admin/users/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse<UpdateUserRolesResponse>(response);

    return response.json();
  }

  /**
   * Obtiene todos los usuarios con sus roles
   */
  static async getAllUsers(): Promise<GetUsersResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<GetUsersResponse>(response);
  }

  /**
   * Obtiene todos los roles disponibles
   */
  static async getAllRoles(): Promise<GetRolesResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/admin/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<GetRolesResponse>(response);
  }

  /**
   * Obtiene un usuario específico por ID
   */
  static async getUserById(userId: number): Promise<any> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<any>(response);
  }

  /**
   * Activa o desactiva un usuario
   */
  static async toggleUserStatus(userId: number, isActive: boolean): Promise<any> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive })
    });

    return this.handleResponse<any>(response);
  }
}