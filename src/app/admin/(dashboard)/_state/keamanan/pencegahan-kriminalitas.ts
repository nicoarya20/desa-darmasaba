import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  pencegahanKriminalitas: z.object({
    programKeamanan: z.object({
      nama: z.string().min(1, "Nama minimal 1 karakter"),
      deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
      slug: z.string().min(1, "Slug minimal 1 karakter"),
    }),
    tipsKeamanan: z.object({
      judul: z.string().min(1, "Judul minimal 1 karakter"),
      konten: z.string().min(1, "Konten minimal 1 karakter"),
      slug: z.string().min(1, "Slug minimal 1 karakter"),
    }),
    videoKeamanan: z.object({
      judul: z.string().min(1, "Judul minimal 1 karakter"),
      deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
      videoUrl: z.string().min(1, "Video URL minimal 1 karakter"),
      slug: z.string().min(1, "Slug minimal 1 karakter"),
    }),
  }),
});

const defaultForm = {
  pencegahanKriminalitas: {
    programKeamanan: {
      nama: "",
      deskripsi: "",
      slug: "",
    },
    tipsKeamanan: {
      judul: "",
      konten: "",
      slug: "",
    },
    videoKeamanan: {
      judul: "",
      deskripsi: "",
      videoUrl: "",
      slug: "",
    },
  },
};

const pencegahanKriminalitasState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(
        pencegahanKriminalitasState.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pencegahanKriminalitasState.create.loading = true;
        const res = await ApiFetch.api.keamanan.pencegahankriminalitas[
          "create"
        ].post(pencegahanKriminalitasState.create.form.pencegahanKriminalitas);
        if (res.status === 200) {
          pencegahanKriminalitasState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pencegahanKriminalitasState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PencegahanKriminalitasGetPayload<{
          include: {
            programKeamanan: true;
            tipsKeamanan: true;
            videoKeamanan: true;
          };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.keamanan.pencegahankriminalitas[
        "find-many"
      ].get();
      if (res.status === 200) {
        pencegahanKriminalitasState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.PencegahanKriminalitasGetPayload<{
      include: {
        programKeamanan: true;
        tipsKeamanan: true;
        videoKeamanan: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/pencegahankriminalitas/${id}`);
        if (res.ok) {
          const data = await res.json();
          pencegahanKriminalitasState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pencegahanKriminalitasState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        pencegahanKriminalitasState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pencegahanKriminalitasState.delete.loading = true;
        const response = await fetch(
          `/api/keamanan/pencegahankriminalitas/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Pencegahan kriminalitas berhasil dihapus"
          );
          await pencegahanKriminalitasState.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus pencegahan kriminalitas"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pencegahan kriminalitas");
      } finally {
        pencegahanKriminalitasState.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        pencegahanKriminalitasState.update.loading = true;
        const response = await fetch(
          `/api/keamanan/pencegahankriminalitas/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          pencegahanKriminalitasState.update.id = data.id;
          pencegahanKriminalitasState.update.form = {
            pencegahanKriminalitas: {
              programKeamanan: {
                nama: data.programKeamanan.nama,
                deskripsi: data.programKeamanan.deskripsi,
                slug: data.programKeamanan.slug,
              },
              tipsKeamanan: {
                judul: data.tipsKeamanan.judul,
                konten: data.tipsKeamanan.konten,
                slug: data.tipsKeamanan.slug,
              },
              videoKeamanan: {
                judul: data.videoKeamanan.judul,
                deskripsi: data.videoKeamanan.deskripsi,
                videoUrl: data.videoKeamanan.videoUrl,
                slug: data.videoKeamanan.slug,
              },
            },
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Gagal update:", error);
        toast.error(
          "Terjadi kesalahan saat mengupdate pencegahan kriminalitas"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(
        pencegahanKriminalitasState.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pencegahanKriminalitasState.update.loading = true;
        const response = await fetch(
          `/api/keamanan/pencegahankriminalitas/${pencegahanKriminalitasState.update.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pencegahanKriminalitas: {
                programKeamanan: {
                  nama: pencegahanKriminalitasState.update.form
                    .pencegahanKriminalitas.programKeamanan.nama,
                  deskripsi:
                    pencegahanKriminalitasState.update.form
                      .pencegahanKriminalitas.programKeamanan.deskripsi,
                  slug: pencegahanKriminalitasState.update.form
                    .pencegahanKriminalitas.programKeamanan.slug,
                },
                tipsKeamanan: {
                  judul:
                    pencegahanKriminalitasState.update.form
                      .pencegahanKriminalitas.tipsKeamanan.judul,
                  konten:
                    pencegahanKriminalitasState.update.form
                      .pencegahanKriminalitas.tipsKeamanan.konten,
                  slug: pencegahanKriminalitasState.update.form
                    .pencegahanKriminalitas.tipsKeamanan.slug,
                },
                videoKeamanan: {
                  judul:
                    pencegahanKriminalitasState.update.form
                      .pencegahanKriminalitas.videoKeamanan.judul,
                  deskripsi:
                    pencegahanKriminalitasState.update.form
                      .pencegahanKriminalitas.videoKeamanan.deskripsi,
                  videoUrl:
                    pencegahanKriminalitasState.update.form
                      .pencegahanKriminalitas.videoKeamanan.videoUrl,
                  slug: pencegahanKriminalitasState.update.form
                    .pencegahanKriminalitas.videoKeamanan.slug,
                },
              },
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
          toast.success("Berhasil update pencegahan kriminalitas");
          await pencegahanKriminalitasState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate pencegahan kriminalitas"
          );
        }
      } catch (error) {
        console.error("Gagal update:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate pencegahan kriminalitas"
        );
        return false;
      } finally {
        pencegahanKriminalitasState.update.loading = false;
      }
    },
    reset() {
      pencegahanKriminalitasState.update.id = "";
      pencegahanKriminalitasState.update.form = { ...defaultForm };
    },
  },
});
export default pencegahanKriminalitasState;