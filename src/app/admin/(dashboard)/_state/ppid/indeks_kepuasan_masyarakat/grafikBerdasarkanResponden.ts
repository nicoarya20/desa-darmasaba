/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikResponden = z.object({
  sangatbaik: z.string().min(1, "Data sangat baik harus diisi"),
  baik: z.string().min(1, "Data baik harus diisi"),
  kurangbaik: z.string().min(1, "Data kurang baik harus diisi"),
  tidakbaik: z.string().min(1, "Data tidak baik harus diisi"),
});

const defaultForm = {
  sangatbaik: "",
  baik: "",
  kurangbaik: "",
  tidakbaik: "",
};

const grafikBerdasarkanResponden = proxy({
  create: {
    form: {...defaultForm},
    loading: false,
    async create() {
      const cek = templateGrafikResponden.safeParse(
        grafikBerdasarkanResponden.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanResponden.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikberdasarkanresponden[
          "create"
        ].post(grafikBerdasarkanResponden.create.form);
        if (res.status === 200) {
          toast.success("Grafik berdasarkan responden berhasil ditambahkan");
          await grafikBerdasarkanResponden.findMany.load();
        } else {
          toast.error(res.data?.message ?? "Gagal tambah grafik berdasarkan responden");
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error("Terjadi kesalahan saat menambahkan grafik berdasarkan responden");
      } finally {
        grafikBerdasarkanResponden.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    load: async (page = 1, limit = 10) => {  // Change to arrow function
      grafikBerdasarkanResponden.findMany.loading = true;  // Use the full path to access the property
      grafikBerdasarkanResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.ppid.grafikberdasarkanresponden[
          "find-many"
        ].get({
          query: { page, limit },
        });
  
        if (res.status === 200 && res.data?.success) {
          grafikBerdasarkanResponden.findMany.data = res.data.data || [];
          grafikBerdasarkanResponden.findMany.total = res.data.total || 0;
          grafikBerdasarkanResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load grafik berdasarkan responden:", res.data?.message);
          grafikBerdasarkanResponden.findMany.data = [];
          grafikBerdasarkanResponden.findMany.total = 0;
          grafikBerdasarkanResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading grafikBerdasarkanResponden:", error);
        grafikBerdasarkanResponden.findMany.data = [];
        grafikBerdasarkanResponden.findMany.total = 0;
        grafikBerdasarkanResponden.findMany.totalPages = 1;
      } finally {
        grafikBerdasarkanResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.GrafikBerdasarkanRespondenGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/grafikberdasarkanresponden/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          grafikBerdasarkanResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikBerdasarkanResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan responden:", error);
        grafikBerdasarkanResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: {...defaultForm},
    loading: false,
    async byId() {
      // Method implementation if needed
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const cek = templateGrafikResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      this.loading = true;

      try {
        const response = await fetch(`/api/ppid/grafikberdasarkanresponden/${id}`, {
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

        await grafikBerdasarkanResponden.findMany.load();

        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik berdasarkan responden");
      } finally {
        this.loading = false;
      }
    }
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        grafikBerdasarkanResponden.delete.loading = true;

        const response = await fetch(`/api/ppid/grafikberdasarkanresponden/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Grafik berdasarkan responden berhasil dihapus");
          await grafikBerdasarkanResponden.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus grafik berdasarkan responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik berdasarkan responden");
      } finally {
        grafikBerdasarkanResponden.delete.loading = false;
      }
    }
  }
});

export default grafikBerdasarkanResponden;