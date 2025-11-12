/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(5, "Nama minimal 5 karakter"),
  deskripsi: z.string().min(5, "Deskripsi minimal 5 karakter"),
  slug: z.string().min(5, "Deskripsi singkat minimal 5 karakter"),
  icon: z.string().min(1, "Icon minimal 1 karakter"),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  slug: "",
  icon: "",
};

const programKreatifState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(programKreatifState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false; // ⬅️ ini penting
      }
    
      try {
        programKreatifState.create.loading = true;
        const res = await ApiFetch.api.inovasi.programkreatif["create"].post(
          programKreatifState.create.form
        );
    
        if (res.status === 200) {
          programKreatifState.findMany.load();
          toast.success("Sukses menambahkan");
          return true;
        }
    
        toast.error("failed create");
        return false;
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat create");
        return false;
      } finally {
        programKreatifState.create.loading = false;
      }
    }
    
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      programKreatifState.findMany.loading = true; // ✅ Akses langsung via nama path
      programKreatifState.findMany.page = page;
      programKreatifState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.inovasi.programkreatif[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          programKreatifState.findMany.data = res.data.data ?? [];
          programKreatifState.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          programKreatifState.findMany.data = [];
          programKreatifState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch program kreatif paginated:", err);
        programKreatifState.findMany.data = [];
        programKreatifState.findMany.totalPages = 1;
      } finally {
        programKreatifState.findMany.loading = false;
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
        const response = await fetch(`/api/inovasi/programkreatif/${id}`, {
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
            slug: data.slug,
            icon: data.icon,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading program kreatif:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      const cek = templateForm.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/inovasi/programkreatif/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await programKreatifState.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data program kreatif");
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramKreatifGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/inovasi/programkreatif/${id}`);
        if (res.ok) {
          const data = await res.json();
          programKreatifState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          programKreatifState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading program kreatif:", error);
        programKreatifState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        programKreatifState.delete.loading = true;

        const response = await fetch(`/api/inovasi/programkreatif/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Program kreatif berhasil dihapus");
          await programKreatifState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus program kreatif");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus program kreatif");
      } finally {
        programKreatifState.delete.loading = false;
      }
    },
  },
});

export default programKreatifState;
