/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsiSingkat: z.string().min(3, "Deskripsi singkat minimal 3 karakter"),
  deskripsiLengkap: z.string().min(3, "Deskripsi lengkap minimal 3 karakter"),
  imageId: z.string().nonempty(),
});

const defaultForm = {
  name: "",
  deskripsiSingkat: "",
  deskripsiLengkap: "",
  imageId: "",
};

const infoWabahPenyakit = proxy({
  findMany: {
    data: null as
      | Prisma.InfoWabahPenyakitGetPayload<{
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
      infoWabahPenyakit.findMany.loading = true; // ✅ Akses langsung via nama path
      infoWabahPenyakit.findMany.page = page;
      infoWabahPenyakit.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.kesehatan.infowabahpenyakit["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
         infoWabahPenyakit.findMany.data = res.data.data ?? [];
          infoWabahPenyakit.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          infoWabahPenyakit.findMany.data = [];
          infoWabahPenyakit.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch info wabah penyakit paginated:", err);
        infoWabahPenyakit.findMany.data = [];
        infoWabahPenyakit.findMany.totalPages = 1;
      } finally {
        infoWabahPenyakit.findMany.loading = false;
      }
    },
  },
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(infoWabahPenyakit.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        infoWabahPenyakit.create.loading = true;
        const res = await ApiFetch.api.kesehatan.infowabahpenyakit[
          "create"
        ].post(infoWabahPenyakit.create.form);
        if (res.status === 200) {
          infoWabahPenyakit.findMany.load();
          return toast.success("Info wabah penyakit berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan info wabah penyakit");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        infoWabahPenyakit.create.loading = false;
      }
    },
    resetForm() {
      infoWabahPenyakit.create.form = { ...defaultForm };
    },
  },
  findUnique: {
    data: null as Prisma.InfoWabahPenyakitGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/infowabahpenyakit/${id}`);
        if (res.ok) {
          const data = await res.json();
          infoWabahPenyakit.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch info wabah penyakit:", res.statusText);
          infoWabahPenyakit.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching info wabah penyakit:", error);
        infoWabahPenyakit.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        infoWabahPenyakit.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.kesehatan.infowabahpenyakit as any)[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Info wabah penyakit berhasil dihapus");
          await infoWabahPenyakit.findMany.load(); // refresh list
        } else {
          toast.error(res.data?.message || "Gagal menghapus info wabah penyakit");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus info wabah penyakit");
      } finally {
        infoWabahPenyakit.delete.loading = false;
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
        const response = await fetch(`/api/kesehatan/infowabahpenyakit/${id}`, {
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
            deskripsiLengkap: data.deskripsiLengkap,
            imageId: data.imageId,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching info wabah penyakit:", error);
        toast.error(error instanceof Error ? error.message : "Gagal memuat data");
        return null;
      }
    },

    async update() {
        const cek = templateForm.safeParse(infoWabahPenyakit.edit.form);
        if (!cek.success) {
            const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
            return toast.error(err);
        }

        try {
            infoWabahPenyakit.edit.loading = true;
            const response = await fetch(`/api/kesehatan/infowabahpenyakit/${this.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: this.form.name,
                    deskripsiSingkat: this.form.deskripsiSingkat,
                    deskripsiLengkap: this.form.deskripsiLengkap,
                    imageId: this.form.imageId,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                toast.success(result.message || "Info wabah penyakit berhasil diupdate");
                await infoWabahPenyakit.findMany.load();  
                return true;
            } else {
                throw new Error(result.message || "Gagal update info wabah penyakit");
            }
        } catch (error) {
            console.error("Gagal update:", error);
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate info wabah penyakit");
            return false;
        } finally {
            infoWabahPenyakit.edit.loading = false;
        }
    },
    reset() {
        infoWabahPenyakit.edit.id = "";
        infoWabahPenyakit.edit.form = { ...defaultForm };
    },
  },
});

export default infoWabahPenyakit;
