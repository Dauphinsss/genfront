import axios from "axios";

const API_BASE_URL = "http://localhost:4000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("pyson_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Privilege {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  privileges: Privilege[];
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllPrivileges = async (): Promise<Privilege[]> => {
  const response = await axios.get(`${API_BASE_URL}/privileges`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const assignPrivilege = async (userId: number, privilegeId: number): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/privileges/assign`,
    { userId, privilegeId },
    { headers: getAuthHeaders() }
  );
};

export const removePrivilege = async (userId: number, privilegeId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/privileges/remove`, {
    headers: getAuthHeaders(),
    data: { userId, privilegeId },
  });
};