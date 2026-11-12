/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateAjukanForm = z.object({
  nama: z.string().min(1).max(5000),
  nik: z.string().min(1).max(5000),
  alamat: z.string().min(1).max(5000),
  nomorKk: z.string().min(1).max(5000),
  kategoriId: z.string().min(1).max(5000),
});

const defaultAjukanForm = {
  nama: "",
  nik: "",
  alamat: "",
  nomorKk: "",
  kategoriId: "",
};

const ajukanPermohonan = proxy({
  create: {
    form: { ...defaultAjukanForm },
    loading: false,
    /** Kirim formulir permohonan; true = tersimpan, false = validasi/API/jaringan gagal (pemanggil hanya reset bila true). */
    async create(): Promise<boolean> {
      const cek = templateAjukanForm.safeParse(
        ajukanPermohonan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        ajukanPermohonan.create.loading = true;
        const res = await ApiFetch.api.desa.ajukanpermohonan[
          "create"
        ].post(ajukanPermohonan.create.form);
        if (res.status === 200) {
          ajukanPermohonan.findMany.load();
          toast.success("Ajukan permohonan berhasil disimpan!");
          return true;
        }
        toast.error("Gagal menyimpan ajukan permohonan");
        return false;
      } catch (error) {
        console.error("Gagal mengirim ajukan permohonan:", (error as Error).message);
        toast.error("Gagal menyimpan ajukan permohonan");
        return false;
      } finally {
        ajukanPermohonan.create.loading = false;
      }
    },
    resetForm() {
      ajukanPermohonan.create.form = { ...defaultAjukanForm };
    },
  },
  findMany: {
    data: null as Prisma.AjukanPermohonanGetPayload<{
      include: {
        kategori: true;
      };
    }>[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      ajukanPermohonan.findMany.loading = true;
      ajukanPermohonan.findMany.page = page;
      ajukanPermohonan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.ajukanpermohonan[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          ajukanPermohonan.findMany.data = res.data.data || [];
          ajukanPermohonan.findMany.total = res.data.total || 0;
          ajukanPermohonan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load ajukan permohonan:", res.data?.message);
          ajukanPermohonan.findMany.data = [];
          ajukanPermohonan.findMany.total = 0;
          ajukanPermohonan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading ajukan permohonan:", error);
        ajukanPermohonan.findMany.data = [];
        ajukanPermohonan.findMany.total = 0;
        ajukanPermohonan.findMany.totalPages = 1;
      } finally {
        ajukanPermohonan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.AjukanPermohonanGetPayload<{
      include: {
        kategori: true;
      }
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/desa/ajukanpermohonan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          ajukanPermohonan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch ajukan permohonan:", res.statusText);
          ajukanPermohonan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching ajukan permohonan:", error);
        ajukanPermohonan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        ajukanPermohonan.delete.loading = true;
        const response = await fetch(
          `/api/desa/ajukanpermohonan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success(result.message || "Ajukan permohonan berhasil dihapus");
          await ajukanPermohonan.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus ajukan permohonan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus ajukan permohonan");
      } finally {
        ajukanPermohonan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultAjukanForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/ajukanpermohonan/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            nama: data.nama,
            nik: data.nik,
            alamat: data.alamat,
            nomorKk: data.nomorKk,
            kategoriId: data.kategoriId,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching ajukan permohonan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateAjukanForm.safeParse(
        ajukanPermohonan.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        ajukanPermohonan.edit.loading = true;
        const response = await fetch(
          `/api/desa/ajukanpermohonan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              nik: this.form.nik,
              alamat: this.form.alamat,
              nomorKk: this.form.nomorKk,
              kategoriId: this.form.kategoriId,
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
          toast.success(result.message || "Ajukan permohonan berhasil diupdate");
          await ajukanPermohonan.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate ajukan permohonan"
          );
        }
      } catch (error) {
        console.error("Error updating ajukan permohonan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update ajukan permohonan"
        );
        return false;
      } finally {
        ajukanPermohonan.edit.loading = false;
      }
    },
  },
});

export default ajukanPermohonan;
