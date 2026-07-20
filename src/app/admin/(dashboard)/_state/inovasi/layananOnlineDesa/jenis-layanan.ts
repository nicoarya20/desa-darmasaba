/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateJenisLayananForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
});

const defaultJenisLayananForm = {
  nama: "",
  deskripsi: "",
};

const jenisLayanan = proxy({
  create: {
    form: { ...defaultJenisLayananForm },
    loading: false,
    async create() {
      const cek = templateJenisLayananForm.safeParse(jenisLayanan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jenisLayanan.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline.jenislayanan[
            "create"
          ].post(jenisLayanan.create.form);
        if (res.status === 200) {
          jenisLayanan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        jenisLayanan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      nama: string;
      deskripsi: string;
    }> | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      jenisLayanan.findMany.loading = true;
      jenisLayanan.findMany.page = page;
      jenisLayanan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline.jenislayanan[
            "find-many"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          jenisLayanan.findMany.data = res.data.data ?? [];
          jenisLayanan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          jenisLayanan.findMany.data = [];
          jenisLayanan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch jenis layanan paginated:", err);
        jenisLayanan.findMany.data = [];
        jenisLayanan.findMany.totalPages = 1;
      } finally {
        jenisLayanan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenisLayananGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jenisLayanan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenisLayanan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        jenisLayanan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenisLayanan.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Jenis layanan berhasil dihapus");
          await jenisLayanan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus jenis layanan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenis layanan");
      } finally {
        jenisLayanan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultJenisLayananForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/${id}`,
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
            deskripsi: data.deskripsi,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading jenis layanan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateJenisLayananForm.safeParse(jenisLayanan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        jenisLayanan.edit.loading = true;
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/${jenisLayanan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: jenisLayanan.edit.form.nama,
              deskripsi: jenisLayanan.edit.form.deskripsi,
            }),
          }
        );

        // Clone to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate jenis layanan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui jenis layanan"
            );
            await jenisLayanan.findMany.load();
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate jenis layanan");
          }
        } catch (error) {
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating jenis layanan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate jenis layanan"
        );
        return false;
      } finally {
        jenisLayanan.edit.loading = false;
      }
    },
    reset() {
      jenisLayanan.edit.id = "";
      jenisLayanan.edit.form = { ...defaultJenisLayananForm };
    },
  },
});

export default jenisLayanan;
