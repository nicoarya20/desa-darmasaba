/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import {
  pengumumanFindFirst,
  pengumumanFindRecent,
  pengumumanFindUnique,
} from "./pengumuman-read";

const templateFormPengumuman = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  categoryPengumumanId: z.string().nonempty(),
});

const defaultForm = {
  judul: "",
  deskripsi: "",
  content: "",
  categoryPengumumanId: "",
};

const pengumuman = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateFormPengumuman.safeParse(pengumuman.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pengumuman.create.loading = true;
        const res = await ApiFetch.api.desa.pengumuman["create"].post(
          pengumuman.create.form
        );
        if (res.status === 200) {
          pengumuman.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pengumuman.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PengumumanGetPayload<{
          include: {
            CategoryPengumuman: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", kategori = "") => {
      pengumuman.findMany.loading = true;
      pengumuman.findMany.page = page;
      pengumuman.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res = await ApiFetch.api.desa.pengumuman["find-many"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pengumuman.findMany.data = res.data.data ?? [];
          pengumuman.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          pengumuman.findMany.data = [];
          pengumuman.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch pengumuman paginated:", err);
        pengumuman.findMany.data = [];
        pengumuman.findMany.totalPages = 1;
      } finally {
        pengumuman.findMany.loading = false;
      }
    },
  },
  findUnique: pengumumanFindUnique,
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengumuman.delete.loading = true;

        const response = await fetch(`/api/desa/pengumuman/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pengumuman berhasil dihapus");
          await pengumuman.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus pengumuman");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengumuman");
      } finally {
        pengumuman.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/pengumuman/${id}`, {
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            content: data.content,
            categoryPengumumanId: data.categoryPengumumanId || "",
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading pengumuman:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateFormPengumuman.safeParse(pengumuman.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pengumuman.edit.loading = true;

        const response = await fetch(`/api/desa/pengumuman/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: this.form.judul,
            deskripsi: this.form.deskripsi,
            content: this.form.content,
            categoryPengumumanId: this.form.categoryPengumumanId || null,
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
          toast.success("Berhasil update pengumuman");
          await pengumuman.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update pengumuman");
        }
      } catch (error) {
        console.error("Error updating pengumuman:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update pengumuman"
        );
        return false;
      } finally {
        pengumuman.edit.loading = false;
      }
    },

    reset() {
      pengumuman.edit.id = "";
      pengumuman.edit.form = { ...defaultForm };
    },
  },
  findFirst: pengumumanFindFirst,
  findRecent: pengumumanFindRecent,
});

export default pengumuman;
