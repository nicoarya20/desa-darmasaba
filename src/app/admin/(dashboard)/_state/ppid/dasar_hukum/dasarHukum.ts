import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
});

type DasarHukumForm = Prisma.DasarHukumPPIDGetPayload<{
  select: {
    id: true;
    judul: true;
    content: true;
  };
}>;

const stateDasarHukumPPID = proxy({
  findById: {
    data: null as DasarHukumForm | null,
    loading: false,
    initialize() {
      stateDasarHukumPPID.findById.data = {
        id: '',
        judul: '',
        content: '',
      } as DasarHukumForm;
    },
    async load(id: string) {
      try {
        stateDasarHukumPPID.findById.loading = true;
        const res = await ApiFetch.api.ppid.dasarhukumppid["find-by-id"].get({
          query: { id },
        });
        if (res.status === 200) {
          stateDasarHukumPPID.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data dasar hukum");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data dasar hukum");
      } finally {
        stateDasarHukumPPID.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: DasarHukumForm) {
      const cek = templateForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateDasarHukumPPID.update.loading = true;
        const res = await ApiFetch.api.ppid.dasarhukumppid["update"].post(data);
        if (res.status === 200) {
          toast.success("Data dasar hukum berhasil diubah");
          await stateDasarHukumPPID.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data dasar hukum");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data dasar hukum");
      } finally {
        stateDasarHukumPPID.update.loading = false;
      }
    },
  },
});

export default stateDasarHukumPPID;
