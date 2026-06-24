import { apiClient } from '@/api/client';

export interface MenuItemDto {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
}

export const createMenuItem = async (item: MenuItemDto): Promise<MenuItemDto> => {
  const response = await apiClient.post<MenuItemDto>('/api/v1/admin/menu-items', item);
  return response.data;
};

export const updateMenuItem = async (id: string, item: MenuItemDto): Promise<MenuItemDto> => {
  const response = await apiClient.put<MenuItemDto>(`/api/v1/admin/menu-items/${id}`, item);
  return response.data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/menu-items/${id}`);
};