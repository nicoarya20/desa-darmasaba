import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ========================================= SEJARAH DESA ========================================= //
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
        const response = await fetch(`/api/desa/profile/sejarah-desa/${id}`);
        
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
          // Validate form
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
            const response = await fetch(`/api/desa/profile/sejarah-desa/${this.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(this.form),
            });
    
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            if (result.success) {
              toast.success("Berhasil update profile");
              // Refresh profile data
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
    
        // Reset form
        reset() {
          this.id = "";
          this.form = { ...sejarahDesaDefaultForm };
          this.error = null;
          this.loading = false;
          this.isReadOnly = false;
        }
  }
});

// ========================================= VISI MISI DESA ========================================= //
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
          // Validate form
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
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            if (result.success) {
              toast.success("Berhasil update visi misi desa");
              // Refresh profile data
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
    
        // Reset form
        reset() {
          this.id = "";
          this.form = { ...visiMisiDesaDefaultForm };
          this.error = null;
          this.loading = false;
          this.isReadOnly = false;
        }
  }
});

// ========================================= LAMBANG DESA ========================================= //
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
        const response = await fetch(`/api/desa/profile/lambang-desa/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(
            result.message || "Gagal mengambil data lambang desa"
          );
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
          // Validate form
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
            const response = await fetch(`/api/desa/profile/lambang-desa/${this.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(this.form),
            });
    
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            if (result.success) {
              toast.success("Berhasil update lambang desa");
              // Refresh profile data
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
    
        // Reset form
        reset() {
          this.id = "";
          this.form = { ...lambangDesaDefaultForm };
          this.error = null;
          this.loading = false;
          this.isReadOnly = false;
        }
  }
});

// ========================================= MASKOT DESA ========================================= //
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
        const response = await fetch(`/api/desa/profile/maskot-desa/${id}`);
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
          imageId: img.image.id,
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
        const response = await fetch(
          `/api/desa/profile/maskot-desa/${this.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form),
          }
        );

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

// ========================================= PROFIL PERBEKEL ========================================= //
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
        const response = await fetch(`/api/desa/profile/profil-perbekel/${id}`);

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
          `/api/desa/profile/profil-perbekel/${this.id}`,
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

const stateProfileDesa = {
  maskotDesa,
  profilPerbekel,
  visiMisiDesa,
  sejarahDesa,
};

export default stateProfileDesa;
