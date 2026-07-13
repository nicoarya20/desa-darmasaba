/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import ApiFetch from "@/lib/api-fetch";

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
    },
  },
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
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
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
    },
  },
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
        const response = await fetch(`/api/desa/profile/lambang/${id}`);

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
        const response = await fetch(`/api/desa/profile/lambang/${this.id}`, {
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
    },
  },
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

//========================================= MANTAN PERBEKEL ========================================= //
const mantanPerbekelForm = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  daerah: z.string().min(3, "Daerah minimal 3 karakter"),
  periode: z.string().min(3, "Periode minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const mantanPerbekelDefaultForm = {
  nama: "",
  daerah: "",
  periode: "",
  imageId: "",
};

const mantanPerbekel = proxy({
  create: {
    form: { ...mantanPerbekelDefaultForm },
    loading: false,
    async create() {
      const cek = mantanPerbekelForm.safeParse(mantanPerbekel.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        mantanPerbekel.create.loading = true;
        const res = await ApiFetch.api.desa.mantanperbekel["create"].post(
          mantanPerbekel.create.form
        );
        if (res.status === 200) {
          mantanPerbekel.findMany.load();
          return toast.success("Foto berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan foto");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        mantanPerbekel.create.loading = false;
      }
    },
    resetForm() {
      mantanPerbekel.create.form = { ...mantanPerbekelDefaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.PerbekelDariMasaKeMasaGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      mantanPerbekel.findMany.loading = true; // ✅ Akses langsung via nama path
      mantanPerbekel.findMany.page = page;
      mantanPerbekel.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.desa.mantanperbekel["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          mantanPerbekel.findMany.data = res.data.data ?? [];
          mantanPerbekel.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          mantanPerbekel.findMany.data = [];
          mantanPerbekel.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch mantan perbekel paginated:", err);
        mantanPerbekel.findMany.data = [];
        mantanPerbekel.findMany.totalPages = 1;
      } finally {
        mantanPerbekel.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PerbekelDariMasaKeMasaGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/mantanperbekel/${id}`);
        if (res.ok) {
          const data = await res.json();
          mantanPerbekel.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch mantan perbekel:", res.statusText);
          mantanPerbekel.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching mantan perbekel:", error);
        mantanPerbekel.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        mantanPerbekel.delete.loading = true;
        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.mantanperbekel as any)["del"][
          id
        ].delete();
        // Handler del ini return { status, body } (bukan { success }),
        // jadi sukses dideteksi dari absennya res.error (HTTP 2xx).
        if (!res.error) {
          toast.success("Mantan perbekel berhasil dihapus");
          await mantanPerbekel.findMany.load(); // refresh list
        } else {
          toast.error("Gagal menghapus mantan perbekel");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus mantan perbekel");
      } finally {
        mantanPerbekel.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...mantanPerbekelDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/desa/mantanperbekel/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            nama: data.nama,
            daerah: data.daerah,
            periode: data.periode,
            imageId: data.imageId || "",
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading foto:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = mantanPerbekelForm.safeParse(mantanPerbekel.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        mantanPerbekel.update.loading = true;
        const response = await fetch(`/api/desa/mantanperbekel/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: this.form.nama,
            daerah: this.form.daerah,
            periode: this.form.periode,
            imageId: this.form.imageId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "Mantan perbekel berhasil diupdate");
          await mantanPerbekel.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate mantan perbekel");
        }
      } catch (error) {
        console.error("Error updating mantan perbekel:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate mantan perbekel"
        );
        return false;
      } finally {
        mantanPerbekel.update.loading = false;
      }
    },
    reset() {
      mantanPerbekel.update.id = "";
      mantanPerbekel.update.form = { ...mantanPerbekelDefaultForm };
    },
  },
});

const stateProfileDesa = proxy({
  lambangDesa,
  maskotDesa,
  profilPerbekel,
  visiMisiDesa,
  sejarahDesa,
  mantanPerbekel,
});

export default stateProfileDesa;
