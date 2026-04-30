/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const profilPerbekelForm = z.object({
  biodata: z.string().min(3, "Biodata minimal 3 karakter"),
  pengalaman: z.string().min(3, "Pengalaman minimal 3 karakter"),
  pengalamanOrganisasi: z
    .string()
    .min(3, "Pengalaman Organisasi minimal 3 karakter"),
  programUnggulan: z.string().min(3, "Program Unggulan minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const profilPerbekelDefaultForm = {
  biodata: "",
  pengalaman: "",
  pengalamanOrganisasi: "",
  programUnggulan: "",
  imageId: "",
};

type ProfilPerbekelForm = Prisma.ProfilPerbekelGetPayload<{
  select: {
    id: true;
    biodata: true;
    pengalaman: true;
    pengalamanOrganisasi: true;
    programUnggulan: true;
    imageId: true;
    image?: {
      select: {
        link: true;
      };
    };
  };
}>;

const profilPerbekel = proxy({
  findUnique: {
    data: null as ProfilPerbekelForm | null,
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
        const response = await fetch(`/api/desa/profile/profileperbekel/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(
            result.message || "Gagal mengambil data profil perbekel"
          );
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        toast.error("Terjadi kesalahan saat mengambil data profil perbekel");
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
    form: { ...profilPerbekelDefaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(profilData: ProfilPerbekelForm) {
      this.id = profilData.id;
      this.isReadOnly = false;
      this.form = {
        biodata: profilData.biodata || "",
        pengalaman: profilData.pengalaman || "",
        pengalamanOrganisasi: profilData.pengalamanOrganisasi || "",
        programUnggulan: profilData.programUnggulan || "",
        imageId: profilData.imageId || "",
      };
    },

    updateField(field: keyof typeof profilPerbekelDefaultForm, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const validation = profilPerbekelForm.safeParse(this.form);

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
        const response = await fetch(
          `/api/desa/profile/profileperbekel/${this.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update profil perbekel");
          await profilPerbekel.findUnique.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update profil perbekel");
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        toast.error("Terjadi kesalahan saat update profil perbekel");
        return false;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.id = "";
      this.form = { ...profilPerbekelDefaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },

  async loadForEdit(id: string) {
    const profileData = await this.findUnique.load(id);
    if (profileData) {
      this.edit.initialize(profileData);
    }
    return profileData;
  },

  reset() {
    this.findUnique.reset();
    this.edit.reset();
  },
});

export default profilPerbekel;
