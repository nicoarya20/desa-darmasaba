/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
  whatsapp: z.string().min(10, "Whatsapp minimal 10 karakter"),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  imageId: "",
  whatsapp: "",
};

const kontakDarurat = proxy({
  findMany: {
    data: null as
      | Prisma.KontakDaruratGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kontakDarurat.findMany.loading = true; // ✅ Akses langsung via nama path
      kontakDarurat.findMany.page = page;
      kontakDarurat.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.kontakdarurat[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kontakDarurat.findMany.data = res.data.data ?? [];
          kontakDarurat.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kontakDarurat.findMany.data = [];
          kontakDarurat.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kontak darurat paginated:", err);
        kontakDarurat.findMany.data = [];
        kontakDarurat.findMany.totalPages = 1;
      } finally {
        kontakDarurat.findMany.loading = false;
      }
    },
  },
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(kontakDarurat.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kontakDarurat.create.loading = true;
        const res = await ApiFetch.api.kesehatan.kontakdarurat["create"].post(
          kontakDarurat.create.form
        );
        if (res.status === 200) {
          kontakDarurat.findMany.load();
          return toast.success("Kontak Darurat berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan kontak darurat");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        kontakDarurat.create.loading = false;
      }
    },
    resetForm() {
      kontakDarurat.create.form = { ...defaultForm };
    },
  },
  findUnique: {
    data: null as Prisma.KontakDaruratGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/kontakdarurat/${id}`);
        if (res.ok) {
          const data = await res.json();
          kontakDarurat.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kontakDarurat.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kontakDarurat.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      try {
        kontakDarurat.delete.loading = true;
        const response = await fetch(`/api/kesehatan/kontakdarurat/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kontak darurat berhasil dihapus");
          await kontakDarurat.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kontak darurat");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kontak darurat");
      } finally {
        kontakDarurat.delete.loading = false;
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
        const response = await fetch(`/api/kesehatan/kontakdarurat/${id}`, {
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
            name: data.name,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
            whatsapp: data.whatsapp,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching kontak darurat:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(kontakDarurat.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kontakDarurat.edit.loading = true;
        const response = await fetch(
          `/api/kesehatan/kontakdarurat/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
              whatsapp: this.form.whatsapp,
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
          toast.success(result.message || "Kontak darurat berhasil diupdate");
          await kontakDarurat.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update kontak darurat");
        }
      } catch (error) {
        console.error("Gagal update:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengupdate kontak darurat"
        );
        return false;
      } finally {
        kontakDarurat.edit.loading = false;
      }
    },
    reset() {
      kontakDarurat.edit.id = "";
      kontakDarurat.edit.form = { ...defaultForm };
    },
  },
});

export default kontakDarurat;
