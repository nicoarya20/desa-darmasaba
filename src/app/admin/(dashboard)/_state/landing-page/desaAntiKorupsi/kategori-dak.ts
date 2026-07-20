/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKategoriDAK = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriDAK = {
  name: "",
};

const kategoriDesaAntiKorupsi = proxy({
  create: {
    form: { ...defaultKategoriDAK },
    loading: false,
    async create() {
      const cek = templateKategoriDAK.safeParse(
        kategoriDesaAntiKorupsi.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriDesaAntiKorupsi.create.loading = true;
        const res = await ApiFetch.api.landingpage.kategoridak["create"].post(
          kategoriDesaAntiKorupsi.create.form
        );
        if (res.status === 200) {
          kategoriDesaAntiKorupsi.findMany.load();
          return toast.success("Kategori DAK Berhasil Dibuat");
        }
        return toast.error(
          getServerMessage(res) || "Gagal menambahkan kategori DAK"
        );
      } catch (error) {
        console.log(error);
        return toast.error("Gagal menambahkan kategori DAK");
      } finally {
        kategoriDesaAntiKorupsi.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriDesaAntiKorupsiGetPayload<{
      omit: { isActive: true };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriDesaAntiKorupsi.findMany.loading = true;
      kategoriDesaAntiKorupsi.findMany.page = page;
      kategoriDesaAntiKorupsi.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.kategoridak["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kategoriDesaAntiKorupsi.findMany.data = res.data.data ?? [];
          kategoriDesaAntiKorupsi.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          kategoriDesaAntiKorupsi.findMany.data = [];
          kategoriDesaAntiKorupsi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori DAK:", err);
        kategoriDesaAntiKorupsi.findMany.data = [];
        kategoriDesaAntiKorupsi.findMany.totalPages = 1;
      } finally {
        kategoriDesaAntiKorupsi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriDesaAntiKorupsiGetPayload<{
      omit: { isActive: true };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/kategoridak/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriDesaAntiKorupsi.findUnique.data = data.data ?? null;
        } else {
          kategoriDesaAntiKorupsi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriDesaAntiKorupsi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriDesaAntiKorupsi.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.landingpage as any).kategoridak["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Kategori DAK berhasil dihapus");
          await kategoriDesaAntiKorupsi.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kategori DAK");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kategori DAK");
      } finally {
        kategoriDesaAntiKorupsi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultKategoriDAK },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/landingpage/kategoridak/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          kategoriDesaAntiKorupsi.edit.id = data.id;
          kategoriDesaAntiKorupsi.edit.form = { name: data.name };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori DAK:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateKategoriDAK.safeParse(
        kategoriDesaAntiKorupsi.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        kategoriDesaAntiKorupsi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/kategoridak/${kategoriDesaAntiKorupsi.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: kategoriDesaAntiKorupsi.edit.form.name }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();
          if (!response.ok) {
            throw new Error(
              result?.message ||
                `Gagal mengupdate kategori DAK (${response.status})`
            );
          }
          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui kategori DAK"
            );
            await kategoriDesaAntiKorupsi.findMany.load();
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate kategori DAK");
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
        console.error("Error updating kategori DAK:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate kategori DAK"
        );
        return false;
      } finally {
        kategoriDesaAntiKorupsi.edit.loading = false;
      }
    },
    reset() {
      kategoriDesaAntiKorupsi.edit.id = "";
      kategoriDesaAntiKorupsi.edit.form = { ...defaultKategoriDAK };
    },
  },
});

export default kategoriDesaAntiKorupsi;
