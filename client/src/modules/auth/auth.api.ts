import api from '../../shared/lib/axios';
import type { ApiSuccessResponse } from '../../shared/types/api';
import type { ApiKeyResponse, AuthResponse } from '../../shared/types/models';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/api/auth/login', { email, password });
  return response.data.data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/api/auth/register', { name, email, password });
  return response.data.data;
}

export async function logout(): Promise<AuthResponse | null> {
  const refreshToken = localStorage.getItem('nh_refresh_token');

  if (!refreshToken) {
    return null;
  }

  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/api/auth/logout', { refreshToken });
  return response.data.data;
}

export async function generateApiKey(): Promise<ApiKeyResponse> {
  const response = await api.post<ApiSuccessResponse<ApiKeyResponse>>('/api/auth/api-key');
  return response.data.data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/api/auth/refresh', { refreshToken });
  return response.data.data;
}
