export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

import { apiClient } from '@/api/client';

export async function login(credentials: AuthRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
  return response.data;
}