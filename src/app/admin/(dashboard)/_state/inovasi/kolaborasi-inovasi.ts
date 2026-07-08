/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(1, "Nama kolaborasi inovasi harus diisi"),
    tahun: z.number().min(1900, "Tahun tidak valid").max(new Date().getFullYear() + 1, "Tahun tidak boleh lebih dari tahun depan"),
    slug: z.string().min(1, "Slug harus dihasilkan otomatis"),
    deskripsi: z.string().min(1, "Deskripsi harus diisi"),
    kolaborator: z.string().min(1, "Kolaborator harus diisi"),
})

const defaultForm = {
    name: "",
    tahun: 0,
    slug: "",
    deskripsi: "",
    kolaborator: "",
}

const kolaborasiInovasiState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      try {
        // Validate form
        const validation = templateForm.safeParse(kolaborasiInovasiState.create.form);
        if (!validation.success) {
          const errorMessages = validation.error.issues
            .map(issue => `- ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
          return toast.error(`Validasi gagal:\n${errorMessages}`);
        }

        kolaborasiInovasiState.create.loading = true;
        
        const res = await ApiFetch.api.inovasi.kolaborasiinovasi["create"].post(
          kolaborasiInovasiState.create.form
        );
        
        if (res.status === 200) {
          await kolaborasiInovasiState.findMany.load();
          return { success: true, data: res.data };
        }
        
        console.error('Create failed:', res);
        toast.error(res.data?.message || "Gagal menyimpan data");
        return { success: false, error: res.data };
      } catch (error) {
        console.error('Error in create:', error);
        toast.error("Terjadi kesalahan saat menyimpan data");
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      } finally {
        kolaborasiInovasiState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    year: "",
    load: async (page = 1, limit = 10, search = "", year?: string) => {
      kolaborasiInovasiState.findMany.loading = true;
      kolaborasiInovasiState.findMany.page = page;
      kolaborasiInovasiState.findMany.search = search;
      kolaborasiInovasiState.findMany.year = year || "";

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (year) query.year = year;
        
        const res = await ApiFetch.api.inovasi.kolaborasiinovasi["find-many"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kolaborasiInovasiState.findMany.data = res.data.data || [];
          kolaborasiInovasiState.findMany.total = res.data.total || 0;
          kolaborasiInovasiState.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load grafik berdasarkan jenis kelamin:",
            res.data?.message
          );
          kolaborasiInovasiState.findMany.data = [];
          kolaborasiInovasiState.findMany.total = 0;
          kolaborasiInovasiState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan jenis kelamin:", error);
        kolaborasiInovasiState.findMany.data = [];
        kolaborasiInovasiState.findMany.total = 0;
        kolaborasiInovasiState.findMany.totalPages = 1;
      } finally {
        kolaborasiInovasiState.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/inovasi/kolaborasiinovasi/${id}`, {
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
            tahun: data.tahun,
            slug: data.slug,
            deskripsi: data.deskripsi,
            kolaborator: data.kolaborator,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading kolaborasi inovasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      const cek = templateForm.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/inovasi/kolaborasiinovasi/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await kolaborasiInovasiState.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data kolaborasi inovasi");
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KolaborasiInovasiGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/inovasi/kolaborasiinovasi/${id}`);
        if (res.ok) {
          const data = await res.json();
          kolaborasiInovasiState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kolaborasiInovasiState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading kolaborasi inovasi:", error);
        kolaborasiInovasiState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string): Promise<boolean> {
      if (!id) {
        toast.warn("ID tidak valid");
        return false;
      }

      try {
        kolaborasiInovasiState.delete.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn pola delete yang bekerja
        // (landing-page/program-inovasi). Eden tak set Content-Type json untuk
        // DELETE tanpa body, jadi tak memicu 400 parse-body kosong di Elysia.
        const res = await (ApiFetch.api.inovasi.kolaborasiinovasi as any)["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Kolaborasi inovasi berhasil dihapus");
          await kolaborasiInovasiState.findMany.load(); // refresh list
          return true;
        }
        toast.error(res.data?.message || "Gagal menghapus kolaborasi inovasi");
        return false;
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kolaborasi inovasi");
        return false;
      } finally {
        kolaborasiInovasiState.delete.loading = false;
      }
    },
  },
});

export default kolaborasiInovasiState;
    