import axios from 'axios';
import type {
  Topic,
  CreateTopicDto,
  CreateContentDto,
  UpdateContentDto,
  UploadResourceResponse,
  TopicType,
  HistoricContent,
  Content
} from '@/types/topic';

const API_BASE_URL = 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyson_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar y redirigir
      localStorage.removeItem('pyson_token');
      localStorage.removeItem('pyson_user');
      localStorage.removeItem('pyson_privileges');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

{ }

export const createTopic = async (data: CreateTopicDto): Promise<Topic> => {
  const response = await axios.post(`${API_BASE_URL}/topics`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllTopics = async (type?: TopicType): Promise<Topic[]> => {
  const url = type ? `${API_BASE_URL}/topics?type=${type}` : `${API_BASE_URL}/topics/catalog/available`;
  const response = await axios.get(url, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getTopicById = async (id: number): Promise<Topic> => {
  const response = await axios.get(`${API_BASE_URL}/topics/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateTopic = async (id: number, data: Partial<CreateTopicDto>): Promise<Topic> => {
  const response = await axios.patch(`${API_BASE_URL}/topics/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteTopic = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/topics/${id}`, {
    headers: getAuthHeaders(),
  });
};

{ }

export const createContent = async (topicId: number, data: CreateContentDto): Promise<Topic> => {
  const response = await axios.post(`${API_BASE_URL}/content/topic/${topicId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getContentByTopicId = async (topicId: number): Promise<Topic> => {
  const response = await axios.get(`${API_BASE_URL}/content/topic/${topicId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateContent = async (contentId: number, data: UpdateContentDto): Promise<void> => {
  await axios.put(`${API_BASE_URL}/content/${contentId}`, data, {
    headers: getAuthHeaders(),
  });
};

export const deleteContent = async (contentId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/content/${contentId}`, {
    headers: getAuthHeaders(),
  });
};

{}

export const uploadResource = async (
  contentId: number, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResourceResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_BASE_URL}/content/${contentId}/resource`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }
  );
  return response.data;
};




export const getResourcesByContentId = async (contentId: number) => {
  const response = await axios.get(`${API_BASE_URL}/content/${contentId}/resources`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteResource = async (resourceId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/content/resource/${resourceId}`, {
    headers: getAuthHeaders(),
  });
};

// Historial de contenido
export const getContentHistory = async (contentId: number): Promise<HistoricContent[]> => {
  const response = await axios.get(`${API_BASE_URL}/content/${contentId}/history`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const restoreContentVersion = async (
  contentId: number,
  historyId: number,
  restoredBy: string,
  changeSummary?: string
): Promise<Content> => {
  const response = await axios.post(
    `${API_BASE_URL}/content/${contentId}/restore/${historyId}`,
    {
      restoredBy,
      changeSummary: changeSummary || "Restauró una versión anterior",
    },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};
