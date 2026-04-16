import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorResponse, ApiSuccessResponse } from '../types/api';
import type { AuthResponse } from '../types/models';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
let refreshPromise: Promise<AxiosResponse<ApiSuccessResponse<AuthResponse>>> | null = null;

const api = axios.create({
  baseURL: apiBaseUrl,
});

const clearAuthAndRedirect = () => {
  localStorage.removeItem('nh_token');
  localStorage.removeItem('nh_refresh_token');

  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nh_token');

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const statusCode = error.response?.status;
    const refreshToken = localStorage.getItem('nh_refresh_token');
    const requestUrl = originalRequest?.url || '';
    const hasApiKeyHeader =
      Boolean(originalRequest?.headers?.['X-API-Key']) ||
      Boolean(originalRequest?.headers?.['x-api-key']);
    const isRefreshRequest = requestUrl.includes('/api/auth/refresh');
    const isLoginRequest = requestUrl.includes('/api/auth/login');
    const isRegisterRequest = requestUrl.includes('/api/auth/register');

    if (
      statusCode === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isLoginRequest &&
      !isRegisterRequest &&
      !hasApiKeyHeader
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          axios.post<ApiSuccessResponse<AuthResponse>>(`${apiBaseUrl}/api/auth/refresh`, {
            refreshToken,
          });

        const refreshResponse = await refreshPromise;
        const newAccessToken = refreshResponse.data.data.accessToken;

        localStorage.setItem('nh_token', newAccessToken);
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);

        return api(originalRequest);
      } catch (refreshError) {
        const typedRefreshError = refreshError as AxiosError<ApiErrorResponse>;
        clearAuthAndRedirect();
        return Promise.reject(typedRefreshError.response?.data ?? typedRefreshError);
      } finally {
        refreshPromise = null;
      }
    }

    if (statusCode === 401 && !hasApiKeyHeader) {
      clearAuthAndRedirect();
    }

    return Promise.reject(error.response?.data ?? error);
  },
);

export default api;
