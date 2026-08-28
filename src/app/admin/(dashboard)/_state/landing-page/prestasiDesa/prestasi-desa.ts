/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePrestasiDesa = z.object({
  name: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  imageId: z.string().min(1, "Gambar harus dipilih"),
  kategoriId: z.string().min(1, "Kategori harus dipilih"),
});

const defaultPrestasiDesa = {
  name: "",
  deskripsi: "",
  imageId: "",
  kategoriId: "",
};

const prestasiDesa = proxy({
  create: {
    form: { ...defaultPrestasiDesa },
    loading: false,
    async create() {
      const cek = templatePrestasiDesa.safeParse(prestasiDesa.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        prestasiDesa.create.loading = true;
        const res = await ApiFetch.api.landingpage.prestasidesa[
          "create"
        ].post(prestasiDesa.create.form);
        if (res.status === 200) {
          prestasiDesa.findMany.load();
          return toast.success("Prestasi Desa Berhasil Ditambahkan");
        }
        console.log(res);
        return toast.error("Gagal menambahkan prestasi desa");
      } catch (error) {
        console.log(error);
        return toast.error("Gagal menambahkan prestasi desa");
      } finally {
        prestasiDesa.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.PrestasiDesaGetPayload<{
      include: {
        image: true;
        kategori: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      prestasiDesa.findMany.loading = true;
      prestasiDesa.findMany.page = page;
      prestasiDesa.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.prestasidesa[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          prestasiDesa.findMany.data = res.data.data ?? [];
          prestasiDesa.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          prestasiDesa.findMany.data = [];
          prestasiDesa.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch prestasi desa:", err);
        prestasiDesa.findMany.data = [];
        prestasiDesa.findMany.totalPages = 1;
      } finally {
        prestasiDesa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PrestasiDesaGetPayload<{
      include: {
        image: true;
        kategori: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/prestasidesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          prestasiDesa.findUnique.data = data.data ?? null;
        } else {
          prestasiDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        prestasiDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string): Promise<boolean> {
      if (!id) {
        toast.warn("ID tidak valid");
        return false;
      }

      try {
        prestasiDesa.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/prestasidesa/del/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Prestasi desa berhasil dihapus");
          await prestasiDesa.findMany.load();
          return true;
        } else {
          toast.error(result?.message || "Gagal menghapus prestasi desa");
          return false;
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus prestasi desa");
        return false;
      } finally {
        prestasiDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultPrestasiDesa },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/landingpage/prestasidesa/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          prestasiDesa.edit.id = data.id;
          prestasiDesa.edit.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
            kategoriId: data.kategoriId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading prestasi desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templatePrestasiDesa.safeParse(prestasiDesa.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        prestasiDesa.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/prestasidesa/${prestasiDesa.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: prestasiDesa.edit.form.name,
              deskripsi: prestasiDesa.edit.form.deskripsi,
              imageId: prestasiDesa.edit.form.imageId,
              kategoriId: prestasiDesa.edit.form.kategoriId,
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
          toast.success("Berhasil update prestasi desa");
          await prestasiDesa.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update prestasi desa");
        }
      } catch (error) {
        console.error("Error updating prestasi desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal update prestasi desa"
        );
        return false;
      } finally {
        prestasiDesa.edit.loading = false;
      }
    },
    reset() {
      prestasiDesa.edit.id = "";
      prestasiDesa.edit.form = { ...defaultPrestasiDesa };
    },
  },
});

export default prestasiDesa;
