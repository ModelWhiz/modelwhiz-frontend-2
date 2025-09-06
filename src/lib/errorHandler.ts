// Error handling utilities for the frontend

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class CustomError extends Error {
  public code?: string;
  public statusCode?: number;
  public details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.detail || error.response.data?.message || 'Server error occurred',
      code: error.response.data?.code || 'SERVER_ERROR',
      statusCode: error.response.status,
      details: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response from server. Please check your network connection.',
      code: 'NETWORK_ERROR',
      statusCode: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export const logError = (error: AppError, context?: string) => {
  console.error(`[${context || 'App'}] Error:`, {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    timestamp: new Date().toISOString()
  });
};

export const isNetworkError = (error: AppError): boolean => {
  return error.code === 'NETWORK_ERROR' || error.statusCode === 0;
};

export const isServerError = (error: AppError): boolean => {
  return error.statusCode ? error.statusCode >= 500 : false;
};

export const isClientError = (error: AppError): boolean => {
  return error.statusCode ? error.statusCode >= 400 && error.statusCode < 500 : false;
};
