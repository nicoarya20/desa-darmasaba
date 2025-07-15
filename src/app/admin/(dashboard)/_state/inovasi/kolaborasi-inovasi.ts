/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(1, "Nama minimal 1 karakter"),
    tahun: z.number().min(4, "Tahun minimal 4 karakter"),
    slug: z.string().min(1, "Deskripsi singkat minimal 1 karakter"),
    deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
    kolaborator: z.string().min(1, "Kolaborator minimal 1 karakter"),
    imageId: z.string().min(1, "Image ID minimal 1 karakter"),
})

const defaultForm = {
    name: "",
    tahun: 0,
    slug: "",
    deskripsi: "",
    kolaborator: "",
    imageId: "",
}

const kolaborasiInovasiState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(kolaborasiInovasiState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kolaborasiInovasiState.create.loading = true;
        const res = await ApiFetch.api.inovasi.kolaborasiinovasi["create"].post(
          kolaborasiInovasiState.create.form
        );
        if (res.status === 200) {
          kolaborasiInovasiState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
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
    load: async (page = 1, limit = 10) => {
      // Change to arrow function
      kolaborasiInovasiState.findMany.loading = true; // Use the full path to access the property
      kolaborasiInovasiState.findMany.page = page;
      try {
        const res = await ApiFetch.api.inovasi.kolaborasiinovasi["find-many"].get({
          query: { page, limit },
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
            imageId: data.imageId,
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
      include: { image: true };
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
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kolaborasiInovasiState.delete.loading = true;

        const response = await fetch(`/api/inovasi/kolaborasiinovasi/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kolaborasi inovasi berhasil dihapus");
          await kolaborasiInovasiState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kolaborasi inovasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kolaborasi inovasi");
      } finally {
        kolaborasiInovasiState.delete.loading = false;
      }
    },
  },
});

export default kolaborasiInovasiState;
    