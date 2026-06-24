import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useMenuItems } from '@/hooks/useMenu';
// FIX: Removed MenuItemDto as it's not exported from adminMenuService. Define ServiceMenuItemDto locally.
import { createMenuItem, updateMenuItem, deleteMenuItem } from '@/services/adminMenuService';

// FIX 1: Changed enum to a type alias and a runtime object to resolve TS1294
// This allows Object.values(MenuItemCategory) to work at runtime while providing type safety.
export type MenuItemCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE' | 'COCKTAIL';

export const MenuItemCategory = {
  APPETIZER: 'APPETIZER' as MenuItemCategory,
  MAIN_COURSE: 'MAIN_COURSE' as MenuItemCategory,
  DESSERT: 'DESSERT' as MenuItemCategory,
  BEVERAGE: 'BEVERAGE' as MenuItemCategory,
  COCKTAIL: 'COCKTAIL' as MenuItemCategory,
};

// Define ServiceMenuItemDto locally, representing the type used by adminMenuService functions.
// This type does not include 'imageUrl' as it's not part of the backend DTO for mutations.
interface ServiceMenuItemDto {
  id?: string; // Optional for creation, present for existing items
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
  available: boolean;
}

// Define DisplayMenuItemDto locally, based on ServiceMenuItemDto but with imageUrl and required id
// This is to bridge the gap since '@/types/menu' is missing and useMenuItems returns items with imageUrl
// FIX: Adjusted description to reflect ServiceMenuItemDto as base.
interface DisplayMenuItemDto {
  id: string; // Assuming ID is always present for displayed items
  name: string;
  description: string; // Assuming description is always present for display
  price: number;
  category: MenuItemCategory; // Use the local enum
  imageUrl: string; // Present in display, but not in ServiceMenuItemDto for mutations
  available: boolean; // Assuming available is present for display
}

// Removed: interface MenuServiceMenuItemDto was causing type conflicts and is redundant.
// The useMenuItems hook returns AdminServiceMenuItemDto. // FIX: This comment is now outdated.

import Layout from '@/components/Layout'; // Fixed: changed to default import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// FIX 3: Inferred MenuItemFormValues interface from the Zod schema to resolve TS2322 and TS2345
type MenuItemFormValues = z.infer<typeof menuItemSchema>;

// Zod schema for form validation, incorporating all fields required by the instruction
// FIX: Removed explicit type annotation z.ZodSchema<MenuItemFormValues> to resolve circular reference TS2502.
// Zod's infer will correctly deduce MenuItemFormValues.
const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'), // Required as per DisplayMenuItemDto in types/menu.ts
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  category: z.nativeEnum(MenuItemCategory, {
    message: 'Category is required', // FIX: Changed 'invalid_type_error' to 'message' for Zod v4+ compatibility
  }),
  imageUrl: z.string().url('Must be a valid URL').min(1, 'Image URL is required'), // Required as per DisplayMenuItemDto in types/menu.ts
  available: z.boolean().default(true), // Required by form instruction and AdminServiceMenuItemDto
});


export const AdminMenuPage: React.FC = () => {
  // menuItems are ServiceMenuItemDto[] based on the useMenuItems hook (assuming it returns the backend DTO)
  const { data: menuItems, isLoading } = useMenuItems();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DisplayMenuItemDto | null>(null); // editingItem is DisplayMenuItemDto

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema), // FIX: Removed explicit generic type to resolve TS2322 and TS2558
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: MenuItemCategory.COCKTAIL, // Default category
      imageUrl: '',
      available: true, // Default for new items
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        category: editingItem.category,
        imageUrl: editingItem.imageUrl,
        available: editingItem.available,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: MenuItemCategory.COCKTAIL,
        imageUrl: '',
        available: true,
      });
    }
  }, [editingItem, form]);

  const createMutation = useMutation({
    mutationFn: createMenuItem, // Expects ServiceMenuItemDto
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; item: ServiceMenuItemDto }) => updateMenuItem(variables.id, variables.item), // Expects ServiceMenuItemDto
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const handleCreateClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // FIX 4a: Helper to transform ServiceMenuItemDto to DisplayMenuItemDto
  const mapToDisplayMenuItem = (item: ServiceMenuItemDto): DisplayMenuItemDto => ({
    id: item.id!, // Assert ID is present for existing items from the backend
    name: item.name,
    description: item.description || '', // Ensure description is a string
    price: item.price,
    category: item.category as MenuItemCategory, // Cast string category to enum
    imageUrl: '', // ServiceMenuItemDto does not have imageUrl, provide a default empty string
    available: item.available, // Use actual available status from ServiceMenuItemDto
  });

  // FIX 4b: Changed parameter type to ServiceMenuItemDto and transform before setting editingItem
  const handleEditClick = (item: ServiceMenuItemDto) => {
    setEditingItem(mapToDisplayMenuItem(item));
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: MenuItemFormValues) => {
    // Construct ServiceMenuItemDto for the mutation, omitting imageUrl as it's not in ServiceMenuItemDto
    const itemToSave: ServiceMenuItemDto = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category, // MenuItemCategory is a string enum, so this is fine
      available: data.available,
    };

    if (editingItem && editingItem.id) {
      updateMutation.mutate({ id: editingItem.id, item: itemToSave });
    } else {
      createMutation.mutate(itemToSave);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Menu Management</h1>

        <Button onClick={handleCreateClick} className="mb-6">
          Create New Item
        </Button>

        {isLoading ? (
          <div>Loading menu items...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead> {/* FIX 5: 'Available' column added back */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems?.map((item) => ( // item is ServiceMenuItemDto
                  <TableRow key={item.id!}> {/* FIX: Assert item.id is present for key */}
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.available ? 'Yes' : 'No'}</TableCell> {/* FIX 5: Display actual 'Available' status */}
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(item)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => item.id && handleDeleteClick(item.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" {...form.register('name')} className="col-span-3" />
                {form.formState.errors.name && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" {...form.register('description')} className="col-span-3" />
                {form.formState.errors.description && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input id="price" type="number" step="0.01" {...form.register('price')} className="col-span-3" />
                {form.formState.errors.price && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select onValueChange={(value: MenuItemCategory) => form.setValue('category', value)} value={form.watch('category')}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MenuItemCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">{form.formState.errors.category.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input id="imageUrl" {...form.register('imageUrl')} className="col-span-3" />
                {form.formState.errors.imageUrl && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="available" className="text-right">
                  Available
                </Label>
                <Switch
                  id="available"
                  checked={form.watch('available')}
                  onCheckedChange={(checked) => form.setValue('available', checked)}
                  className="col-span-3 justify-self-start"
                />
                {form.formState.errors.available && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">{form.formState.errors.available.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};