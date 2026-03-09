/**
 * Admin Form State
 * 
 * State management untuk form di admin dashboard
 * Menggunakan Valtio untuk reactive state
 */

import { proxy } from "valtio";

export interface FileStorageItem {
  id: string;
  name: string;
  path: string;
  link: string;
  realName: string;
  mimeType: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ListItem {
  id: string;
  name: string;
  url: string;
  total: number;
  realName: string;
}

export const adminFormState = proxy<{
  list: ListItem[] | null;
  page: number;
  count: number;
  total: number | undefined;
  isLoading: boolean;
  error: string | null;
  load: (params?: { search?: string; page?: number }) => Promise<void>;
  del: (params: { id: string }) => Promise<void>;
  reset: () => void;
}>({
  list: null,
  page: 1,
  count: 10,
  total: undefined,
  isLoading: false,
  error: null,

  async load(params?: { search?: string; page?: number }) {
    const { search = "", page = this.page } = params ?? {};
    this.page = page;
    this.isLoading = true;
    this.error = null;

    try {
      // Import dinamis untuk menghindari circular dependency
      const ApiFetch = (await import('@/lib/api-fetch')).default;
      
      const response = await ApiFetch.api.fileStorage["findMany"].get({
        query: {
          page: this.page,
          search,
        },
      }) as { data: { data: FileStorageItem[]; meta: { total: number; totalPages: number } } };

      if (response?.data?.data) {
        this.list = response.data.data.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.link || `/api/fileStorage/${file.realName}`,
          total: response.data.meta?.total || 0,
          realName: file.realName,
        }));
        this.total = response.data.meta?.totalPages;
      }
    } catch (error) {
      console.error("Error loading images:", error);
      this.error = error instanceof Error ? error.message : 'Failed to load images';
      this.list = [];
    } finally {
      this.isLoading = false;
    }
  },

  async del({ id }: { id: string }) {
    try {
      const ApiFetch = (await import('@/lib/api-fetch')).default;
      await ApiFetch.api.fileStorage.delete({ id });
      await this.load({ page: this.page });
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  reset() {
    this.list = null;
    this.page = 1;
    this.count = 10;
    this.total = undefined;
    this.isLoading = false;
    this.error = null;
  },
});

// Helper hook untuk React components
export const useAdminForm = () => {
  return adminFormState;
};

export default adminFormState;
