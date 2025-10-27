/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  judul: z.string().min(1, "Judul minimal 1 karakter"),
  icon: z.string().min(1, "Icon minimal 1 karakter"),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  judul: "",
  icon: "",
};

const programPenghijauanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(programPenghijauanState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        programPenghijauanState.create.loading = true;
        const res = await ApiFetch.api.lingkungan.programpenghijauan["create"].post(
          programPenghijauanState.create.form
        );
        if (res.status === 200) {
          programPenghijauanState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        programPenghijauanState.create.loading = false;
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
      programPenghijauanState.findMany.loading = true; // Use the full path to access the property
      programPenghijauanState.findMany.page = page;
      programPenghijauanState.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.lingkungan.programpenghijauan["find-many"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          programPenghijauanState.findMany.data = res.data.data || [];
          programPenghijauanState.findMany.total = res.data.total || 0;
          programPenghijauanState.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load grafik berdasarkan program penghijauan:",
            res.data?.message
          );
          programPenghijauanState.findMany.data = [];
          programPenghijauanState.findMany.total = 0;
          programPenghijauanState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan program penghijauan:", error);
        programPenghijauanState.findMany.data = [];
        programPenghijauanState.findMany.total = 0;
        programPenghijauanState.findMany.totalPages = 1;
      } finally {
        programPenghijauanState.findMany.loading = false;
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
        const response = await fetch(`/api/lingkungan/programpenghijauan/${id}`, {
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
            judul: data.judul,
            icon: data.icon,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading program penghijauan:", error);
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
        const response = await fetch(`/api/lingkungan/programpenghijauan/${id}`, {
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
        await programPenghijauanState.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data program penghijauan");
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramPenghijauanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/lingkungan/programpenghijauan/${id}`);
        if (res.ok) {
          const data = await res.json();
          programPenghijauanState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          programPenghijauanState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading program penghijauan:", error);
        programPenghijauanState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        programPenghijauanState.delete.loading = true;

        const response = await fetch(`/api/lingkungan/programpenghijauan/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Program penghijauan berhasil dihapus");
          await programPenghijauanState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus program penghijauan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus program penghijauan");
      } finally {
        programPenghijauanState.delete.loading = false;
      }
    },
  },
});

export default programPenghijauanState;
