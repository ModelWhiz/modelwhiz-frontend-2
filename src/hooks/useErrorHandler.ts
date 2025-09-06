import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { type AppError, isNetworkError, isServerError, isClientError } from '@/lib/errorHandler';

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = useCallback((error: AppError | Error | any, context?: string) => {
    let appError: AppError;

    // Convert to AppError if needed
    if (error.message && (error.code || error.statusCode)) {
      appError = error as AppError;
    } else if (error instanceof Error) {
      appError = {
        message: error.message,
        code: 'UNKNOWN_ERROR'
      };
    } else {
      appError = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }

    // Determine toast status based on error type
    let status: 'error' | 'warning' | 'info' = 'error';
    let title = 'Error';
    
    if (isNetworkError(appError)) {
      title = 'Connection Error';
      status = 'warning';
    } else if (isServerError(appError)) {
      title = 'Server Error';
    } else if (isClientError(appError)) {
      title = 'Request Error';
      status = 'warning';
    }

    // Show toast notification
    toast({
      title,
      description: appError.message,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    // Log error for debugging
    console.error(`[${context || 'Component'}] Error:`, appError);
  }, [toast]);

  return { handleError };
};
