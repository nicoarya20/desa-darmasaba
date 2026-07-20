import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const lambangDesaForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

const lambangDesaDefaultForm = {
  judul: "",
  deskripsi: "",
};

type LambangDesaForm = Prisma.LambangDesaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const lambangDesa = proxy({
  findUnique: {
    data: null as LambangDesaForm | null,
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
        const response = await fetch(`/api/desa/profile/lambang/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(result.message || "Gagal mengambil data lambang desa");
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        console.error("Load lambang desa error:", msg);
        toast.error("Terjadi kesalahan saat mengambil data lambang desa");
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
    form: { ...lambangDesaDefaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(lambangDesaData: LambangDesaForm) {
      this.id = lambangDesaData.id;
      this.isReadOnly = false;
      this.form = {
        judul: lambangDesaData.judul || "",
        deskripsi: lambangDesaData.deskripsi || "",
      };
    },

    updateField(field: keyof typeof lambangDesaDefaultForm, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const validation = lambangDesaForm.safeParse(this.form);

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
        const response = await fetch(`/api/desa/profile/lambang/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update lambang desa");
          await lambangDesa.findUnique.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update lambang desa");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Update lambang desa error:", errorMessage);
        toast.error("Terjadi kesalahan saat update lambang desa");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.id = "";
      this.form = { ...lambangDesaDefaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },
});

export default lambangDesa;
