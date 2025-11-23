import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("pyson_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface AdminCourseBase {
  id: number;
  title: string;
  status: "activo" | "inactivo" | "historico";
}

export const getActiveCourse = async (): Promise<AdminCourseBase | null> => {
  const response = await axios.get(`${API_BASE_URL}/courses/active`, {
    headers: getAuthHeaders(),
  });
  const data = response.data;
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
};

export const getInactiveCourse = async (): Promise<AdminCourseBase | null> => {
  const response = await axios.get(`${API_BASE_URL}/courses/inactive`, {
    headers: getAuthHeaders(),
  });
  return response.data || null;
};

export const getHistoricCourses = async (): Promise<AdminCourseBase[]> => {
  const response = await axios.get(`${API_BASE_URL}/courses/historic`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const cloneActiveCourse = async (): Promise<void> => {
  await axios.post(`${API_BASE_URL}/courses/clone`, {}, {
    headers: getAuthHeaders(),
  });
};

export const activateInactiveCourse = async (): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/courses/activate`, {}, {
    headers: getAuthHeaders(),
  });
};