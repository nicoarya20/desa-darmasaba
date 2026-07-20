/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKategoriPrestasi = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriPrestasi = {
  name: "",
};

const kategoriPrestasi = proxy({
  create: {
    form: { ...defaultKategoriPrestasi },
    loading: false,
    async create() {
      const cek = templateKategoriPrestasi.safeParse(
        kategoriPrestasi.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriPrestasi.create.loading = true;
        const res = await ApiFetch.api.landingpage.kategoriprestasi[
          "create"
        ].post(kategoriPrestasi.create.form);
        if (res.status === 200) {
          kategoriPrestasi.findMany.load();
          return toast.success("Kategori Prestasi Berhasil Dibuat");
        }
        return toast.error(
          getServerMessage(res) || "Gagal menambahkan kategori prestasi"
        );
      } catch (error) {
        console.log(error);
        return toast.error("Gagal menambahkan kategori prestasi");
      } finally {
        kategoriPrestasi.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriPrestasiDesaGetPayload<{
      omit: { isActive: true };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriPrestasi.findMany.loading = true;
      kategoriPrestasi.findMany.page = page;
      kategoriPrestasi.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.kategoriprestasi[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kategoriPrestasi.findMany.data = res.data.data ?? [];
          kategoriPrestasi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriPrestasi.findMany.data = [];
          kategoriPrestasi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori prestasi:", err);
        kategoriPrestasi.findMany.data = [];
        kategoriPrestasi.findMany.totalPages = 1;
      } finally {
        kategoriPrestasi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriPrestasiDesaGetPayload<{
      omit: { isActive: true };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/kategoriprestasi/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriPrestasi.findUnique.data = data.data ?? null;
        } else {
          kategoriPrestasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriPrestasi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriPrestasi.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.landingpage as any).kategoriprestasi[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Kategori prestasi berhasil dihapus"
          );
          await kategoriPrestasi.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kategori prestasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kategori prestasi");
      } finally {
        kategoriPrestasi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultKategoriPrestasi },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/landingpage/kategoriprestasi/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          kategoriPrestasi.edit.id = data.id;
          kategoriPrestasi.edit.form = { name: data.name };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori prestasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateKategoriPrestasi.safeParse(
        kategoriPrestasi.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        kategoriPrestasi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/kategoriprestasi/${kategoriPrestasi.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: kategoriPrestasi.edit.form.name }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();
          if (!response.ok) {
            throw new Error(
              result?.message ||
                `Gagal mengupdate kategori prestasi (${response.status})`
            );
          }
          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui kategori prestasi"
            );
            await kategoriPrestasi.findMany.load();
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate kategori prestasi"
            );
          }
        } catch (error) {
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating kategori prestasi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kategori prestasi"
        );
        return false;
      } finally {
        kategoriPrestasi.edit.loading = false;
      }
    },
    reset() {
      kategoriPrestasi.edit.id = "";
      kategoriPrestasi.edit.form = { ...defaultKategoriPrestasi };
    },
  },
});

export default kategoriPrestasi;
