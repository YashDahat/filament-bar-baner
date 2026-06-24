import { useQuery } from '@tanstack/react-query';
import { getMenuItems } from '@/services/menuService';

export const useMenuItems = (category?: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['menuItems', category || 'all'],
    queryFn: () => getMenuItems(category),
  });

  return { data, isLoading, isError };
};