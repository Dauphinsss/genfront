import axios from 'axios';
import type { 
  Topic, 
  CreateTopicDto, 
  CreateContentDto, 
  UpdateContentDto,
  UploadResourceResponse,
  TopicType 
} from '@/types/topic';

const API_BASE_URL = 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyson_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

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

export const uploadJsonResource = async (
  contentId: number,
  obj: unknown,
  filename = "content.json"
): Promise<UploadResourceResponse> => {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const file = new File([blob], filename, { type: "application/json" });
  return uploadResource(contentId, file);
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
