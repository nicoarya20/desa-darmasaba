/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKontakDaruratKeamanan = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  kategoriId: z.array(z.string()).min(1, "Kontak item wajib dipilih"),
});

const defaultKontakDaruratKeamananForm = {
  nama: "",
  icon: "",
  kategoriId: [] as string[],
};

const kontakDaruratKeamananState = proxy({
  create: {
    form: { ...defaultKontakDaruratKeamananForm },
    loading: false,
    async create() {
      const cek = templateKontakDaruratKeamanan.safeParse(
        kontakDaruratKeamananState.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kontakDaruratKeamananState.create.loading = true;
        const res = await ApiFetch.api.keamanan.kontakdaruratkeamanan[
          "create"
        ].post({
          ...kontakDaruratKeamananState.create.form,
        });
        if (res.status === 200) {
          kontakDaruratKeamananState.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kontakDaruratKeamananState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.KontakDaruratKeamananGetPayload<{
        include: {
          kategori: true;
          kontakItems: {
            include: {
              kontakItem: true;
            };
          };
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kontakDaruratKeamananState.findMany.loading = true;
      kontakDaruratKeamananState.findMany.page = page;
      kontakDaruratKeamananState.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.keamanan.kontakdaruratkeamanan[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kontakDaruratKeamananState.findMany.data = res.data.data || [];
          kontakDaruratKeamananState.findMany.total = res.data.total || 0;
          kontakDaruratKeamananState.findMany.totalPages =
            res.data.totalPages || 1;
        } else {
          kontakDaruratKeamananState.findMany.data = [];
          kontakDaruratKeamananState.findMany.total = 0;
          kontakDaruratKeamananState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        kontakDaruratKeamananState.findMany.data = [];
        kontakDaruratKeamananState.findMany.total = 0;
        kontakDaruratKeamananState.findMany.totalPages = 1;
      } finally {
        kontakDaruratKeamananState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KontakDaruratKeamananGetPayload<{
      include: {
        kategori: true;
        kontakItems: {
          include: {
            kontakItem: true;
          };
        };
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/kontakdaruratkeamanan/${id}`);
        if (res.ok) {
          const data = await res.json();
          kontakDaruratKeamananState.findUnique.data = data.data ?? null;
        } else {
          kontakDaruratKeamananState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kontakDaruratKeamananState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kontakDaruratKeamananState.delete.loading = true;

        const response = await fetch(
          `/api/keamanan/kontakdaruratkeamanan/del/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kontak darurat berhasil dihapus");
          await kontakDaruratKeamananState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus kontak darurat");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kontak darurat");
      } finally {
        kontakDaruratKeamananState.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKontakDaruratKeamananForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        kontakDaruratKeamananState.update.loading = true;
        const response = await fetch(
          `/api/keamanan/kontakdaruratkeamanan/${id}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          kontakDaruratKeamananState.update.id = data.id;
          kontakDaruratKeamananState.update.form = {
            nama: data.nama,
            icon: data.icon || "",
            kategoriId: Array.isArray(data.kategoriId)
              ? data.kategoriId
              : data.kontakItems?.map((item: any) => item.kontakItemId) || [],
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        kontakDaruratKeamananState.update.loading = false;
      }
    },

    async update() {
      const cek = templateKontakDaruratKeamanan.safeParse(
        kontakDaruratKeamananState.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        kontakDaruratKeamananState.update.loading = true;
        const response = await fetch(
          `/api/keamanan/kontakdaruratkeamanan/${kontakDaruratKeamananState.update.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama: kontakDaruratKeamananState.update.form.nama,
              icon: kontakDaruratKeamananState.update.form.icon,
              kategoriId: kontakDaruratKeamananState.update.form.kategoriId,
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
          toast.success("Berhasil update kontak darurat");
          await kontakDaruratKeamananState.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update kontak darurat");
        }
      } catch (error) {
        console.error("Error updating kontak darurat:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal update kontak darurat"
        );
        return false;
      } finally {
        kontakDaruratKeamananState.update.loading = false;
      }
    },
    reset() {
      kontakDaruratKeamananState.update.id = "";
      kontakDaruratKeamananState.update.form = {
        ...defaultKontakDaruratKeamananForm,
      };
    },
  },
});

export default kontakDaruratKeamananState;
