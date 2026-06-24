import { apiClient } from '@/api/client';
// The module '@/types/menu' could not be found, causing TS2307.
// This typically means the file 'src/types/menu.ts' is missing or inaccessible.
// To resolve this and allow the file to compile, MenuItemDto is defined locally.
// This also addresses TS2459 errors in other files that attempt to import MenuItemDto
// from this service module, indicating they expect it to be exported from here.
export interface MenuItemDto {
  id?: string; // Optional for creation, typically present for updates/retrievals
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  // Add any other properties that a MenuItemDto is expected to have
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
  await apiClient.delete<void>(`/api/v1/admin/menu-items/${id}`);
};