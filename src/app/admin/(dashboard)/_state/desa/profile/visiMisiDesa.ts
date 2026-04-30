/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const visiMisiDesaForm = z.object({
  visi: z.string().min(3, "Visi minimal 3 karakter"),
  misi: z.string().min(3, "Misi minimal 3 karakter"),
});

const visiMisiDesaDefaultForm = {
  visi: "",
  misi: "",
};

type VisiMisiDesaForm = Prisma.VisiMisiDesaGetPayload<{
  select: {
    id: true;
    visi: true;
    misi: true;
  };
}>;

const visiMisiDesa = proxy({
  findUnique: {
    data: null as VisiMisiDesaForm | null,
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
        const response = await fetch(`/api/desa/profile/visi-misi/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(
            result.message || "Gagal mengambil data visi misi desa"
          );
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        console.error("Load visi misi desa error:", msg);
        toast.error("Terjadi kesalahan saat mengambil data visi misi desa");
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
    form: { ...visiMisiDesaDefaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(visiMisiData: VisiMisiDesaForm) {
      this.id = visiMisiData.id;
      this.isReadOnly = false;
      this.form = {
        visi: visiMisiData.visi || "",
        misi: visiMisiData.misi || "",
      };
    },

    updateField(field: keyof typeof visiMisiDesaDefaultForm, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const validation = visiMisiDesaForm.safeParse(this.form);

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
        const response = await fetch(`/api/desa/profile/visi-misi/${this.id}`, {
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
          toast.success("Berhasil update visi misi desa");
          await visiMisiDesa.findUnique.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update visi misi desa");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Update visi misi desa error:", errorMessage);
        toast.error("Terjadi kesalahan saat update visi misi desa");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.id = "";
      this.form = { ...visiMisiDesaDefaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },
});

export default visiMisiDesa;
