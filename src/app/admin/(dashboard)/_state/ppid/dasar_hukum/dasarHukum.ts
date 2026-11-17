import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
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
    fileId: true;
    file: { select: { id: true; link: true; realName: true } };
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
        fileId: null,
        file: null,
      };
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
    /** Simpan teks; `newFileId` (opsional) = id PDF yang baru diunggah untuk menggantikan berkas lama. Mengembalikan true bila tersimpan. */
    async save(data: DasarHukumForm, newFileId?: string): Promise<boolean> {
      const cek = templateForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return false;
      }

      try {
        stateDasarHukumPPID.update.loading = true;
        const res = await ApiFetch.api.ppid.dasarhukumppid["update"].post({
          id: data.id,
          judul: data.judul,
          content: data.content,
          ...(newFileId ? { fileId: newFileId } : {}),
        });
        if (res.status === 200) {
          toast.success("Data dasar hukum berhasil diubah");
          await stateDasarHukumPPID.findById.load(data.id);
          return true;
        }
        toast.error("Gagal mengubah data dasar hukum");
        return false;
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data dasar hukum");
        return false;
      } finally {
        stateDasarHukumPPID.update.loading = false;
      }
    },
  },
});

export default stateDasarHukumPPID;
