import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateProgramInovasi = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  link: z.string().min(3, "Link minimal 3 karakter"),
});

type ProgramInovasiForm = Prisma.ProgramInovasiGetPayload<{
  select: {
    name: true;
    description: true;
    imageId: true;
    link: true;
  };
}>;

const programInovasi = proxy({
  create: {
    form: {} as ProgramInovasiForm,
    loading: false,
    async create() {
      // Ensure all required fields are non-null
      const formData = {
        name: programInovasi.create.form.name || "",
        description: programInovasi.create.form.description || "",
        imageId: programInovasi.create.form.imageId || "",
        link: programInovasi.create.form.link || "",
      };

      const cek = templateProgramInovasi.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        programInovasi.create.loading = true;
        const res = await ApiFetch.api.landingpage.programinovasi[
          "create"
        ].post(formData);
        if (res.status === 200) {
          programInovasi.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        programInovasi.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.landingpage.programinovasi[
        "find-many"
      ].get();
      if (res.status === 200) {
        programInovasi.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramInovasiGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/programinovasi/${id}`);
        if (res.ok) {
          const data = await res.json();
          programInovasi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch program inovasi:", res.statusText);
          programInovasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching program inovasi:", error);
        programInovasi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        programInovasi.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/programinovasi/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Program inovasi berhasil dihapus");
          await programInovasi.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus program inovasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus program inovasi");
      } finally {
        programInovasi.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: {} as ProgramInovasiForm,
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/landingpage/programinovasi/${id}`, {
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
            name: data.name,
            description: data.description,
            imageId: data.imageId,
            link: data.link,
          };
          return data;
        } else {
          throw new Error(
            result?.message || "Gagal mengambil data program inovasi"
          );
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data program inovasi");
      } finally {
        programInovasi.update.loading = false;
      }
    },

    async update() {
      const cek = templateProgramInovasi.safeParse(programInovasi.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        programInovasi.update.loading = true;

        const response = await fetch(
          `/api/landingpage/programinovasi/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              description: this.form.description,
              imageId: this.form.imageId,
              link: this.form.link,
            }),
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
          toast.success("Berhasil update program inovasi");
          await programInovasi.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update program inovasi");
        }
      } catch (error) {
        console.error("Error updating program inovasi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update program inovasi"
        );
        return false;
      } finally {
        programInovasi.update.loading = false;
      }
    },
  },
});

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
      this.isReadOnly = false; // Semua data bisa diedit
      this.form = {
        name: profileData.name || "",
        position: profileData.position || "",
        imageId: profileData.imageId || "",
      };
    },

    // Update form field
    updateField(field: keyof typeof defaultFormPejabatDesa, value: string) {
      this.form[field] = value;
    },

    // Submit form
    async submit() {
      // Validate form
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
        const response = await fetch(
          `/api/landingpage/pejabatdesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
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
          toast.success("Berhasil update profile");
          // Refresh profile data
          await pejabatDesa.findUnique.load(this.id);
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
      this.form = { ...defaultFormPejabatDesa };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },
});

const templateMediaSosial = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  iconUrl: z.string().min(3, "Icon URL minimal 3 karakter"),
});

type MediaSosialForm = {
  name: string;
  imageId: string;
  iconUrl: string;
};

const mediaSosial = proxy({
  create: {
    form: {} as MediaSosialForm,
    loading: false,
    async create() {
      // Ensure all required fields are non-null
      const formData = {
        name: mediaSosial.create.form.name || "",
        imageId: mediaSosial.create.form.imageId || "",
        iconUrl: mediaSosial.create.form.iconUrl || "",
      };

      const cek = templateMediaSosial.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        mediaSosial.create.loading = true;
        const res = await ApiFetch.api.landingpage.mediasosial["create"].post(
          formData
        );
        if (res.status === 200) {
          mediaSosial.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        mediaSosial.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.MediaSosialGetPayload<{ include: { image: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.landingpage.mediasosial["find-many"].get();
      if (res.status === 200) {
        mediaSosial.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.MediaSosialGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
    
      mediaSosial.update.loading = true;
      try {
        const res = await fetch(`/api/landingpage/mediasosial/${id}`);
        if (res.ok) {
          const data = await res.json();
          mediaSosial.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch media sosial:", res.statusText);
          mediaSosial.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching media sosial:", error);
        mediaSosial.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        mediaSosial.delete.loading = true;

        const response = await fetch(`/api/landingpage/mediasosial/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Media Sosial berhasil dihapus");
          await mediaSosial.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus media sosial");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus media sosial");
      } finally {
        mediaSosial.delete.loading = false;
      }
    },
  },
  update: {
      id: "",
      form: {} as MediaSosialForm,
      loading: false,
  
      async load(id: string) {
        if (!id) {
          toast.warn("ID tidak valid");
          return null;
        }
      
        mediaSosial.update.loading = true; // ✅ Tambahkan ini di awal
      
        try {
          const response = await fetch(`/api/landingpage/mediasosial/${id}`, {
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
              name: data.name || "",
              imageId: data.imageId || "",
              iconUrl: data.iconUrl || "",
            };
            return data;
          } else {
            throw new Error(result?.message || "Gagal mengambil data media sosial");
          }
        } catch (error) {
          console.error((error as Error).message);
          toast.error("Terjadi kesalahan saat mengambil data media sosial");
        } finally {
          mediaSosial.update.loading = false; // ✅ Supaya berhenti loading walau error
        }
      },
      
      async update() {
        const cek = templateMediaSosial.safeParse(mediaSosial.update.form);
        if (!cek.success) {
          const err = `[${cek.error.issues
            .map((v) => `${v.path.join(".")}`)
            .join("\n")}] required`;
          toast.error(err);
          return false;
        }
  
        try {
          mediaSosial.update.loading = true;
  
          const response = await fetch(`/api/landingpage/mediasosial/${this.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              imageId: this.form.imageId,
              iconUrl: this.form.iconUrl,
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
            toast.success("Berhasil update media sosial");
            await mediaSosial.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(result.message || "Gagal update media sosial");
          }
        } catch (error) {
          console.error("Error updating media sosial:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat update media sosial"
          );
          return false;
        } finally {
          mediaSosial.update.loading = false;
        }
      },
    },
});

const profileLandingPageState = proxy({
  programInovasi,
  pejabatDesa,
  mediaSosial,
});

export default profileLandingPageState;
