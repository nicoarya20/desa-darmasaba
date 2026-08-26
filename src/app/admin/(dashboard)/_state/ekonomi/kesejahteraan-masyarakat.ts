/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// 1. Schema validasi dengan Zod (tanpa kategori)
const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  imageId: z.string().nonempty(),
  imageIds: z.array(z.string()),
  linkVideo: z.string().optional(),
});

// 2. Default value form (hindari uncontrolled input)
const defaultForm = {
  judul: "",
  deskripsi: "",
  imageId: "",
  content: "",
  imageIds: [] as string[],
  linkVideo: "",
};

const kesejahteraan = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(kesejahteraan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kesejahteraan.create.loading = true;
        const res = await ApiFetch.api.ekonomi.kesejahteraanmasyarakat[
          "create"
        ].post(kesejahteraan.create.form);
        if (res.status === 200) {
          kesejahteraan.findMany.load();
          return toast.success("Program kesejahteraan berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan program kesejahteraan");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        kesejahteraan.create.loading = false;
      }
    },
    resetForm() {
      kesejahteraan.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      const startTime = Date.now();
      kesejahteraan.findMany.loading = true;
      kesejahteraan.findMany.page = page;
      kesejahteraan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.kesejahteraanmasyarakat[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kesejahteraan.findMany.data = res.data.data ?? [];
          kesejahteraan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kesejahteraan.findMany.data = [];
          kesejahteraan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kesejahteraan paginated:", err);
        kesejahteraan.findMany.data = [];
        kesejahteraan.findMany.totalPages = 1;
      } finally {
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          kesejahteraan.findMany.loading = false;
        }, delay);
      }
    },
  },

  findUnique: {
    data: null as Prisma.KesejahteraanMasyarakatGetPayload<{
      include: {
        image: true;
        images: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/kesejahteraanmasyarakat/${id}`);
        if (res.ok) {
          const data = await res.json();
          kesejahteraan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch kesejahteraan:", res.statusText);
          kesejahteraan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching kesejahteraan:", error);
        kesejahteraan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kesejahteraan.delete.loading = true;

        const res = await (
          ApiFetch.api.ekonomi.kesejahteraanmasyarakat as any
        )["delete"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Program kesejahteraan berhasil dihapus");
          await kesejahteraan.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal menghapus program kesejahteraan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus program kesejahteraan");
      } finally {
        kesejahteraan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/ekonomi/kesejahteraanmasyarakat/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            judul: data.judul,
            deskripsi: data.deskripsi,
            content: data.content,
            imageId: data.imageId || "",
            imageIds: data.images?.map((img: any) => img.id) || [],
            linkVideo: data.linkVideo || "",
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kesejahteraan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data",
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(kesejahteraan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kesejahteraan.edit.loading = true;

        const response = await fetch(
          `/api/ekonomi/kesejahteraanmasyarakat/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsi: this.form.deskripsi,
              content: this.form.content,
              imageId: this.form.imageId,
              imageIds: this.form.imageIds,
              linkVideo: this.form.linkVideo,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update program kesejahteraan");
          await kesejahteraan.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update program kesejahteraan");
        }
      } catch (error) {
        console.error("Error updating kesejahteraan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update program kesejahteraan",
        );
        return false;
      } finally {
        kesejahteraan.edit.loading = false;
      }
    },

    reset() {
      kesejahteraan.edit.id = "";
      kesejahteraan.edit.form = { ...defaultForm };
    },
  },
  findFirst: {
    data: null as Prisma.KesejahteraanMasyarakatGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    loading: false,
    loaded: false,
    async load() {
      this.loading = true;
      try {
        const res = await ApiFetch.api.ekonomi.kesejahteraanmasyarakat[
          "find-first"
        ].get();

        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data || null;
        } else {
          this.data = null;
        }
      } catch (err) {
        console.error("Gagal fetch kesejahteraan terbaru:", err);
        this.data = null;
      } finally {
        this.loading = false;
        this.loaded = true;
      }
    },
  },
  findRecent: {
    data: [] as Prisma.KesejahteraanMasyarakatGetPayload<{
      include: {
        image: true;
      };
    }>[],
    loading: false,

    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.kesejahteraanmasyarakat[
          "find-recent"
        ].get();
        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data ?? [];
        }
      } catch (error) {
        console.error("Gagal fetch kesejahteraan recent:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});

// State global
const stateKesejahteraanMasyarakat = proxy({
  kesejahteraan,
});

export default stateKesejahteraanMasyarakat;
