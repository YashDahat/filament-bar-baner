import { apiClient } from '@/api/client';

export interface MenuItemDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export const getMenuItems = async (category?: string): Promise<MenuItemDto[]> => {
  const params = category ? { category } : {};
  const response = await apiClient.get<MenuItemDto[]>('/api/v1/menu-items', { params });
  return response.data;
};