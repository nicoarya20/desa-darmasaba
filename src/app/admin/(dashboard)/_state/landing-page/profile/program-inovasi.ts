/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { MAX_GAMBAR_DOKUMENTASI } from "@/lib/program-inovasi";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/** Validasi form admin: logo opsional, link tidak lagi diisi, galeri dibatasi. */
export const templateProgramInovasi = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  description: z.string().min(1, "Deskripsi minimal 1 karakter"),
  imageId: z.string().nullable().optional(),
  imageIds: z
    .array(z.string())
    .max(MAX_GAMBAR_DOKUMENTASI, `Maksimal ${MAX_GAMBAR_DOKUMENTASI} gambar dokumentasi`)
    .optional(),
});

/** Bentuk form create/edit Program Inovasi di state admin. */
export type ProgramInovasiForm = {
  name: string;
  description: string;
  imageId: string | null;
  imageIds: string[];
};

/** Form kosong (dipakai create & reset). */
export const emptyProgramInovasiForm = (): ProgramInovasiForm => ({
  name: "",
  description: "",
  imageId: null,
  imageIds: [],
});

const programInovasi = proxy({
  create: {
    form: emptyProgramInovasiForm(),
    loading: false,
    async create() {
      const formData = {
        name: programInovasi.create.form.name || "",
        description: programInovasi.create.form.description || "",
        imageId: programInovasi.create.form.imageId || null,
        imageIds: [...programInovasi.create.form.imageIds],
      };

      const cek = templateProgramInovasi.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        programInovasi.create.loading = true;
        const res = await ApiFetch.api.landingpage.programinovasi[
          "create"
        ].post(formData);
        if (res.status === 200) {
          programInovasi.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        if (process.env.NODE_ENV === "development") {
          console.log(res);
        }
        return toast.error(getServerMessage(res) || "Gagal menambahkan data");
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Create error:", error);
        }
        toast.error("Gagal menambahkan data");
      } finally {
        programInovasi.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      programInovasi.findMany.loading = true;
      programInovasi.findMany.page = page;
      programInovasi.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.programinovasi[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          programInovasi.findMany.data = res.data.data || [];
          programInovasi.findMany.total = res.data.total || 0;
          programInovasi.findMany.totalPages = res.data.totalPages || 1;
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to load programinovasi:", res.data?.message);
          }
          programInovasi.findMany.data = [];
          programInovasi.findMany.total = 0;
          programInovasi.findMany.totalPages = 1;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading programinovasi:", error);
        }
        programInovasi.findMany.data = [];
        programInovasi.findMany.total = 0;
        programInovasi.findMany.totalPages = 1;
      } finally {
        programInovasi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramInovasiGetPayload<{
      include: {
        image: true;
        images: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        programInovasi.findUnique.loading = true;
        const res = await (ApiFetch.api.landingpage.programinovasi as any)[
          id
        ].get();
        if (res.data?.success) {
          programInovasi.findUnique.data = res.data.data ?? null;
          return res.data.data;
        } else {
          toast.error(
            res.data?.message || "Gagal memuat data program inovasi"
          );
          programInovasi.findUnique.data = null;
          return null;
        }
      } catch (error) {
        console.error("Error fetching program inovasi:", error);
        programInovasi.findUnique.data = null;
        return null;
      } finally {
        programInovasi.findUnique.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        programInovasi.delete.loading = true;
        const res = await (ApiFetch.api.landingpage.programinovasi as any)[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Program inovasi berhasil dihapus"
          );
          await programInovasi.findMany.load();
        } else {
          toast.error(
            res.data?.message || "Gagal menghapus program inovasi"
          );
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Gagal delete:", error);
        }
        toast.error("Terjadi kesalahan saat menghapus program inovasi");
      } finally {
        programInovasi.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: emptyProgramInovasiForm(),
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        programInovasi.update.loading = true;
        const res = await (ApiFetch.api.landingpage.programinovasi as any)[
          id
        ].get();

        if (res.data?.success) {
          const data = res.data.data;
          this.id = data.id;
          this.form = {
            name: data.name,
            description: data.description,
            imageId: data.imageId ?? null,
            imageIds: (data.images ?? []).map((img: { id: string }) => img.id),
          };
          return data;
        } else {
          toast.error(
            res.data?.message || "Gagal mengambil data program inovasi"
          );
          return null;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading program inovasi:", error);
        }
        toast.error("Terjadi kesalahan saat mengambil data program inovasi");
        return null;
      } finally {
        programInovasi.update.loading = false;
      }
    },

    async update() {
      const cek = templateProgramInovasi.safeParse(
        programInovasi.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        programInovasi.update.loading = true;
        const res = await (ApiFetch.api.landingpage.programinovasi as any)[
          this.id
        ].put({
          name: this.form.name,
          description: this.form.description,
          imageId: this.form.imageId || null,
          imageIds: [...this.form.imageIds],
        });

        if (res.data?.success) {
          toast.success("Berhasil update program inovasi");
          await programInovasi.findMany.load();
          return true;
        } else {
          toast.error(getServerMessage(res) || "Gagal update program inovasi");
          return false;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error updating program inovasi:", error);
        }
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update program inovasi"
        );
        return false;
      } finally {
        programInovasi.update.loading = false;
      }
    },
  },
});

export default programInovasi;
