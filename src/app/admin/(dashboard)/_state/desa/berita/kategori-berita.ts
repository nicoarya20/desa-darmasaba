/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKategoriBerita = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriBerita = {
  name: "",
};

const kategoriBerita = proxy({
  create: {
    form: { ...defaultKategoriBerita },
    loading: false,
    async create() {
      const cek = templateKategoriBerita.safeParse(kategoriBerita.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriBerita.create.loading = true;
        const res = await ApiFetch.api.desa.kategoriberita["create"].post(
          kategoriBerita.create.form
        );
        if (res.status === 200) {
          kategoriBerita.findMany.load();
          return toast.success("Data Kategori Berita Berhasil Dibuat");
        }
        // Pesan server (mis. 409 "Nama sudah dipakai")
        return toast.error(
          getServerMessage(res) || "Gagal membuat kategori berita"
        );
      } catch (error) {
        console.log(error);
        return toast.error("Gagal membuat kategori berita");
      } finally {
        kategoriBerita.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriBeritaGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriBerita.findMany.loading = true;
      kategoriBerita.findMany.page = page;
      kategoriBerita.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.desa.kategoriberita["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kategoriBerita.findMany.data = res.data.data ?? [];
          kategoriBerita.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriBerita.findMany.data = [];
          kategoriBerita.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori berita paginated:", err);
        kategoriBerita.findMany.data = [];
        kategoriBerita.findMany.totalPages = 1;
      } finally {
        kategoriBerita.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriBeritaGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/kategoriberita/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriBerita.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriBerita.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriBerita.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriBerita.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.kategoriberita as any)["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Data Kategori Berita berhasil dihapus"
          );
          await kategoriBerita.findMany.load();
        } else {
          toast.error(
            res.data?.message || "Gagal menghapus Data Kategori Berita"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Kategori Berita");
      } finally {
        kategoriBerita.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriBerita },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/kategoriberita/${id}`, {
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori berita:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriBerita.safeParse(kategoriBerita.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriBerita.update.loading = true;

        const response = await fetch(`/api/desa/kategoriberita/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update data kategori berita");
          await kategoriBerita.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data kategori berita"
          );
        }
      } catch (error) {
        console.error("Error updating data kategori berita:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori berita"
        );
        return false;
      } finally {
        kategoriBerita.update.loading = false;
      }
    },
    reset() {
      kategoriBerita.update.id = "";
      kategoriBerita.update.form = { ...defaultKategoriBerita };
    },
  },
});

export default kategoriBerita;
