import ApiFetch from "@/lib/api-fetch";
import { hapusBerkas } from "@/lib/file-storage-delete.client";
import { proxy } from "valtio";

interface FileItem {
  id: string;
  name: string;
  path: string;
  link: string;
  mimeType: string;
  category: string;
  realName: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

const stateFileStorage = proxy<{
  list: FileItem[] | null;
  page: number;
  limit: number;
  total: number | undefined;
  load: (params?: { search?: string }) => Promise<void>;
  del: (params: { id: string }) => Promise<void>;
}>({
  list: null,
  page: 1,
  limit: 10,
  total: undefined,
  async load(params?: { search?: string }) {
    const { search = "" } = params ?? {};
    try {
      const { data } = await ApiFetch.api.fileStorage.findMany.get({
        query: {
          page: this.page,
          limit: this.limit,
          search,
          category: 'image'
        },
      });
      
      if (data?.data) {
        this.list = data.data as FileItem[];
        this.total = data.meta?.totalPages;
      }
    } catch (error) {
      console.error('Error loading files:', error);
      this.list = [];
      this.total = 0;
    }
  },
  async del({ id }: { id: string }) {
    await hapusBerkas(id);
    await this.load();
  },
});

export default stateFileStorage;
