/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  image: z.string().url().min(3, "Image minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  katagoryBeritaId: z.string().nonempty(),
});

const category = proxy({
  findMany: {
    data: null as
      | null
      | Prisma.KatagoryBeritaGetPayload<{ omit: { isActive: true } }>[],
    async load() {
      const res = await ApiFetch.api.desa.berita.category["find-many"].get();
      if (res.status === 200) {
        category.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

type BeritaForm = Prisma.BeritaGetPayload<{
  select: {
    judul: true;
    deskripsi: true;
    image: true;
    content: true;
    katagoryBeritaId: true;
  };
}>;

const berita = proxy({
  create: {
    form: {} as BeritaForm,
    loading: false,
    async create() {
      berita.create.form.image =
        "https://www.shutterstock.com/image-vector/lower-news-live-streaming-breaking-600nw-2535984111.jpg";
      const cek = templateForm.safeParse(berita.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        berita.create.loading = true;
        const res = await ApiFetch.api.desa.berita["create"].post(
          berita.create.form
        );
        if (res.status === 200) {
          berita.findMany.load();
          return toast.success("succes create");
        }

        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        berita.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.BeritaGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.desa.berita["find-many"].get();
      if (res.status === 200) {
        berita.findMany.data = (res.data?.data as any) ?? [];
      }
    },
  },
});

const stateDashboardBerita = proxy({
  category,
  berita,
});

export default stateDashboardBerita;
