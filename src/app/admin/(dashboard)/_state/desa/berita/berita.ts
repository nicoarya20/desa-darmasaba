/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { tanggalKeInput, tanggalTerbitAtauDibuat } from "@/lib/tanggal-terbit";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  kategoriBeritaId: z.string().nonempty(),
  imageId: z.string().nonempty(),
  imageIds: z.array(z.string()),
  linkVideo: z.string().optional(),
  tanggalTerbit: z.string().optional(),
});

const defaultForm = {
  judul: "",
  deskripsi: "",
  imageId: "",
  content: "",
  kategoriBeritaId: "",
  imageIds: [] as string[],
  linkVideo: "",
  /** `YYYY-MM-DD` (WITA). Create: default hari ini; edit: "" = tidak diubah saat update. */
  tanggalTerbit: "",
};

const berita = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(berita.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        berita.create.loading = true;
        const res = await ApiFetch.api.desa.berita["create"].post(
          berita.create.form
        );
        if (res.status === 200) {
          berita.findMany.load();
          return toast.success("Berita berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan berita");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        berita.create.loading = false;
      }
    },
    resetForm() {
      berita.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", kategori = "") => {
      const startTime = Date.now();
      berita.findMany.loading = true;
      berita.findMany.page = page;
      berita.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res = await ApiFetch.api.desa.berita["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          berita.findMany.data = res.data.data ?? [];
          berita.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          berita.findMany.data = [];
          berita.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch berita paginated:", err);
        berita.findMany.data = [];
        berita.findMany.totalPages = 1;
      } finally {
        // pastikan minimal 300ms sebelum loading = false (biar UX smooth)
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          berita.findMany.loading = false;
        }, delay);
      }
    },
  },

  findUnique: {
    data: null as Prisma.BeritaGetPayload<{
      include: {
        image: true;
        images: true;
        kategoriBerita: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/berita/${id}`);
        if (res.ok) {
          const data = await res.json();
          berita.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch berita:", res.statusText);
          berita.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching berita:", error);
        berita.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        berita.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.berita as any)["delete"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Berita berhasil dihapus");
          await berita.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal menghapus berita");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus berita");
      } finally {
        berita.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/berita/${id}`, {
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            content: data.content,
            kategoriBeritaId: data.kategoriBeritaId || "",
            imageId: data.imageId || "",
            imageIds: data.images?.map((img: any) => img.id) || [],
            linkVideo: data.linkVideo || "",
            tanggalTerbit: tanggalKeInput(tanggalTerbitAtauDibuat(data)),
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(berita.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        berita.edit.loading = true;

        const response = await fetch(`/api/desa/berita/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: this.form.judul,
            deskripsi: this.form.deskripsi,
            content: this.form.content,
            kategoriBeritaId: this.form.kategoriBeritaId || null,
            imageId: this.form.imageId,
            imageIds: this.form.imageIds,
            linkVideo: this.form.linkVideo,
            tanggalTerbit: this.form.tanggalTerbit,
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
          toast.success("Berhasil update berita");
          await berita.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update berita");
        }
      } catch (error) {
        console.error("Error updating berita:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update berita"
        );
        return false;
      } finally {
        berita.edit.loading = false;
      }
    },

    reset() {
      berita.edit.id = "";
      berita.edit.form = { ...defaultForm };
    },
  },
  findFirst: {
    data: null as Prisma.BeritaGetPayload<{
      include: {
        image: true;
        kategoriBerita: true;
      };
    }> | null,
    loading: false,
    async load(kategori?: string) {
      this.loading = true;
      try {
        const res = await ApiFetch.api.desa.berita["find-first"].get({
          query: kategori ? { kategori } : {},
        });

        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data || null;
        } else {
          this.data = null;
        }
      } catch (err) {
        console.error("Gagal fetch berita terbaru:", err);
        this.data = null;
      } finally {
        this.loading = false;
      }
    },
  },
  findRecent: {
    data: [] as Prisma.BeritaGetPayload<{
      include: {
        image: true;
        kategoriBerita: true;
      };
    }>[],
    loading: false,

    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.desa.berita["find-recent"].get();
        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data ?? [];
        }
      } catch (error) {
        console.error("Gagal fetch berita recent:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});

export default berita;
