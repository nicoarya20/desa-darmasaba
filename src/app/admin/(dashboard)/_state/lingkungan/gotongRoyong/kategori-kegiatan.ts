/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const kategoriKegiatanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const kategoriKegiatanDefaultForm = {
  nama: "",
};

const kategoriKegiatan = proxy({
  create: {
    form: { ...kategoriKegiatanDefaultForm },
    loading: false,
    async create() {
      const cek = kategoriKegiatanForm.safeParse(kategoriKegiatan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kategoriKegiatan.create.loading = true;
        const res = await ApiFetch.api.lingkungan.kategorikegiatan[
          "create"
        ].post(kategoriKegiatan.create.form);
        if (res.status === 200) {
          kategoriKegiatan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kategoriKegiatan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      nama: string;
    }> | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriKegiatan.findMany.loading = true;
      kategoriKegiatan.findMany.page = page;
      kategoriKegiatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.lingkungan.kategorikegiatan[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kategoriKegiatan.findMany.data = res.data.data ?? [];
          kategoriKegiatan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriKegiatan.findMany.data = [];
          kategoriKegiatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori kegiatan paginated:", err);
        kategoriKegiatan.findMany.data = [];
        kategoriKegiatan.findMany.totalPages = 1;
      } finally {
        kategoriKegiatan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriKegiatanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/lingkungan/kategorikegiatan/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriKegiatan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriKegiatan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriKegiatan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriKegiatan.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body (hindari 400 parse Elysia) & content-type aware saat parse
        // respons (hindari SyntaxError bila body non-JSON).
        const res = await (ApiFetch.api.lingkungan as any).kategorikegiatan[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Kategori kegiatan berhasil dihapus"
          );
          await kategoriKegiatan.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kategori kegiatan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kategori kegiatan");
      } finally {
        kategoriKegiatan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...kategoriKegiatanDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/lingkungan/kategorikegiatan/${id}`,
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
          this.id = data.id;
          this.form = {
            nama: data.nama,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori kegiatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = kategoriKegiatanForm.safeParse(kategoriKegiatan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriKegiatan.edit.loading = true;
        const response = await fetch(
          `/api/lingkungan/kategorikegiatan/${kategoriKegiatan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: kategoriKegiatan.edit.form.nama,
            }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate kategori kegiatan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui kategori kegiatan"
            );
            await kategoriKegiatan.findMany.load();
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate kategori kegiatan"
            );
          }
        } catch (error) {
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating kategori kegiatan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kategori kegiatan"
        );
        return false;
      } finally {
        kategoriKegiatan.edit.loading = false;
      }
    },
    reset() {
      kategoriKegiatan.edit.id = "";
      kategoriKegiatan.edit.form = { ...kategoriKegiatanDefaultForm };
    },
  },
});

export default kategoriKegiatan;
