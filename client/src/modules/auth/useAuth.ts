import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from './auth.api';
import type { AuthResponse } from '../../shared/types/models';

export default function useAuth() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nh_token'));

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem('nh_token'));
    };

    window.addEventListener('storage', syncToken);

    return () => {
      window.removeEventListener('storage', syncToken);
    };
  }, []);

  const handleLogin = async (email: string, password: string): Promise<AuthResponse> => {
    const data = await authApi.login(email, password);

    localStorage.setItem('nh_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('nh_refresh_token', data.refreshToken);
    }

    setToken(data.accessToken);
    return data;
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('nh_token');
      localStorage.removeItem('nh_refresh_token');
      setToken(null);
      navigate('/login', { replace: true });
    }
  };

  return {
    token,
    isAuthenticated: Boolean(token),
    login: handleLogin,
    logout: handleLogout,
  };
}
