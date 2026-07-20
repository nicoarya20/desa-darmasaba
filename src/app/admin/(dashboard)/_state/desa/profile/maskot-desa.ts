/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const maskotForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  images: z
    .array(
      z.object({
        label: z.string().min(1, "Label wajib"),
        imageId: z.string().min(1, "Image ID wajib"),
      })
    )
    .min(1, "Minimal 1 gambar harus diisi"),
});

const maskotDefaultForm = {
  judul: "",
  deskripsi: "",
  images: [] as { label: string; imageId: string }[],
};

type FormData = typeof maskotDefaultForm;

type MaskotDesaForm = Prisma.MaskotDesaGetPayload<{
  include: {
    images: {
      include: {
        image: {
          select: {
            id: true;
            name: true;
            path: true;
            link: true;
          };
        };
      };
    };
  };
}>;

const maskotDesa = proxy({
  findUnique: {
    data: null as MaskotDesaForm | null,
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
        const response = await fetch(`/api/desa/profile/maskot/${id}`);
        const result = await response.json();

        if (response.ok && result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(result.message || "Gagal mengambil data profile");
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        console.error("Load profile error:", msg);
        toast.error("Terjadi kesalahan saat mengambil data profile");
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

  update: {
    id: "",
    form: { ...maskotDefaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(profileData: MaskotDesaForm) {
      this.id = profileData.id;
      this.isReadOnly = false;
      this.form = {
        judul: profileData.judul || "",
        deskripsi: profileData.deskripsi || "",
        images: (profileData.images || []).map((img) => ({
          label: img.label,
          imageId: img?.image?.id || "",
        })),
      };
    },

    updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
      this.form[field] = value;
    },

    addImage() {
      this.form.images.push({ label: "", imageId: "" });
    },

    removeImage(index: number) {
      this.form.images.splice(index, 1);
    },

    async submit() {
      const validation = maskotForm.safeParse(this.form);

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
        const response = await fetch(`/api/desa/profile/maskot/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          toast.success("Berhasil update profile");
          await maskotDesa.findUnique.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update profile");
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        toast.error("Terjadi kesalahan saat update profile");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.id = "";
      this.form = { ...maskotDefaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },

  async loadForEdit(id: string) {
    const data = await this.findUnique.load(id);
    if (data) {
      this.update.initialize(data);
    }
    return data;
  },

  reset() {
    this.findUnique.reset();
    this.update.reset();
  },
});

export default maskotDesa;
