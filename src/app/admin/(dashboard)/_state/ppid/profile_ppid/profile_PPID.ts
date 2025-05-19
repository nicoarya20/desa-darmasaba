import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/**
 * Schema validasi form ProfilePPID menggunakan Zod.
 */
const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  biodata: z.string().min(3, "Biodata minimal 3 karakter"),
  riwayat: z.string().min(3, "Riwayat minimal 3 karakter"),
  pengalaman: z.string().min(3, "Pengalaman minimal 3 karakter"),
  unggulan: z.string().min(3, "Unggulan minimal 3 karakter"),
});

/**
 * Tipe data ProfilePPID yang digunakan dalam form dan API, berdasarkan Prisma schema.
 */
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

/**
 * State utama ProfilePPID yang mencakup fitur:
 * - Ambil data berdasarkan ID
 * - Update data
 * - Upload gambar
 */
const stateProfilePPID = proxy({
  /**
   * Bagian untuk ambil data berdasarkan ID
   */
  findById: {
    data: null as ProfilePPIDForm | null,
    loading: false,

    /**
     * Inisialisasi data kosong ke dalam state.
     */
    initialize() {
      stateProfilePPID.findById.data = {
        id: '',
        name: '',
        biodata: '',
        riwayat: '',
        pengalaman: '',
        unggulan: '',
        imageUrl: ''
      } as ProfilePPIDForm;
    },

    /**
     * Mengambil data profil berdasarkan ID.
     * @param {string} id - ID dari profile yang ingin diambil.
     */
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

  /**
   * Bagian untuk update data profile
   */
  update: {
    loading: false,

    /**
     * Melakukan validasi dan menyimpan perubahan data profile ke server.
     * @param {ProfilePPIDForm} data - Data profil yang akan disimpan.
     */
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

  /**
   * Bagian untuk upload gambar profil
   */
  uploadImage: {
    loading: false,

    /**
     * Mengunggah gambar profil berdasarkan ID.
     * @param {File} file - File gambar yang akan diunggah.
     * @param {string} id - ID dari profil yang akan diperbarui gambarnya.
     */
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
    },
  },
});

/**
 * Ekspor state utama ProfilePPID untuk digunakan di komponen lain.
 */
export default stateProfilePPID;
