/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  judul: z.string().min(1, "Judul minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  deskripsiSingkat: z.string().min(1, "Deskripsi singkat minimal 1 karakter"),
  linkVideo: z.string().min(1, "Link video minimal 1 karakter"),
});

const defaultForm = {
  judul: "",
  deskripsi: "",
  deskripsiSingkat: "",
  linkVideo: "",
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
        ].post(pencegahanKriminalitasState.create.form);
        if (res.status === 200) {
          pencegahanKriminalitasState.findMany.load();
          return toast.success("Sukses menambahkan");
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
          omit: { isActive: true };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pencegahanKriminalitasState.findMany.loading = true; // ✅ Akses langsung via nama path
      pencegahanKriminalitasState.findMany.page = page;
      pencegahanKriminalitasState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.keamanan.pencegahankriminalitas[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pencegahanKriminalitasState.findMany.data = res.data.data ?? [];
          pencegahanKriminalitasState.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          pencegahanKriminalitasState.findMany.data = [];
          pencegahanKriminalitasState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch pencegahan kriminalitas paginated:", err);
        pencegahanKriminalitasState.findMany.data = [];
        pencegahanKriminalitasState.findMany.totalPages = 1;
      } finally {
        pencegahanKriminalitasState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PencegahanKriminalitasGetPayload<{
      omit: { isActive: true };
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
  findFirst: {
    data: null as Prisma.PencegahanKriminalitasGetPayload<{
      omit: { isActive: true };
    }> | null,
    loading: false,
    // findFirst.load()
    async load() {
      this.loading = true;
      try {
        const res = await ApiFetch.api.keamanan.pencegahankriminalitas["find-first"].get();

        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data || null;
        } else {
          this.data = null;
        }
      } catch (err) {
        console.error("Gagal fetch pencegahan kriminalitas terbaru:", err);
        this.data = null;
      } finally {
        this.loading = false;
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            deskripsiSingkat: data.deskripsiSingkat,
            linkVideo: data.linkVideo,
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
              judul: pencegahanKriminalitasState.update.form.judul,
              deskripsi: pencegahanKriminalitasState.update.form.deskripsi,
              deskripsiSingkat:
                pencegahanKriminalitasState.update.form.deskripsiSingkat,
              linkVideo: pencegahanKriminalitasState.update.form.linkVideo,
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
