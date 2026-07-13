/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const fotoForm = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  deskripsi: z.string().min(1, { message: "Deskripsi is required" }),
  imagesId: z.string().nonempty(),
});

const videoForm = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  deskripsi: z.string().min(1, { message: "Deskripsi is required" }),
  linkVideo: z.string().min(1, { message: "Link video is required" }),
});

const defaultFormFoto = {
  name: "",
  deskripsi: "",
  imagesId: "",
};

const defaultFormVideo = {
  name: "",
  deskripsi: "",
  linkVideo: "",
};

const foto = proxy({
  create: {
    form: { ...defaultFormFoto },
    loading: false,
    async create() {
      const cek = fotoForm.safeParse(foto.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        foto.create.loading = true;
        const res = await ApiFetch.api.desa.gallery.foto["create"].post(
          foto.create.form
        );
        if (res.status === 200) {
          foto.findMany.load();
          return toast.success("Foto berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan foto");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        foto.create.loading = false;
      }
    },
    resetForm() {
      foto.create.form = { ...defaultFormFoto };
    },
  },
  findMany: {
    data: null as
      | Prisma.GalleryFotoGetPayload<{
          include: {
            imageGalleryFoto: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      foto.findMany.loading = true; // ✅ Akses langsung via nama path
      foto.findMany.page = page;
      foto.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.desa.gallery.foto["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          foto.findMany.data = res.data.data ?? [];
          foto.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          foto.findMany.data = [];
          foto.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch foto paginated:", err);
        foto.findMany.data = [];
        foto.findMany.totalPages = 1;
      } finally {
        foto.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.GalleryFotoGetPayload<{
      include: {
        imageGalleryFoto: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/gallery/foto/${id}`);
        if (res.ok) {
          const data = await res.json();
          foto.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch foto:", res.statusText);
          foto.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching foto:", error);
        foto.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        foto.delete.loading = true;
        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.gallery.foto as any)["del"][
          id
        ].delete();
        // Handler del ini return { status, body } (bukan { success }),
        // jadi sukses dideteksi dari absennya res.error (HTTP 2xx).
        if (!res.error) {
          toast.success("Foto berhasil dihapus");
          await foto.findMany.load(); // refresh list
        } else {
          toast.error("Gagal menghapus foto");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus foto");
      } finally {
        foto.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormFoto },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/desa/gallery/foto/${id}`, {
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
            deskripsi: data.deskripsi,
            imagesId: data.imagesId || "",
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
      const cek = fotoForm.safeParse(foto.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        foto.update.loading = true;
        const response = await fetch(`/api/desa/gallery/foto/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            deskripsi: this.form.deskripsi,
            imagesId: this.form.imagesId,
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
          toast.success(result.message || "Foto berhasil diupdate");
          await foto.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate foto");
        }
      } catch (error) {
        console.error("Error updating foto:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate foto"
        );
        return false;
      } finally {
        foto.update.loading = false;
      }
    },
    reset() {
      foto.update.id = "";
      foto.update.form = { ...defaultFormFoto };
    },
  },
  findRecent: {
      data: [] as Prisma.GalleryFotoGetPayload<{
        include: {
          imageGalleryFoto: true;
        };
      }>[],
      loading: false,
  
      async load() {
        try {
          this.loading = true;
          const res = await ApiFetch.api.desa.gallery.foto["find-recent"].get();
          if (res.status === 200 && res.data?.success) {
            this.data = res.data.data ?? [];
          }
        } catch (error) {
          console.error("Gagal fetch foto recent:", error);
        } finally {
          this.loading = false;
        }
      },
    },
});

const video = proxy({
  create: {
    form: { ...defaultFormVideo },
    loading: false,
    async create() {
      const cek = videoForm.safeParse(video.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        video.create.loading = true;
        const res = await ApiFetch.api.desa.gallery.video["create"].post(
          video.create.form
        );
        if (res.status === 200) {
          video.findMany.load();
          return toast.success("Video berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan video");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        video.create.loading = false;
      }
    },
    resetForm() {
      video.create.form = { ...defaultFormVideo };
    },
  },
  findMany: {
    data: null as
      | Prisma.GalleryVideoGetPayload<{
          omit: {
            isActive: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      video.findMany.loading = true; // ✅ Akses langsung via nama path
      video.findMany.page = page;
      video.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.desa.gallery.video["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          video.findMany.data = res.data.data ?? [];
          video.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          video.findMany.data = [];
          video.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch video paginated:", err);
        video.findMany.data = [];
        video.findMany.totalPages = 1;
      } finally {
        video.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.GalleryVideoGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/gallery/video/${id}`);
        if (res.ok) {
          const data = await res.json();
          video.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch video:", res.statusText);
          video.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        video.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        video.delete.loading = true;
        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.gallery.video as any)["del"][
          id
        ].delete();
        // Handler del ini return { status, body } (bukan { success }),
        // jadi sukses dideteksi dari absennya res.error (HTTP 2xx).
        if (!res.error) {
          toast.success("Video berhasil dihapus");
          await video.findMany.load(); // refresh list
        } else {
          toast.error("Gagal menghapus video");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus video");
      } finally {
        video.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormVideo },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/desa/gallery/video/${id}`, {
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
            deskripsi: data.deskripsi,
            linkVideo: data.linkVideo,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading video:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = videoForm.safeParse(video.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        video.update.loading = true;
        const response = await fetch(`/api/desa/gallery/video/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            deskripsi: this.form.deskripsi,
            linkVideo: this.form.linkVideo,
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
          toast.success(result.message || "Video berhasil diupdate");
          await video.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate video");
        }
      } catch (error) {
        console.error("Error updating video:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate video"
        );
        return false;
      } finally {
        video.update.loading = false;
      }
    },
    reset() {
      video.update.id = "";
      video.update.form = { ...defaultFormVideo };
    },
  },
});

const stateGallery = proxy({
  foto,
  video,
});

export default stateGallery;
