import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

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

export const getLessonsByUnitId = async (unitId: number): Promise<Lesson[]> => {
  const response = await axios.get(`${API_BASE_URL}/units/${unitId}/lessons`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createLesson = async (data: { title: string; index: number; unitId: number }): Promise<Lesson> => {
  const response = await axios.post(`${API_BASE_URL}/lessons`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateLesson = async (id: number, data: { title?: string; index?: number }): Promise<Lesson> => {
  const response = await axios.patch(`${API_BASE_URL}/lessons/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteLesson = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/lessons/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const getLessonById = async (id: number): Promise<Lesson> => {
  const response = await axios.get(`${API_BASE_URL}/lessons/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const associateTopicToLesson = async (lessonId: number, topicId: number, order?: number): Promise<LessonTopic> => {
  const response = await axios.post(
    `${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}`,
    { order: order ?? 0 },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const dissociateTopicFromLesson = async (lessonId: number, topicId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}`, {
    headers: getAuthHeaders(),
  });
};

export const getLessonTopics = async (lessonId: number): Promise<LessonTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/topics`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateTopicOrder = async (lessonId: number, topicId: number, order: number): Promise<LessonTopic> => {
  const response = await axios.patch(
    `${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}/order`,
    { order },
    { headers: getAuthHeaders() }
  );
  return response.data;
};