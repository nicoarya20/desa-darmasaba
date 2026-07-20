/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateMediaSosial = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  imageId: z.string().nullable().optional(),
  iconUrl: z.string().optional(),
  icon: z.string().nullable().optional(),
});

type MediaSosialForm = {
  name: string;
  imageId: string | null;
  iconUrl: string;
  icon: string | null;
};

const mediaSosial = proxy({
  create: {
    form: {} as MediaSosialForm,
    loading: false,
    async create() {
      const formData = {
        name: mediaSosial.create.form.name ?? "",
        imageId: mediaSosial.create.form.imageId ?? null,
        iconUrl: mediaSosial.create.form.iconUrl ?? "",
        icon: mediaSosial.create.form.icon ?? null,
      };

      const cek = templateMediaSosial.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        mediaSosial.create.loading = true;
        const res = await ApiFetch.api.landingpage.mediasosial["create"].post(
          formData
        );
        if (res.status === 200) {
          mediaSosial.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        if (process.env.NODE_ENV === "development") {
          console.log(res);
        }
        return toast.error("failed create");
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.log((error as Error).message);
        }
        toast.error("Gagal menambahkan data");
      } finally {
        mediaSosial.create.loading = false;
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
      mediaSosial.findMany.loading = true;
      mediaSosial.findMany.page = page;
      mediaSosial.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.mediasosial[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          mediaSosial.findMany.data = res.data.data || [];
          mediaSosial.findMany.total = res.data.total || 0;
          mediaSosial.findMany.totalPages = res.data.totalPages || 1;
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to load media sosial:", res.data?.message);
          }
          mediaSosial.findMany.data = [];
          mediaSosial.findMany.total = 0;
          mediaSosial.findMany.totalPages = 1;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading media sosial:", error);
        }
        mediaSosial.findMany.data = [];
        mediaSosial.findMany.total = 0;
        mediaSosial.findMany.totalPages = 1;
      } finally {
        mediaSosial.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.MediaSosialGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      mediaSosial.findUnique.loading = true;
      try {
        const res = await (ApiFetch.api.landingpage.mediasosial as any)[
          id
        ].get();
        if (res.data?.success) {
          mediaSosial.findUnique.data = res.data.data ?? null;
          return res.data.data;
        } else {
          toast.error(res.data?.message || "Gagal memuat data media sosial");
          mediaSosial.findUnique.data = null;
          return null;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching media sosial:", error);
        }
        mediaSosial.findUnique.data = null;
        return null;
      } finally {
        mediaSosial.findUnique.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        mediaSosial.delete.loading = true;
        const res = await (ApiFetch.api.landingpage.mediasosial as any)[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Media Sosial berhasil dihapus");
          await mediaSosial.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal menghapus media sosial");
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Gagal delete:", error);
        }
        toast.error("Terjadi kesalahan saat menghapus media sosial");
      } finally {
        mediaSosial.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: {} as MediaSosialForm,
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      mediaSosial.update.loading = true;
      try {
        const res = await (ApiFetch.api.landingpage.mediasosial as any)[
          id
        ].get();

        if (res.data?.success) {
          const data = res.data.data;
          this.id = data.id;
          this.form = {
            name: data.name || "",
            imageId: data.imageId || null,
            iconUrl: data.iconUrl || "",
            icon: data.icon || null,
          };
          return data;
        } else {
          toast.error(
            res.data?.message || "Gagal mengambil data media sosial"
          );
          return null;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading media sosial:", error);
        }
        toast.error("Terjadi kesalahan saat mengambil data media sosial");
        return null;
      } finally {
        mediaSosial.update.loading = false;
      }
    },

    async update() {
      const cek = templateMediaSosial.safeParse(mediaSosial.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        mediaSosial.update.loading = true;
        const res = await (ApiFetch.api.landingpage.mediasosial as any)[
          this.id
        ].put({
          name: this.form.name,
          imageId: this.form.imageId,
          iconUrl: this.form.iconUrl,
          icon: this.form.icon,
        });

        if (res.data?.success) {
          toast.success("Berhasil update media sosial");
          await mediaSosial.findMany.load();
          return true;
        } else {
          toast.error(res.data?.message || "Gagal update media sosial");
          return false;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error updating media sosial:", error);
        }
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update media sosial"
        );
        return false;
      } finally {
        mediaSosial.update.loading = false;
      }
    },
  },
});

export default mediaSosial;
