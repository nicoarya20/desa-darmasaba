import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  biodata: z.string().min(3, "Biodata minimal 3 karakter"),
  riwayat: z.string().min(3, "Riwayat minimal 3 karakter"),
  pengalaman: z.string().min(3, "Pengalaman minimal 3 karakter"),
  unggulan: z.string().min(3, "Unggulan minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const defaultForm = {
  name: "",
  biodata: "",
  riwayat: "",
  pengalaman: "",
  unggulan: "",
  imageId: "",
};

type ProfilePPIDForm = Prisma.ProfilePPIDGetPayload<{
  select: {
    id: true;
    name: true;
    biodata: true;
    riwayat: true;
    pengalaman: true;
    unggulan: true;
    imageId: true;
    image?: { select: { link: true } };
  };
}>;

const stateProfilePPID = proxy({
  profile: {
    data: null as ProfilePPIDForm | null,
    loading: false,
    error: null as string | null,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const res = await fetch(`/api/ppid/profileppid/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        if (result.success) {
          this.data = result.data;
          return result.data;
        } else throw new Error(result.message || "Gagal memuat data profile");
      } catch (err) {
        const msg = (err as Error).message;
        this.error = msg;
        console.error("Load profile error:", msg);
        toast.error("Gagal memuat data profile");
        return null;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.data = null;
      this.error = null;
      this.loading = false;
    },
  },

  editForm: {
    id: "",
    form: { ...defaultForm },
    originalForm: { ...defaultForm }, // ✅ Tambah field originalForm
    loading: false,
    error: null as string | null,

    initialize(profileData: ProfilePPIDForm) {
      this.id = profileData.id;
      const data = {
        name: profileData.name || "",
        biodata: profileData.biodata || "",
        riwayat: profileData.riwayat || "",
        pengalaman: profileData.pengalaman || "",
        unggulan: profileData.unggulan || "",
        imageId: profileData.imageId || "",
      };
      this.form = { ...data };
      this.originalForm = { ...data }; // ✅ Simpan versi original
    },

    updateField(field: keyof typeof defaultForm, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const check = templateForm.safeParse(this.form);
      if (!check.success) {
        toast.error(
          check.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
        );
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const res = await fetch(`/api/ppid/profileppid/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        if (result.success) {
          toast.success("Berhasil update profile");
          this.originalForm = { ...this.form }; // ✅ Update original setelah sukses
          return true;
        } else throw new Error(result.message || "Gagal update profile");
      } catch (err) {
        const msg = (err as Error).message;
        this.error = msg;
        toast.error(msg);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // ✅ Tambahan reset ke original data
    resetToOriginal() {
      this.form = { ...this.originalForm };
      toast.info("Data dikembalikan ke kondisi awal");
    },

    reset() {
      this.id = "";
      this.form = { ...defaultForm };
      this.originalForm = { ...defaultForm };
      this.error = null;
      this.loading = false;
    },
  },

  async loadForEdit(id: string) {
    const data = await this.profile.load(id);
    if (data) this.editForm.initialize(data);
    return data;
  },

  reset() {
    this.profile.reset();
    this.editForm.reset();
  },
});

export default stateProfilePPID;
