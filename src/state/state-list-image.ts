import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";

const stateListImage = proxy<{
  list: { name: string; url: string; total: number }[] | null;
  page: number;
  count: number;
  total: number | undefined;
  load: (params?: { search?: string }) => Promise<void>;
  del: ({ name }: { name: string }) => Promise<void>;
}>({
  list: null,
  page: 1,
  count: 20,
  total: undefined,
  async load(params?: { search?: string }) {
    const { search = "" } = params ?? {};
    const { data } = await ApiFetch.api.imgs.get({
      query: {
        page: this.page,
        count: this.count,
        search,
      },
    });
    this.list = data;
    if (data?.[0]?.total) {
      this.total = Math.ceil(data[0].total / this.count);
    } else {
      this.total = undefined;
    }
  },
  async del({ name }: { name: string }) {
    await ApiFetch.api.img({ name }).delete();
    this.load();
  },
});

export default stateListImage;
