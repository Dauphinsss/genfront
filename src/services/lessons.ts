import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyson_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface LessonTopic {
  id: number;
  lessonId: number;
  topicId: number;
  order: number;
  createdAt: string;
  topic: {
    id: number;
    name: string;
    type: 'content' | 'evaluation';
    content?: {
      id: number;
      description?: string;
      htmlContent?: string;
      resources?: unknown[];
    };
  };
}

export interface Lesson {
  id: number;
  title: string;
  index: number;
  unitId: number;
  duration?: number | null;
  content?: string | null;
  lessonTopics?: LessonTopic[];
}

// Obtener lecciones de una unidad
export const getLessonsByUnitId = async (unitId: number): Promise<Lesson[]> => {
  const response = await axios.get(`${API_BASE_URL}/units/${unitId}/lessons`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear lección
export const createLesson = async (data: { title: string; index: number; unitId: number }): Promise<Lesson> => {
  const response = await axios.post(`${API_BASE_URL}/lessons`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Actualizar lección
export const updateLesson = async (id: number, data: { title?: string; index?: number }): Promise<Lesson> => {
  const response = await axios.patch(`${API_BASE_URL}/lessons/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar lección
export const deleteLesson = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/lessons/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Obtener lección completa con topics
export const getLessonById = async (id: number): Promise<Lesson> => {
  const response = await axios.get(`${API_BASE_URL}/lessons/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Asociar topic a lección
export const associateTopicToLesson = async (lessonId: number, topicId: number, order?: number): Promise<LessonTopic> => {
  const response = await axios.post(
    `${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}`,
    { order: order ?? 0 },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Desasociar topic de lección
export const dissociateTopicFromLesson = async (lessonId: number, topicId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}`, {
    headers: getAuthHeaders(),
  });
};

// Obtener topics de una lección
export const getLessonTopics = async (lessonId: number): Promise<LessonTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/topics`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Actualizar orden de un topic en la lección
export const updateTopicOrder = async (lessonId: number, topicId: number, order: number): Promise<LessonTopic> => {
  const response = await axios.patch(
    `${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}/order`,
    { order },
    { headers: getAuthHeaders() }
  );
  return response.data;
};