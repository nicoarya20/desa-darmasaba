import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  misi: z.string().min(3, "Misi minimal 3 karakter"),
  visi: z.string().min(3, "Visi minimal 3 karakter"),
});

type VisiMisiPPIDForm = Prisma.VisiMisiPPIDGetPayload<{
  select: {
    id: true;
    misi: true;
    visi: true;
  };
}>;

const stateVisiMisiPPID = proxy({
  findById: {
    data: null as VisiMisiPPIDForm | null,
    loading: false,
    initialize() {
      stateVisiMisiPPID.findById.data = {
        id: "",
        misi: "",
        visi: "",
      } as VisiMisiPPIDForm;
    },
    async load(id: string) {
      try {
        stateVisiMisiPPID.findById.loading = true;
        const res = await ApiFetch.api.ppid.visimisippid["find-by-id"].get({
          query: { id },
        });
        if (res.status === 200) {
          stateVisiMisiPPID.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data visi misi");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data visi misi");
      } finally {
        stateVisiMisiPPID.findById.loading = false;
      }
    },
  },
  update: {
    loading: false,
    async save(data: VisiMisiPPIDForm) {
      const cek = templateForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateVisiMisiPPID.update.loading = true;
        const res = await ApiFetch.api.ppid.visimisippid["update"].post(data);
        if (res.status === 200) {
          toast.success("Berhasil update visi misi");
          await stateVisiMisiPPID.findById.load(data.id);
        } else {
          toast.error("Gagal update visi misi");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat update visi misi");
      } finally {
        stateVisiMisiPPID.update.loading = false;
      }
    },
  },
});

export default stateVisiMisiPPID;
