import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// Schema validasi form
const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  biodata: z.string().min(3, "Biodata minimal 3 karakter"),
  riwayat: z.string().min(3, "Riwayat minimal 3 karakter"),
  pengalaman: z.string().min(3, "Pengalaman minimal 3 karakter"),
  unggulan: z.string().min(3, "Unggulan minimal 3 karakter"),
});

// Type ambil dari Prisma
type ProfilePPIDForm = Prisma.ProfilePPIDGetPayload<{
  select: {
    id: true;
    name: true;
    biodata: true;
    riwayat: true;
    pengalaman: true;
    unggulan: true;
    imageUrl: true;
  };
}>;

// Proxy utama
const stateProfilePPID = proxy({
  findById: {
    data: null as ProfilePPIDForm | null,
    loading: false,
    initialize() {
      stateProfilePPID.findById.data = {
        id: '',
        name: '',
        biodata: '',
        riwayat: '',
        pengalaman: '',
        unggulan: '',
        imageUrl:''
      } as ProfilePPIDForm;
    },
    async load(id: string) {
      try {
        stateProfilePPID.findById.loading = true;
        const res = await ApiFetch.api.ppid.profileppid["find-by-id"].get({
          query: { id },
        });
        if (res.status === 200) {
          stateProfilePPID.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data profile");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data profile");
      } finally {
        stateProfilePPID.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: ProfilePPIDForm) {
      const cek = templateForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateProfilePPID.update.loading = true;
        const res = await ApiFetch.api.ppid.profileppid["update"].post(data);
        if (res.status === 200) {
          toast.success("Berhasil update profile");
          await stateProfilePPID.findById.load(data.id);
        } else {
          toast.error("Gagal update profile");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat update profile");
      } finally {
        stateProfilePPID.update.loading = false;
      }
    },
  },
  uploadImage: {
    loading: false,
    async save(file: File, id: string) {
      if (!file || !id) {
        toast.error("File atau ID harus disertakan");
        return;
      }
      try {
        stateProfilePPID.uploadImage.loading = true;

        const form = new FormData();
        form.append("file", file);
        form.append("id", id);

        const res = await ApiFetch.api.ppid.profileppid["edit-img"].post(form);
        if (res.status === 200) {
          toast.success("Berhasil mengunggah gambar");
          await stateProfilePPID.findById.load(id);
        } else {
          toast.error("Gagal mengunggah gambar");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengunggah gambar");
      } finally {
        stateProfilePPID.uploadImage.loading = false;
      }
    }
  }
});

export default stateProfilePPID;
