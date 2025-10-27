/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKategoriPengumuman = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriPengumuman = {
  name: "",
};

const category = proxy({
  create: {
    form: { ...defaultKategoriPengumuman },
    loading: false,
    async create() {
      const cek = templateKategoriPengumuman.safeParse(category.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        category.create.loading = true;
        const res = await ApiFetch.api.desa.kategoripengumuman["create"].post(
          category.create.form
        );
        if (res.status === 200) {
          category.findMany.load();
          return toast.success("Data Kategori Pengumuman Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        category.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as (Prisma.CategoryPengumumanGetPayload<{
      omit: {
        isActive: true;
      };
    }> & {
      _count: {
        pengumumans: number;
      };
    })[],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {  // Change to arrow function
      category.findMany.loading = true;  // Use the full path to access the property
      category.findMany.page = page;
      category.findMany.search = search;
      try {
        const res = await ApiFetch.api.desa.kategoripengumuman[
          "findMany"
        ].get({
          query: { page, limit },
        });
  
        if (res.status === 200 && res.data?.success) {
          category.findMany.data = res.data.data || [];
          category.findMany.total = res.data.total || 0;
          category.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load potensi desa:", res.data?.message);
          category.findMany.data = [];
          category.findMany.total = 0;
          category.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading potensi desa:", error);
        category.findMany.data = [];
        category.findMany.total = 0;
        category.findMany.totalPages = 1;
      } finally {
        category.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.CategoryPengumumanGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/kategoripengumuman/${id}`);
        if (res.ok) {
          const data = await res.json();
          category.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          category.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        category.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        category.delete.loading = true;

        const response = await fetch(`/api/desa/kategoripengumuman/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Data Kategori Pengumuman berhasil dihapus"
          );
          await category.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus Data Kategori Pengumuman"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus Data Kategori Pengumuman"
        );
      } finally {
        category.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriPengumuman },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/kategoripengumuman/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori pengumuman:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriPengumuman.safeParse(category.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        category.update.loading = true;

        const response = await fetch(
          `/api/desa/kategoripengumuman/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update data kategori pengumuman");
          await category.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data kategori pengumuman"
          );
        }
      } catch (error) {
        console.error("Error updating data kategori pengumuman:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori pengumuman"
        );
        return false;
      } finally {
        category.update.loading = false;
      }
    },
    reset() {
      category.update.id = "";
      category.update.form = { ...defaultKategoriPengumuman };
    },
  },
});

const templateFormPengumuman = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  categoryPengumumanId: z.string().nonempty(),
});

const defaultForm = {
  judul: "",
  deskripsi: "",
  content: "",
  categoryPengumumanId: "",
};
const pengumuman = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateFormPengumuman.safeParse(pengumuman.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pengumuman.create.loading = true;
        const res = await ApiFetch.api.desa.pengumuman["create"].post(
          pengumuman.create.form
        );
        if (res.status === 200) {
          pengumuman.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pengumuman.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PengumumanGetPayload<{
          include: {
            CategoryPengumuman: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "", kategori = "") => {
      pengumuman.findMany.loading = true; // ✅ Akses langsung via nama path
      pengumuman.findMany.page = page;
      pengumuman.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;
    
        const res = await ApiFetch.api.desa.pengumuman["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          pengumuman.findMany.data = res.data.data ?? [];
          pengumuman.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          pengumuman.findMany.data = [];
          pengumuman.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch pengumuman paginated:", err);
        pengumuman.findMany.data = [];
        pengumuman.findMany.totalPages = 1;
      } finally {
        pengumuman.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PengumumanGetPayload<{
      include: {
        CategoryPengumuman: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/pengumuman/${id}`);
        if (res.ok) {
          const data = await res.json();
          pengumuman.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch pengumuman:", res.statusText);
          pengumuman.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching pengumuman:", error);
        pengumuman.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengumuman.delete.loading = true;

        const response = await fetch(`/api/desa/pengumuman/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pengumuman berhasil dihapus");
          await pengumuman.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pengumuman");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengumuman");
      } finally {
        pengumuman.delete.loading = false;
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
        const response = await fetch(`/api/desa/pengumuman/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

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
            categoryPengumumanId: data.categoryPengumumanId || "",
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading pengumuman:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateFormPengumuman.safeParse(pengumuman.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pengumuman.edit.loading = true;

        const response = await fetch(`/api/desa/pengumuman/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: this.form.judul,
            deskripsi: this.form.deskripsi,
            content: this.form.content,
            categoryPengumumanId: this.form.categoryPengumumanId || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update pengumuman");
          await pengumuman.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update pengumuman");
        }
      } catch (error) {
        console.error("Error updating pengumuman:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update pengumuman"
        );
        return false;
      } finally {
        pengumuman.edit.loading = false;
      }
    },

    reset() {
      pengumuman.edit.id = "";
      pengumuman.edit.form = { ...defaultForm };
    },
  },
  findFirst: {
    data: null as Prisma.PengumumanGetPayload<{
      include: {
        CategoryPengumuman: true;
      };
    }> | null,
    loading: false,
    async load() {
      this.loading = true;
      try {
        const res = await ApiFetch.api.desa.pengumuman["find-first"].get();
        if (res.status === 200 && res.data?.success) {
          // Add type assertion to ensure type safety
          pengumuman.findFirst.data = res.data
            .data as Prisma.PengumumanGetPayload<{
            include: {
              CategoryPengumuman: true;
            };
          }> | null;
        }
      } catch (err) {
        console.error("Gagal fetch pengumuman terbaru:", err);
      } finally {
        this.loading = false;
      }
    },
  },
  findRecent: {
    data: [] as Prisma.PengumumanGetPayload<{
      include: {
        CategoryPengumuman: true;
      };
    }>[],
    loading: false,

    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.desa.pengumuman["find-recent"].get();
        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data ?? [];
        }
      } catch (error) {
        console.error("Gagal fetch pengumuman recent:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});

const stateDesaPengumuman = proxy({
  category,
  pengumuman,
});
export default stateDesaPengumuman;
