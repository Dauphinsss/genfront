import axios from 'axios';
import type { Lesson } from './lessons';
import { API_BASE_URL } from '@/config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyson_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Unit {
  id: number;
  title: string;
  index: number;
  courseBaseId: number;
  createdAt?: string;
  updatedAt?: string;
  lessons?: Lesson[];
}

export const createUnit = async (data: { title: string; courseBaseId: number; index: number }): Promise<Unit> => {
  const response = await axios.post(`${API_BASE_URL}/units`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getUnitsByCourseId = async (courseId: number): Promise<Unit[]> => {
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/units`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateUnit = async (id: number, data: { title: string }): Promise<Unit> => {
  const response = await axios.patch(`${API_BASE_URL}/units/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteUnit = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/units/${id}`, {
    headers: getAuthHeaders(),
  });
};