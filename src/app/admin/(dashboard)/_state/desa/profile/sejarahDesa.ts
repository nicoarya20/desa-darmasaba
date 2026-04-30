/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const sejarahDesaForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

const sejarahDesaDefaultForm = {
  judul: "",
  deskripsi: "",
};

type SejarahDesaForm = Prisma.SejarahDesaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const sejarahDesa = proxy({
  findUnique: {
    data: null as SejarahDesaForm | null,
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
        const response = await fetch(`/api/desa/profile/sejarah/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(
            result.message || "Gagal mengambil data sejarah desa"
          );
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        console.error("Load sejarah desa error:", msg);
        toast.error("Terjadi kesalahan saat mengambil data sejarah desa");
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
    form: { ...sejarahDesaDefaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(sejarahData: SejarahDesaForm) {
      this.id = sejarahData.id;
      this.isReadOnly = false;
      this.form = {
        judul: sejarahData.judul || "",
        deskripsi: sejarahData.deskripsi || "",
      };
    },

    updateField(field: keyof typeof sejarahDesaDefaultForm, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const validation = sejarahDesaForm.safeParse(this.form);

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
        const response = await fetch(`/api/desa/profile/sejarah/${this.id}`, {
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
          await sejarahDesa.findUnique.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update profile");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Update profile error:", errorMessage);
        toast.error("Terjadi kesalahan saat update profile");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.id = "";
      this.form = { ...sejarahDesaDefaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },
});

export default sejarahDesa;
