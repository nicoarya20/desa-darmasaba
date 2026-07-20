/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDesaAntikorupsi = z.object({
  name: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  kategoriId: z.string().min(1, "Kategori harus dipilih"),
});

const defaultDesaAntikorupsi = {
  name: "",
  deskripsi: "",
  kategoriId: "",
  fileId: "",
};

const desaAntikorupsi = proxy({
  create: {
    form: { ...defaultDesaAntikorupsi },
    loading: false,
    async create() {
      const cek = templateDesaAntikorupsi.safeParse(desaAntikorupsi.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        desaAntikorupsi.create.loading = true;
        const res = await ApiFetch.api.landingpage.desaantikorupsi[
          "create"
        ].post(desaAntikorupsi.create.form);
        if (res.status === 200) {
          desaAntikorupsi.findMany.load();
          return toast.success("Data Berhasil Dibuat");
        }
        return toast.error(
          getServerMessage(res) || "Gagal menambahkan desa antikorupsi"
        );
      } catch (error) {
        console.log(error);
        return toast.error("Gagal menambahkan desa antikorupsi");
      } finally {
        desaAntikorupsi.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.DesaAntiKorupsiGetPayload<{
      include: {
        file: true;
        kategori: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      desaAntikorupsi.findMany.loading = true;
      desaAntikorupsi.findMany.page = page;
      desaAntikorupsi.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.desaantikorupsi[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          desaAntikorupsi.findMany.data = res.data.data ?? [];
          desaAntikorupsi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          desaAntikorupsi.findMany.data = [];
          desaAntikorupsi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch desa antikorupsi:", err);
        desaAntikorupsi.findMany.data = [];
        desaAntikorupsi.findMany.totalPages = 1;
      } finally {
        desaAntikorupsi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DesaAntiKorupsiGetPayload<{
      include: {
        file: true;
        kategori: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
        if (res.ok) {
          const data = await res.json();
          desaAntikorupsi.findUnique.data = data.data ?? null;
        } else {
          desaAntikorupsi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        desaAntikorupsi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        desaAntikorupsi.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/desaantikorupsi/del/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Desa antikorupsi berhasil dihapus");
          await desaAntikorupsi.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus desa antikorupsi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus desa antikorupsi");
      } finally {
        desaAntikorupsi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultDesaAntikorupsi },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          desaAntikorupsi.edit.id = data.id;
          desaAntikorupsi.edit.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            fileId: data.fileId || "",
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading desa antikorupsi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateDesaAntikorupsi.safeParse(desaAntikorupsi.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        desaAntikorupsi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/desaantikorupsi/${desaAntikorupsi.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: desaAntikorupsi.edit.form.name,
              deskripsi: desaAntikorupsi.edit.form.deskripsi,
              kategoriId: desaAntikorupsi.edit.form.kategoriId,
              fileId: desaAntikorupsi.edit.form.fileId,
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
          toast.success("Berhasil update desa antikorupsi");
          await desaAntikorupsi.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update desa antikorupsi");
        }
      } catch (error) {
        console.error("Error updating desa antikorupsi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal update desa antikorupsi"
        );
        return false;
      } finally {
        desaAntikorupsi.edit.loading = false;
      }
    },
    reset() {
      desaAntikorupsi.edit.id = "";
      desaAntikorupsi.edit.form = { ...defaultDesaAntikorupsi };
    },
  },
});

export default desaAntikorupsi;
