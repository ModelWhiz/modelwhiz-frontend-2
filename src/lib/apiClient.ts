// modelwhiz-frontend/src/lib/apiClient.ts
import axios from 'axios'
import environment from '@/config/environment';
import { handleApiError, logError, type AppError } from './errorHandler';

const API_BASE_URL = environment.API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Added: Request timeout after 15 seconds
});

// This interceptor will handle API errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = handleApiError(error);
    logError(appError, 'API Client');
    
    // Return a standardized error object
    return Promise.reject(appError);
  }
);

interface StartEvaluationPayload {
  modelFile: File;
  datasetFile: File;
  modelName: string;
  targetColumn: string;
  userId: string;
  preprocessorFile?: File | null;
  splitData: boolean;
}

export default apiClient

export const startEvaluation = async (payload: StartEvaluationPayload) => {
  const formData = new FormData();
  formData.append('model_file', payload.modelFile);
  formData.append('dataset', payload.datasetFile);
  formData.append('model_name', payload.modelName);
  formData.append('target_column', payload.targetColumn);
  formData.append('user_id', payload.userId);
  
  if (payload.preprocessorFile) {
    formData.append('preprocessor_file', payload.preprocessorFile);
  }

  formData.append('split_data', String(payload.splitData)); 

  const response = await apiClient.post('/evaluations/start', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getJobStatus = async (jobId: number) => {
  const response = await apiClient.get(`/evaluations/${jobId}/status`);
  return response.data;
};

export const getJobResults = async (jobId: number) => {
  const response = await apiClient.get(`/evaluations/${jobId}/results`);
  return response.data;
};