/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// 1. Schema validasi dengan Zod
const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  kategoriBeritaId: z.string().nonempty(),
  imageId: z.string().nonempty(),
  imageIds: z.array(z.string()),
  linkVideo: z.string().optional(),
});

// 2. Default value form berita (hindari uncontrolled input)
const defaultForm = {
  judul: "",
  deskripsi: "",
  imageId: "",
  content: "",
  kategoriBeritaId: "",
  imageIds: [] as string[],
  linkVideo: "",
};

// 4. Berita proxy
const berita = proxy({
  create: {
    form: { ...defaultForm }, // ✅ ini kunci fix-nya
    loading: false,
    async create() {
      const cek = templateForm.safeParse(berita.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        berita.create.loading = true;
        const res = await ApiFetch.api.desa.berita["create"].post(
          berita.create.form
        );
        if (res.status === 200) {
          berita.findMany.load();
          return toast.success("Berita berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan berita");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        berita.create.loading = false;
      }
    },
    resetForm() {
      berita.create.form = { ...defaultForm };
    },
  },

  // State untuk berita utama (hanya 1)

  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", kategori = "") => {
      const startTime = Date.now();
      berita.findMany.loading = true;
      berita.findMany.page = page;
      berita.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res = await ApiFetch.api.desa.berita["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          berita.findMany.data = res.data.data ?? [];
          berita.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          berita.findMany.data = [];
          berita.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch berita paginated:", err);
        berita.findMany.data = [];
        berita.findMany.totalPages = 1;
      } finally {
        // pastikan minimal 300ms sebelum loading = false (biar UX smooth)
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          berita.findMany.loading = false;
        }, delay);
      }
    },
  },

  findUnique: {
    data: null as Prisma.BeritaGetPayload<{
      include: {
        image: true;
        images: true;
        kategoriBerita: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/berita/${id}`);
        if (res.ok) {
          const data = await res.json();
          berita.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch berita:", res.statusText);
          berita.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching berita:", error);
        berita.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        berita.delete.loading = true;

        const response = await fetch(`/api/desa/berita/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Berita berhasil dihapus");
          await berita.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus berita");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus berita");
      } finally {
        berita.delete.loading = false;
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
        const response = await fetch(`/api/desa/berita/${id}`, {
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
            kategoriBeritaId: data.kategoriBeritaId || "",
            imageId: data.imageId || "",
            imageIds: data.images?.map((img: any) => img.id) || [],
            linkVideo: data.linkVideo || "",
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(berita.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        berita.edit.loading = true;

        const response = await fetch(`/api/desa/berita/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: this.form.judul,
            deskripsi: this.form.deskripsi,
            content: this.form.content,
            kategoriBeritaId: this.form.kategoriBeritaId || null,
            imageId: this.form.imageId,
            imageIds: this.form.imageIds,
            linkVideo: this.form.linkVideo,
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
          toast.success("Berhasil update berita");
          await berita.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update berita");
        }
      } catch (error) {
        console.error("Error updating berita:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update berita"
        );
        return false;
      } finally {
        berita.edit.loading = false;
      }
    },

    reset() {
      berita.edit.id = "";
      berita.edit.form = { ...defaultForm };
    },
  },
  findFirst: {
    data: null as Prisma.BeritaGetPayload<{
      include: {
        image: true;
        kategoriBerita: true;
      };
    }> | null,
    loading: false,
    // findFirst.load()
    async load(kategori?: string) {
      this.loading = true;
      try {
        const res = await ApiFetch.api.desa.berita["find-first"].get({
          query: kategori ? { kategori } : {},
        });

        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data || null;
        } else {
          this.data = null;
        }
      } catch (err) {
        console.error("Gagal fetch berita terbaru:", err);
        this.data = null;
      } finally {
        this.loading = false;
      }
    },
  },
  findRecent: {
    data: [] as Prisma.BeritaGetPayload<{
      include: {
        image: true;
        kategoriBerita: true;
      };
    }>[],
    loading: false,

    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.desa.berita["find-recent"].get();
        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data ?? [];
        }
      } catch (error) {
        console.error("Gagal fetch berita recent:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});

//=============== Kategori Berita ===============

const templateKategoriBerita = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriBerita = {
  name: "",
};

const kategoriBerita = proxy({
  create: {
    form: { ...defaultKategoriBerita },
    loading: false,
    async create() {
      const cek = templateKategoriBerita.safeParse(kategoriBerita.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriBerita.create.loading = true;
        const res = await ApiFetch.api.desa.kategoriberita["create"].post(
          kategoriBerita.create.form
        );
        if (res.status === 200) {
          kategoriBerita.findMany.load();
          return toast.success("Data Kategori Berita Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        kategoriBerita.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriBeritaGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriBerita.findMany.loading = true; // ✅ Akses langsung via nama path
      kategoriBerita.findMany.page = page;
      kategoriBerita.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.desa.kategoriberita[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kategoriBerita.findMany.data = res.data.data ?? [];
          kategoriBerita.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          kategoriBerita.findMany.data = [];
          kategoriBerita.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori berita paginated:", err);
        kategoriBerita.findMany.data = [];
        kategoriBerita.findMany.totalPages = 1;
      } finally {
        kategoriBerita.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriBeritaGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/kategoriberita/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriBerita.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriBerita.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriBerita.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriBerita.delete.loading = true;

        const response = await fetch(`/api/desa/kategoriberita/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Data Kategori Berita berhasil dihapus"
          );
          await kategoriBerita.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus Data Kategori Berita"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Kategori Berita");
      } finally {
        kategoriBerita.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriBerita },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/kategoriberita/${id}`, {
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
        console.error("Error loading kategori berita:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriBerita.safeParse(kategoriBerita.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriBerita.update.loading = true;

        const response = await fetch(`/api/desa/kategoriberita/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
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
          toast.success("Berhasil update data kategori berita");
          await kategoriBerita.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data kategori berita"
          );
        }
      } catch (error) {
        console.error("Error updating data kategori berita:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori berita"
        );
        return false;
      } finally {
        kategoriBerita.update.loading = false;
      }
    },
    reset() {
      kategoriBerita.update.id = "";
      kategoriBerita.update.form = { ...defaultKategoriBerita };
    },
  },
});

// 5. State global
const stateDashboardBerita = proxy({
  kategoriBerita,
  berita,
});

export default stateDashboardBerita;
