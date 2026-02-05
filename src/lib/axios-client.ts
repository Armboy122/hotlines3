/**
 * Axios Client for Backend API
 * Handles HTTP requests to the backend with interceptors for auth and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiUrl } from './api-config';

/**
 * Axios instance configured for backend API
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(''),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Prepares requests before they are sent
 * - Adds authentication tokens (future)
 * - Logs requests in debug mode
 */
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token when available
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // Debug logging (optional)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Processes responses before they reach the calling code
 * - Extracts data from backend response format
 * - Handles success responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Backend API returns { success: true, data: {...} }
    // We want to extract just the data part
    if (response.data?.success === true) {
      return response.data.data;
    }

    // If response doesn't follow the expected format, return as-is
    return response.data;
  },
  (error: AxiosError) => {
    // Error Interceptor
    // Extracts error message from backend response format
    const errorMessage = extractErrorMessage(error);

    console.error('[API Error]', errorMessage);

    // Return a more user-friendly error
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Extract error message from Axios error
 */
function extractErrorMessage(error: AxiosError): string {
  // Backend error format: { success: false, error: { code, message } }
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.error?.message) {
      return data.error.message;
    }
    if (data.message) {
      return data.message;
    }
  }

  // Network error
  if (error.code === 'ECONNREFUSED') {
    return 'Cannot connect to backend API. Is the server running?';
  }

  if (error.code === 'ETIMEDOUT') {
    return 'Request timed out. Please try again.';
  }

  // Default error message
  return error.message || 'An unexpected error occurred';
}

/**
 * Export axios instance for custom requests if needed
 */
export { axios };
