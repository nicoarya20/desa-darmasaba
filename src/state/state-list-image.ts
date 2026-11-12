import ApiFetch from "@/lib/api-fetch";
import { hapusBerkasKeSampah } from "@/lib/file-storage-delete.client";
import { proxy } from "valtio";

interface FileStorageItem {
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

interface ApiResponse {
  data: FileStorageItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ListItem {
  id: string;
  name: string;
  url: string;
  total: number;
  realName: string;
}

const stateListImage = proxy<{
  list: ListItem[] | null;
  page: number;
  count: number;
  total: number | undefined;
  load: (params?: { search?: string; page?: number }) => Promise<void>;
  del: (params: { id: string }) => Promise<void>;
}>({
  list: null,
  page: 1,
  count: 10,
  total: undefined,
  
  async load(params?: { search?: string; page?: number }) {
    const { search = "", page = this.page } = params ?? {};
    this.page = page;
    
    try {
      const response = await ApiFetch.api.fileStorage["findMany"].get({
        query: {
          page: this.page,
          search,
        },
      }) as { data: ApiResponse };

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
      this.list = [];
    }
  },
  
  async del({ id }: { id: string }) {
    await hapusBerkasKeSampah(id);
    await this.load({ page: this.page });
  },
});

export default stateListImage;
