import axios from 'axios';
import type { Unit } from './units';

const API_BASE_URL = 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyson_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface CourseBase {
  id: number;
  title: string;
  status: 'activo' | 'inactivo';
  createdAt?: string;
  updatedAt?: string;
  units?: Unit[];
}

export interface EditableCourseResponse {
  hasActiveCourse: boolean;
  activeCourseId: number | null;
  editableCourse: CourseBase | null;
  canEditDirectly: boolean;
  message: string;
}

export interface CloneCourseResponse {
  message: string;
  originalCourse: {
    id: number;
    title: string;
    status: string;
  };
  clonedCourse: CourseBase;
}

// Obtener el curso activo con toda su estructura
export const getActiveCourseBase = async (): Promise<CourseBase> => {
  const response = await axios.get(`${API_BASE_URL}/courses/active/full`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Obtener un curso específico por ID con toda su estructura
export const getCourseBaseById = async (courseId: number): Promise<CourseBase> => {
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/full`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Determinar qué curso se puede editar
export const getEditableCourse = async (): Promise<EditableCourseResponse> => {
  const response = await axios.get(`${API_BASE_URL}/courses/editable`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear una copia completa del curso
export const cloneCourse = async (courseId: number): Promise<CloneCourseResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/courses/${courseId}/clone`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// Activar un curso y desactivar todos los demás
export const activateCourse = async (courseId: number): Promise<CourseBase> => {
  const response = await axios.patch(
    `${API_BASE_URL}/courses/${courseId}/activate`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.course;
};

// Actualizar el título del curso
export const updateCourseBase = async (
  courseId: number,
  data: { title: string }
): Promise<CourseBase> => {
  const response = await axios.patch(`${API_BASE_URL}/courses/${courseId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Lista todos los cursos base
export const getAllCourseBases = async (): Promise<CourseBase[]> => {
  const response = await axios.get(`${API_BASE_URL}/courses`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear un nuevo curso base
export const createCourseBase = async (data: {
  title: string;
  status?: 'activo' | 'inactivo';
}): Promise<CourseBase> => {
  const response = await axios.post(`${API_BASE_URL}/courses`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};