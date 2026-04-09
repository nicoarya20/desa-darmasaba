/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsiSingkat: z.string().min(3, "Deskripsi singkat minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
});

const defaultForm = {
  name: "",
  deskripsiSingkat: "",
  deskripsi: "",
  imageId: "",
};

const programKesehatan = proxy({
  findMany: {
    data: null as
      | Prisma.ProgramKesehatanGetPayload<{
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
      programKesehatan.findMany.loading = true; // ✅ Akses langsung via nama path
      programKesehatan.findMany.page = page;
      programKesehatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.programkesehatan[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          programKesehatan.findMany.data = res.data.data ?? [];
          programKesehatan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          programKesehatan.findMany.data = [];
          programKesehatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch berita paginated:", err);
        programKesehatan.findMany.data = [];
        programKesehatan.findMany.totalPages = 1;
      } finally {
        programKesehatan.findMany.loading = false;
      }
    },
  },
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(programKesehatan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        programKesehatan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.programkesehatan[
          "create"
        ].post(programKesehatan.create.form);
        if (res.status === 200) {
          programKesehatan.findMany.load();
          return toast.success("Program Kesehatan berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan program kesehatan");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        programKesehatan.create.loading = false;
      }
    },
    resetForm() {
      programKesehatan.create.form = { ...defaultForm };
    },
  },
  findUnique: {
    data: null as Prisma.ProgramKesehatanGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/programkesehatan/${id}`);
        if (res.ok) {
          const data = await res.json();
          programKesehatan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch program kesehatan:", res.statusText);
          programKesehatan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching program kesehatan:", error);
        programKesehatan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        programKesehatan.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/programkesehatan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (response.ok && result?.success) {
          toast.success(result.message || "Program kesehatan berhasil dihapus");
          await programKesehatan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus program kesehatan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus program kesehatan");
      } finally {
        programKesehatan.delete.loading = false;
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
        const response = await fetch(`/api/kesehatan/programkesehatan/${id}`, {
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
            deskripsiSingkat: data.deskripsiSingkat,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching program kesehatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(programKesehatan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        programKesehatan.edit.loading = true;
        const response = await fetch(
          `/api/kesehatan/programkesehatan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsiSingkat: this.form.deskripsiSingkat,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
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
          toast.success(
            result.message || "Program kesehatan berhasil diupdate"
          );
          await programKesehatan.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update program kesehatan");
        }
      } catch (error) {
        console.error("Gagal update:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengupdate program kesehatan"
        );
        return false;
      } finally {
        programKesehatan.edit.loading = false;
      }
    },
    reset() {
      programKesehatan.edit.id = "";
      programKesehatan.edit.form = { ...defaultForm };
    },
  },
});

export default programKesehatan;
