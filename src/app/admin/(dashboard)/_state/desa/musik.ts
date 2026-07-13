/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// 1. Schema validasi dengan Zod
const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  artis: z.string().min(3, "Artis minimal 3 karakter"),
  deskripsi: z.string().optional(),
  durasi: z.string().min(3, "Durasi minimal 3 karakter"),
  audioFileId: z.string().nonempty(),
  coverImageId: z.string().nonempty(),
  genre: z.string().optional(),
  tahunRilis: z.number().optional().or(z.literal(undefined)),
});

// 2. Default value form musik
const defaultForm = {
  judul: "",
  artis: "",
  deskripsi: "",
  durasi: "",
  audioFileId: "",
  coverImageId: "",
  genre: "",
  tahunRilis: undefined as number | undefined,
};

// 3. Musik proxy
const musik = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(musik.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        musik.create.loading = true;
        const res = await ApiFetch.api.desa.musik["create"].post(
          musik.create.form
        );
        if (res.status === 200) {
          musik.findMany.load();
          return toast.success("Musik berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan musik");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        musik.create.loading = false;
      }
    },
    resetForm() {
      musik.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as
      | Prisma.MusikDesaGetPayload<{
          include: {
            audioFile: true;
            coverImage: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", genre = "") => {
      const startTime = Date.now();
      musik.findMany.loading = true;
      musik.findMany.page = page;
      musik.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (genre) query.genre = genre;

        const res = await ApiFetch.api.desa.musik["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          musik.findMany.data = res.data.data ?? [];
          musik.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          musik.findMany.data = [];
          musik.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch musik paginated:", err);
        musik.findMany.data = [];
        musik.findMany.totalPages = 1;
      } finally {
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          musik.findMany.loading = false;
        }, delay);
      }
    },
  },

  findUnique: {
    data: null as Prisma.MusikDesaGetPayload<{
      include: {
        audioFile: true;
        coverImage: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        musik.findUnique.loading = true;
        const res = await fetch(`/api/desa/musik/${id}`);
        if (res.ok) {
          const data = await res.json();
          musik.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch musik:", res.statusText);
          musik.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching musik:", error);
        musik.findUnique.data = null;
      } finally {
        musik.findUnique.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        musik.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.musik as any)["delete"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Musik berhasil dihapus");
          await musik.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal menghapus musik");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus musik");
      } finally {
        musik.delete.loading = false;
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
        const response = await fetch(`/api/desa/musik/${id}`, {
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
            artis: data.artis,
            deskripsi: data.deskripsi || "",
            durasi: data.durasi,
            audioFileId: data.audioFileId || "",
            coverImageId: data.coverImageId || "",
            genre: data.genre || "",
            tahunRilis: data.tahunRilis || undefined,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading musik:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(musik.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        musik.edit.loading = true;

        const response = await fetch(`/api/desa/musik/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: this.form.judul,
            artis: this.form.artis,
            deskripsi: this.form.deskripsi,
            durasi: this.form.durasi,
            audioFileId: this.form.audioFileId,
            coverImageId: this.form.coverImageId,
            genre: this.form.genre,
            tahunRilis: this.form.tahunRilis,
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
          toast.success("Musik berhasil diupdate");
          await musik.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update musik");
        }
      } catch (error) {
        console.error("Error updating musik:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update musik"
        );
        return false;
      } finally {
        musik.edit.loading = false;
      }
    },

    reset() {
      musik.edit.id = "";
      musik.edit.form = { ...defaultForm };
    },
  },
});

// 4. State global
const stateDashboardMusik = proxy({
  musik,
});

export default stateDashboardMusik;
