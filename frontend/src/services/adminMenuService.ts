import { apiClient } from '@/api/client';
// The original import 'import { MenuItemDto } from '../types';' causes TS2307 because the module '../types'
// or its corresponding type declarations cannot be found in the provided codebase context.
// Based on the pattern observed in `frontend/src/services/reservationService.ts` where types are defined
// directly within the service file, and the absence of a 'src/types' directory or file in the context,
// the `MenuItemDto` interface is defined here to resolve the compilation error.

export interface MenuItemDto {
  id?: string; // ID is optional for creation, but typically present for updates/deletes
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  // Add any other properties relevant to a menu item DTO as needed by the backend contract
  // e.g., imageUrl?: string;
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