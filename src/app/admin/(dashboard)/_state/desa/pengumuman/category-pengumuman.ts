/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKategoriPengumuman = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriPengumuman = {
  name: "",
};

const category = proxy({
  create: {
    form: { ...defaultKategoriPengumuman },
    loading: false,
    async create() {
      const cek = templateKategoriPengumuman.safeParse(category.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        category.create.loading = true;
        const res = await ApiFetch.api.desa.kategoripengumuman["create"].post(
          category.create.form
        );
        if (res.status === 200) {
          category.findMany.load();
          return toast.success("Data Kategori Pengumuman Berhasil Dibuat");
        }
        // Pesan server (mis. 409 "Nama sudah dipakai")
        return toast.error(
          getServerMessage(res) || "Gagal membuat kategori pengumuman"
        );
      } catch (error) {
        console.log(error);
        return toast.error("Gagal membuat kategori pengumuman");
      } finally {
        category.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as (Prisma.CategoryPengumumanGetPayload<{
      omit: {
        isActive: true;
      };
    }> & {
      _count: {
        pengumumans: number;
      };
    })[],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      category.findMany.loading = true;
      category.findMany.page = page;
      category.findMany.search = search;
      try {
        const res = await ApiFetch.api.desa.kategoripengumuman[
          "findMany"
        ].get({
          query: { page, limit, search },
        });

        if (res.status === 200 && res.data?.success) {
          category.findMany.data = res.data.data || [];
          category.findMany.total = res.data.total || 0;
          category.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load potensi desa:", res.data?.message);
          category.findMany.data = [];
          category.findMany.total = 0;
          category.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading potensi desa:", error);
        category.findMany.data = [];
        category.findMany.total = 0;
        category.findMany.totalPages = 1;
      } finally {
        category.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.CategoryPengumumanGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/kategoripengumuman/${id}`);
        if (res.ok) {
          const data = await res.json();
          category.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          category.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        category.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        category.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body (hindari 400 parse Elysia) & content-type aware saat parse
        // respons (hindari SyntaxError bila body non-JSON).
        const res = await (ApiFetch.api.desa as any).kategoripengumuman["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Data Kategori Pengumuman berhasil dihapus"
          );
          await category.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus Data Kategori Pengumuman");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus Data Kategori Pengumuman"
        );
      } finally {
        category.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriPengumuman },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/kategoripengumuman/${id}`, {
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
        console.error("Error loading kategori pengumuman:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriPengumuman.safeParse(category.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        category.update.loading = true;

        const response = await fetch(
          `/api/desa/kategoripengumuman/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
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
          toast.success("Berhasil update data kategori pengumuman");
          await category.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data kategori pengumuman"
          );
        }
      } catch (error) {
        console.error("Error updating data kategori pengumuman:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori pengumuman"
        );
        return false;
      } finally {
        category.update.loading = false;
      }
    },
    reset() {
      category.update.id = "";
      category.update.form = { ...defaultKategoriPengumuman };
    },
  },
});

export default category;
