/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  jumlah: z.string().min(1, "Jumlah minimal 1 karakter"),
  icon: z.string().min(1, "Icon minimal 1 karakter"),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  jumlah: "",
  icon: "",
};

const dataLingkunganDesaState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(dataLingkunganDesaState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        dataLingkunganDesaState.create.loading = true;
        const res = await ApiFetch.api.lingkungan.datalingkungandesa["create"].post(
          dataLingkunganDesaState.create.form
        );
        if (res.status === 200) {
          dataLingkunganDesaState.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        dataLingkunganDesaState.create.loading = false;
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
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      dataLingkunganDesaState.findMany.loading = true; // Use the full path to access the property
      dataLingkunganDesaState.findMany.page = page;
      dataLingkunganDesaState.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.lingkungan.datalingkungandesa["find-many"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          dataLingkunganDesaState.findMany.data = res.data.data || [];
          dataLingkunganDesaState.findMany.total = res.data.total || 0;
          dataLingkunganDesaState.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load berdasarkan data lingkungan desa :",
            res.data?.message
          );
          dataLingkunganDesaState.findMany.data = [];
          dataLingkunganDesaState.findMany.total = 0;
          dataLingkunganDesaState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading berdasarkan data lingkungan desa :", error);
        dataLingkunganDesaState.findMany.data = [];
        dataLingkunganDesaState.findMany.total = 0;
        dataLingkunganDesaState.findMany.totalPages = 1;
      } finally {
        dataLingkunganDesaState.findMany.loading = false;
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
        const response = await fetch(`/api/lingkungan/datalingkungandesa/${id}`, {
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
            deskripsi: data.deskripsi,
            jumlah: data.jumlah,
            icon: data.icon,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading data lingkungan desa :", error);
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
        const response = await fetch(`/api/lingkungan/datalingkungandesa/${id}`, {
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
        await dataLingkunganDesaState.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data data lingkungan desa");
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DataLingkunganDesaGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/lingkungan/datalingkungandesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          dataLingkunganDesaState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          dataLingkunganDesaState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading data lingkungan desa:", error);
        dataLingkunganDesaState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        dataLingkunganDesaState.delete.loading = true;

        const response = await fetch(`/api/lingkungan/datalingkungandesa/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data lingkungan desa berhasil dihapus");
          await dataLingkunganDesaState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus data lingkungan desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus data lingkungan desa");
      } finally {
        dataLingkunganDesaState.delete.loading = false;
      }
    },
  },
});

export default dataLingkunganDesaState;
