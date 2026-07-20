import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePejabatDesa = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  position: z.string().min(3, "Posisi minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const defaultFormPejabatDesa = {
  name: "",
  position: "",
  imageId: "",
};

type PejabatDesaForm = {
  id: string;
  name: string;
  position: string;
  imageId: string | null;
  image?: {
    id: string;
    name: string;
    link: string;
    path: string;
    mimeType: string;
    realName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isActive: boolean;
};

const pejabatDesa = proxy({
  findUnique: {
    data: null as PejabatDesaForm | null,
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
        const response = await fetch(`/api/landingpage/pejabatdesa/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(
            result.message || "Gagal mengambil data pejabat desa"
          );
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Load pejabat desa error:", errorMessage);
        toast.error("Terjadi kesalahan saat mengambil data pejabat desa");
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
  edit: {
    id: "",
    form: { ...defaultFormPejabatDesa },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(profileData: PejabatDesaForm) {
      this.id = profileData.id;
      this.isReadOnly = false;
      this.form = {
        name: profileData.name || "",
        position: profileData.position || "",
        imageId: profileData.imageId || "",
      };
    },

    updateField(field: keyof typeof defaultFormPejabatDesa, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const validation = templatePejabatDesa.safeParse(this.form);

      if (!validation.success) {
        const errors = validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const url = new URL(
          `/api/landingpage/pejabatdesa/${encodeURIComponent(this.id)}`,
          window.location.origin
        );
        const response = await fetch(url.toString(), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update profile");
          await pejabatDesa.findUnique.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update profile");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Update profile error:", errorMessage);
        toast.error(errorMessage || "Terjadi kesalahan saat update profile");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.id = "";
      this.form = { ...defaultFormPejabatDesa };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },
});

export default pejabatDesa;
