/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// ========================================= SCHEMAS ========================================= //

const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsiSingkat: z.string().min(3, "Deskripsi singkat minimal 3 karakter"),
  deskripsiLengkap: z.string().min(3, "Deskripsi lengkap minimal 3 karakter"),
  tanggal: z.string().nonempty("Tanggal harus diisi"),
  lokasi: z.string().min(3, "Lokasi minimal 3 karakter"),
  partisipan: z.number().optional().default(0),
  kategoriKegiatanId: z.string().nonempty("Kategori kegiatan harus dipilih"),
  imageId: z.string().optional(),
});

const defaultForm = {
  judul: "",
  deskripsiSingkat: "",
  deskripsiLengkap: "",
  tanggal: "",
  lokasi: "",
  partisipan: 0,
  kategoriKegiatanId: "",
  imageId: "" as string | undefined,
};

const templateKategori = z.object({
  nama: z.string().min(1, "Nama kategori harus diisi"),
});

const defaultKategori = {
  nama: "",
};

// ========================================= KEGIATAN DESA ========================================= //

const kegiatan = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(kegiatan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kegiatan.create.loading = true;
        const res = await ApiFetch.api.desa["kegiatandesa"]["create"].post(
          kegiatan.create.form
        );
        if (res.status === 200 && res.data?.success) {
          kegiatan.findMany.load();
          toast.success("Kegiatan desa berhasil disimpan!");
          return true;
        }

        toast.error(res.data?.message || "Gagal menyimpan kegiatan desa");
        return false;
      } catch (error) {
        console.error("Error creating kegiatan:", error);
        toast.error("Terjadi kesalahan saat menyimpan kegiatan");
        return false;
      } finally {
        kegiatan.create.loading = false;
      }
    },
    resetForm() {
      kegiatan.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", kategori = "") => {
      const startTime = Date.now();
      kegiatan.findMany.loading = true;
      kegiatan.findMany.page = page;
      kegiatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res = await ApiFetch.api.desa["kegiatandesa"]["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          kegiatan.findMany.data = res.data.data ?? [];
          kegiatan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kegiatan.findMany.data = [];
          kegiatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kegiatan paginated:", err);
        kegiatan.findMany.data = [];
        kegiatan.findMany.totalPages = 1;
      } finally {
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          kegiatan.findMany.loading = false;
        }, delay);
      }
    },
  },

  findUnique: {
    data: null as any | null,
    loading: false,
    async load(id: string) {
      if (!id) return;
      this.loading = true;
      try {
        const res = await fetch(`/api/desa/kegiatandesa/${id}`); // Assuming unique endpoint follows standard
        if (res.ok) {
          const result = await res.json();
          kegiatan.findUnique.data = result.data ?? null;
        }
      } catch (error) {
        console.error("Error fetching unique kegiatan:", error);
      } finally {
        this.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kegiatan.delete.loading = true;
        const response = await fetch(`/api/desa/kegiatandesa/del/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (response.ok && result?.success) {
          toast.success(result.message || "Kegiatan berhasil dihapus");
          await kegiatan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus kegiatan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kegiatan");
      } finally {
        kegiatan.delete.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) return null;
      try {
        kegiatan.edit.loading = true;
        const response = await fetch(`/api/desa/kegiatandesa/${id}`);
        const result = await response.json();

        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            judul: data.judul,
            deskripsiSingkat: data.deskripsiSingkat,
            deskripsiLengkap: data.deskripsiLengkap,
            tanggal: data.tanggal ? new Date(data.tanggal).toISOString().split('T')[0] : "",
            lokasi: data.lokasi,
            partisipan: data.partisipan || 0,
            kategoriKegiatanId: data.kategoriKegiatanId || "",
            imageId: data.imageId || undefined,
          };
          return data;
        }
      } catch (error) {
        console.error("Error loading kegiatan for edit:", error);
      } finally {
        kegiatan.edit.loading = false;
      }
      return null;
    },

    async update() {
      const cek = templateForm.safeParse(kegiatan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kegiatan.edit.loading = true;
        const response = await fetch(`/api/desa/kegiatandesa/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(kegiatan.edit.form),
        });

        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update kegiatan");
          await kegiatan.findMany.load();
          return true;
        }
        throw new Error(result.message || "Gagal update kegiatan");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat update");
        return false;
      } finally {
        kegiatan.edit.loading = false;
      }
    },

    reset() {
      kegiatan.edit.id = "";
      kegiatan.edit.form = { ...defaultForm };
    },
  },
});

// ========================================= KATEGORI KEGIATAN ========================================= //

const kategoriKegiatan = proxy({
  create: {
    form: { ...defaultKategori },
    loading: false,
    async create() {
      const cek = templateKategori.safeParse(kategoriKegiatan.create.form);
      if (!cek.success) {
        return toast.error("Nama kategori harus diisi");
      }

      try {
        kategoriKegiatan.create.loading = true;
        const res = await ApiFetch.api.desa["kategorikegiatan"]["create"].post(
          kategoriKegiatan.create.form
        );
        if (res.status === 200 && res.data?.success) {
          kategoriKegiatan.findMany.load();
          toast.success("Kategori kegiatan berhasil dibuat");
          return true;
        }
        toast.error(res.data?.message || "Gagal membuat kategori");
        return false;
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan");
        return false;
      } finally {
        kategoriKegiatan.create.loading = false;
      }
    },
    resetForm() {
      kategoriKegiatan.create.form = { ...defaultKategori };
    },
  },

  findMany: {
    data: [] as any[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriKegiatan.findMany.loading = true;
      kategoriKegiatan.findMany.page = page;
      kategoriKegiatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.desa["kategorikegiatan"]["findMany"].get({ query });

        if (res.status === 200 && res.data?.success) {
          kategoriKegiatan.findMany.data = res.data.data ?? [];
          kategoriKegiatan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriKegiatan.findMany.data = [];
        }
      } catch (err) {
        console.error("Gagal fetch kategori kegiatan:", err);
      } finally {
        kategoriKegiatan.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as any | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/kategorikegiatan/${id}`);
        if (res.ok) {
          const result = await res.json();
          kategoriKegiatan.findUnique.data = result.data ?? null;
        }
      } catch (error) {
        console.error(error);
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return;
      try {
        kategoriKegiatan.delete.loading = true;
        const res = await fetch(`/api/desa/kategorikegiatan/del/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          toast.success(result.message);
          kategoriKegiatan.findMany.load();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        kategoriKegiatan.delete.loading = false;
      }
    },
  },

  update: {
    id: "",
    form: { ...defaultKategori },
    loading: false,
    async load(id: string) {
      if (!id) return;
      try {
        this.loading = true;
        const res = await fetch(`/api/desa/kategorikegiatan/${id}`);
        const result = await res.json();
        if (result.success) {
          this.id = result.data.id;
          this.form = { nama: result.data.nama };
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async update() {
      const cek = templateKategori.safeParse(kategoriKegiatan.update.form);
      if (!cek.success) return toast.error("Nama kategori harus diisi");

      try {
        this.loading = true;
        const res = await fetch(`/api/desa/kategorikegiatan/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Berhasil update kategori");
          kategoriKegiatan.findMany.load();
          return true;
        }
        toast.error(result.message);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
      return false;
    },
    reset() {
      this.id = "";
      this.form = { ...defaultKategori };
    },
  },
});

// ========================================= GLOBAL STATE ========================================= //

const stateDashboardKegiatan = proxy({
  kegiatan,
  kategoriKegiatan,
});

export default stateDashboardKegiatan;
