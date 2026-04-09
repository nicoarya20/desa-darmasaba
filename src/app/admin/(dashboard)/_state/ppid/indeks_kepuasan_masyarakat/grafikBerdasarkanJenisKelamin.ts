/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikJenisKelamin = z.object({
  laki: z.string().min(1, "Data laki-laki harus diisi"),
  perempuan: z.string().min(1, "Data perempuan harus diisi"),
});

const defaultForm = {
  laki: "",
  perempuan: "",
};

const grafikBerdasarkanJenisKelamin = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateGrafikJenisKelamin.safeParse(
        grafikBerdasarkanJenisKelamin.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }

      try {
        grafikBerdasarkanJenisKelamin.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikberdasarkanjeniskelamin[
          "create"
        ].post(grafikBerdasarkanJenisKelamin.create.form);
        if (res.status === 200) {
          toast.success(
            "Grafik berdasarkan jenis kelamin berhasil ditambahkan"
          );
          await grafikBerdasarkanJenisKelamin.findMany.load();
        } else {
          toast.error(
            res.data?.message ?? "Gagal tambah grafik berdasarkan jenis kelamin"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan grafik berdasarkan jenis kelamin"
        );
      } finally {
        grafikBerdasarkanJenisKelamin.create.loading = false;
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
      grafikBerdasarkanJenisKelamin.findMany.loading = true; // Use the full path to access the property
      grafikBerdasarkanJenisKelamin.findMany.page = page;
      try {
        const res = await ApiFetch.api.ppid.grafikberdasarkanjeniskelamin[
          "find-many"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          grafikBerdasarkanJenisKelamin.findMany.data = res.data.data || [];
          grafikBerdasarkanJenisKelamin.findMany.total = res.data.total || 0;
          grafikBerdasarkanJenisKelamin.findMany.totalPages =
            res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load grafik berdasarkan jenis kelamin:",
            res.data?.message
          );
          grafikBerdasarkanJenisKelamin.findMany.data = [];
          grafikBerdasarkanJenisKelamin.findMany.total = 0;
          grafikBerdasarkanJenisKelamin.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan jenis kelamin:", error);
        grafikBerdasarkanJenisKelamin.findMany.data = [];
        grafikBerdasarkanJenisKelamin.findMany.total = 0;
        grafikBerdasarkanJenisKelamin.findMany.totalPages = 1;
      } finally {
        grafikBerdasarkanJenisKelamin.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.GrafikBerdasarkanJenisKelaminGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/grafikberdasarkanjeniskelamin/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          grafikBerdasarkanJenisKelamin.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikBerdasarkanJenisKelamin.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan jenis kelamin:", error);
        grafikBerdasarkanJenisKelamin.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
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
      const cek = templateGrafikJenisKelamin.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/ppid/grafikberdasarkanjeniskelamin/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await grafikBerdasarkanJenisKelamin.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik berdasarkan jenis kelamin");
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
        grafikBerdasarkanJenisKelamin.delete.loading = true;

        const response = await fetch(
          `/api/ppid/grafikberdasarkanjeniskelamin/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message ||
              "Grafik berdasarkan jenis kelamin berhasil dihapus"
          );
          await grafikBerdasarkanJenisKelamin.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message ||
              "Gagal menghapus grafik berdasarkan jenis kelamin"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus grafik berdasarkan jenis kelamin"
        );
      } finally {
        grafikBerdasarkanJenisKelamin.delete.loading = false;
      }
    },
  },
});

export default grafikBerdasarkanJenisKelamin;
