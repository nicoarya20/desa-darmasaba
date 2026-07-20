/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKematian = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  tanggal: z.string().min(4, "Tahun harus diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  penyebab: z.string().min(1, "Penyebab harus diisi"),
});

const defaultKematian = {
  nama: "",
  tanggal: "",
  jenisKelamin: "",
  alamat: "",
  penyebab: "",
};

const kematian = proxy({
  create: {
    form: { ...defaultKematian },
    loading: false,
    async create() {
      const cek = templateKematian.safeParse(kematian.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kematian.create.loading = true;
        const res = await ApiFetch.api.kesehatan.kematian["create"].post(
          kematian.create.form
        );
        if (res.status === 200) {
          kematian.findMany.load();
          return toast.success("Kematian berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan kematian");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        kematian.create.loading = false;
      }
    },
    resetForm() {
      kematian.create.form = { ...defaultKematian };
    },
  },
  findMany: {
    data: null as
      | Prisma.KematianGetPayload<{
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
      kematian.findMany.loading = true;
      kematian.findMany.page = page;
      kematian.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.kematian["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kematian.findMany.data = res.data.data ?? [];
          kematian.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kematian.findMany.data = [];
          kematian.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kematian paginated:", err);
        kematian.findMany.data = [];
        kematian.findMany.totalPages = 1;
      } finally {
        kematian.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KematianGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/kematian/${id}`);
        if (res.ok) {
          const data = await res.json();
          kematian.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch kematian:", res.statusText);
          kematian.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching kematian:", error);
        kematian.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kematian.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body (hindari 400 parse Elysia) & content-type aware saat parse
        // respons (hindari SyntaxError bila body non-JSON).
        const res = await (ApiFetch.api.kesehatan as any).kematian["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Kematian berhasil dihapus");
          await kematian.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kematian");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kematian");
      } finally {
        kematian.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultKematian },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/kesehatan/kematian/${id}`, {
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
            tanggal: data.tanggal,
            jenisKelamin: data.jenisKelamin,
            alamat: data.alamat,
            penyebab: data.penyebab,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading data kematian:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateKematian.safeParse(kematian.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kematian.edit.loading = true;

        const response = await fetch(`/api/kesehatan/kematian/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: this.form.nama,
            tanggal: this.form.tanggal,
            jenisKelamin: this.form.jenisKelamin,
            alamat: this.form.alamat,
            penyebab: this.form.penyebab,
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
          toast.success("Berhasil update data kematian");
          await kematian.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update data kematian");
        }
      } catch (error) {
        console.error("Error updating data kematian:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kematian"
        );
        return false;
      } finally {
        kematian.edit.loading = false;
      }
    },

    reset() {
      kematian.edit.id = "";
      kematian.edit.form = { ...defaultKematian };
    },
  },
});

export default kematian;
