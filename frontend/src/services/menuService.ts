import { apiClient } from '@/api/client';
import { MenuItemDto } from '@/types/menu';

export async function getMenuItems(category?: string): Promise<MenuItemDto[]> {
  const params: { category?: string } = {};
  if (category) {
    params.category = category;
  }
  const response = await apiClient.get<MenuItemDto[]>('/api/v1/menu-items', { params });
  return response.data;
}