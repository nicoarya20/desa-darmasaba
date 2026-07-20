/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKontakDaruratItem = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  nomorTelepon: z.string().min(1, "Nomor telepon minimal 1 karakter"),
  icon: z.string().min(1, "Icon wajib dipilih"),
});

const defaultKontakDaruratItemForm = {
  nama: "",
  nomorTelepon: "",
  icon: "",
};

const kontakDaruratItem = proxy({
  create: {
    form: { ...defaultKontakDaruratItemForm },
    loading: false,
    async create() {
      const cek = templateKontakDaruratItem.safeParse(
        kontakDaruratItem.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kontakDaruratItem.create.loading = true;
        const res = await ApiFetch.api.keamanan.kontakitem["create"].post({
          ...kontakDaruratItem.create.form,
        });
        if (res.status === 200) {
          kontakDaruratItem.findMany.load();
          return toast.success("Kontak item berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan kontak item");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan kontak item");
      } finally {
        kontakDaruratItem.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.KontakItemGetPayload<{
        omit: { isActive: true };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kontakDaruratItem.findMany.loading = true;
      kontakDaruratItem.findMany.page = page;
      kontakDaruratItem.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.keamanan.kontakitem["find-many"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kontakDaruratItem.findMany.data = res.data.data || [];
          kontakDaruratItem.findMany.total = res.data.total || 0;
          kontakDaruratItem.findMany.totalPages = res.data.totalPages || 1;
        } else {
          kontakDaruratItem.findMany.data = [];
          kontakDaruratItem.findMany.total = 0;
          kontakDaruratItem.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading kontak item:", error);
        kontakDaruratItem.findMany.data = [];
        kontakDaruratItem.findMany.total = 0;
        kontakDaruratItem.findMany.totalPages = 1;
      } finally {
        kontakDaruratItem.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KontakItemGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/kontakitem/${id}`);
        if (res.ok) {
          const data = await res.json();
          kontakDaruratItem.findUnique.data = data.data ?? null;
        } else {
          kontakDaruratItem.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kontakDaruratItem.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kontakDaruratItem.delete.loading = true;

        const response = await fetch(`/api/keamanan/kontakitem/del/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kontak item berhasil dihapus");
          await kontakDaruratItem.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus kontak item");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kontak item");
      } finally {
        kontakDaruratItem.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKontakDaruratItemForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        kontakDaruratItem.update.loading = true;
        const response = await fetch(`/api/keamanan/kontakitem/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          kontakDaruratItem.update.id = data.id;
          kontakDaruratItem.update.form = {
            nama: data.nama,
            nomorTelepon: data.nomorTelepon,
            icon: data.icon || "",
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kontak item:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        kontakDaruratItem.update.loading = false;
      }
    },

    async update() {
      const cek = templateKontakDaruratItem.safeParse(
        kontakDaruratItem.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        kontakDaruratItem.update.loading = true;
        const response = await fetch(
          `/api/keamanan/kontakitem/${kontakDaruratItem.update.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama: kontakDaruratItem.update.form.nama,
              nomorTelepon: kontakDaruratItem.update.form.nomorTelepon,
              icon: kontakDaruratItem.update.form.icon,
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
          toast.success("Berhasil update kontak item");
          await kontakDaruratItem.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update kontak item");
        }
      } catch (error) {
        console.error("Error updating kontak item:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal update kontak item"
        );
        return false;
      } finally {
        kontakDaruratItem.update.loading = false;
      }
    },
    reset() {
      kontakDaruratItem.update.id = "";
      kontakDaruratItem.update.form = { ...defaultKontakDaruratItemForm };
    },
  },
});

export default kontakDaruratItem;
