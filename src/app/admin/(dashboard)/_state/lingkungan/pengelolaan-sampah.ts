/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  icon: z.string().min(1, "Icon minimal 1 karakter"),
});

const defaultForm = {
  name: "",
  icon: "",
};

const pengelolaanSampahState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(pengelolaanSampahState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pengelolaanSampahState.create.loading = true;
        const res = await ApiFetch.api.lingkungan.pengelolaansampah["create"].post(
          pengelolaanSampahState.create.form
        );
        if (res.status === 200) {
          pengelolaanSampahState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pengelolaanSampahState.create.loading = false;
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
      pengelolaanSampahState.findMany.loading = true; // Use the full path to access the property
      pengelolaanSampahState.findMany.page = page;
      try {
        const res = await ApiFetch.api.lingkungan.pengelolaansampah["find-many"].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          pengelolaanSampahState.findMany.data = res.data.data || [];
          pengelolaanSampahState.findMany.total = res.data.total || 0;
          pengelolaanSampahState.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load pengelolaan sampah:",
            res.data?.message
          );
          pengelolaanSampahState.findMany.data = [];
          pengelolaanSampahState.findMany.total = 0;
          pengelolaanSampahState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        pengelolaanSampahState.findMany.data = [];
        pengelolaanSampahState.findMany.total = 0;
        pengelolaanSampahState.findMany.totalPages = 1;
      } finally {
        pengelolaanSampahState.findMany.loading = false;
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
        const response = await fetch(`/api/lingkungan/pengelolaansampah/${id}`, {
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
            icon: data.icon,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
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
        const response = await fetch(`/api/lingkungan/pengelolaansampah/${id}`, {
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
        await pengelolaanSampahState.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data pengelolaan sampah");
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramKreatifGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/lingkungan/pengelolaansampah/${id}`);
        if (res.ok) {
          const data = await res.json();
          pengelolaanSampahState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pengelolaanSampahState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        pengelolaanSampahState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengelolaanSampahState.delete.loading = true;

        const response = await fetch(`/api/lingkungan/pengelolaansampah/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "pengelolaan sampah berhasil dihapus");
          await pengelolaanSampahState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pengelolaan sampah");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengelolaan sampah");
      } finally {
        pengelolaanSampahState.delete.loading = false;
      }
    },
  },
});

export default pengelolaanSampahState;
