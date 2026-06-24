import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useMenuItems } from '@/hooks/useMenu';
import { MenuItemDto } from '@/types/menu'; // MenuItemDto is defined in '@/types/menu'

// The local MenuItemDto definition is removed as the canonical type is imported from adminMenuService.

// Define MenuItemCategory locally as a type alias and a runtime object to resolve TS1294
export type MenuItemCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE' | 'COCKTAIL';

export const MenuItemCategory = {
  APPETIZER: 'APPETIZER' as MenuItemCategory,
  MAIN_COURSE: 'MAIN_COURSE' as MenuItemCategory,
  DESSERT: 'DESSERT' as MenuItemCategory,
  BEVERAGE: 'BEVERAGE' as MenuItemCategory,
  COCKTAIL: 'COCKTAIL' as MenuItemCategory,
};

// Define a local DisplayMenuItemDto that includes imageUrl and uses the local MenuItemCategory,
// as the UI expects it and useMenuItems returns items that need transformation.
interface DisplayMenuItemDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory; // Use the local enum type
  imageUrl: string;
}

const MenuPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MenuItemCategory | undefined>(undefined);
  const { data, isLoading, isError } = useMenuItems(selectedCategory);

  // Map MenuItemDto (from useMenuItems) to DisplayMenuItemDto, adding a default imageUrl
  // and casting the category string to MenuItemCategory.
  // The 'item' parameter is now correctly typed as MenuItemDto from adminMenuService,
  // which has 'id?: string' and 'description?: string'.
  // We assert 'item.id!' as it should always be present for fetched items,
  // and provide a default for 'description' if it's undefined.
  const menuItems: DisplayMenuItemDto[] | undefined = data?.map((item: MenuItemDto) => ({
    id: item.id!, // Assert id is present for display, as it's optional in MenuItemDto
    name: item.name,
    description: item.description || '', // Provide default empty string if description is undefined
    price: item.price,
    category: item.category as MenuItemCategory, // Cast string from API to local MenuItemCategory type
    imageUrl: 'https://via.placeholder.com/300x200?text=No+Image', // Default placeholder image
  }));

  const categories = [
    { label: 'All', value: undefined },
    ...Object.values(MenuItemCategory).map((category) => ({
      label: category.replace(/_/g, ' '),
      value: category,
    })),
  ];

  return (
    <Layout>
      <div className="bg-[#1A1A1A] text-[#F5F5F5] min-h-screen">
        {/* Header Section */}
        <div className="py-16 text-center">
          <h1 className="text-5xl font-extrabold text-[#FFB800]">Our Menu</h1>
          <p className="text-xl text-gray-300 mt-4">Crafted Cocktails & Culinary Delights for the Discerning Palate.</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 px-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${selectedCategory === cat.value
                  ? 'bg-[#FFB800] text-[#1A1A1A]'
                  : 'border border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-[#1A1A1A]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="container mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="text-center text-xl text-[#FFB800]">Loading menu items...</div>
          ) : isError ? (
            <div className="text-center text-xl text-red-500">
              Could not load the menu at this time. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems?.map((item: DisplayMenuItemDto) => ( // Explicitly type item as DisplayMenuItemDto
                <div key={item.id} className="bg-[#1c1c1e] rounded-lg overflow-hidden shadow-lg">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#FFB800]">{item.name}</h3>
                    <p className="text-sm text-gray-300 mt-2">{item.description}</p>
                    <p className="text-lg font-semibold text-[#00A9FF] mt-4">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MenuPage;