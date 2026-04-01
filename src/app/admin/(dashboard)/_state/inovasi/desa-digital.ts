/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1).max(50),
  deskripsi: z.string().min(1).max(5000),
  imageId: z.string().min(1).max(50),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  imageId: "",
};

const desaDigitalState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(desaDigitalState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        desaDigitalState.create.loading = true;
        const res = await ApiFetch.api.inovasi.desadigital["create"].post(
          desaDigitalState.create.form
        );
        if (res.status === 200) {
          desaDigitalState.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        desaDigitalState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DesaDigitalGetPayload<{
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
      desaDigitalState.findMany.loading = true; // ✅ Akses langsung via nama path
      desaDigitalState.findMany.page = page;
      desaDigitalState.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.inovasi.desadigital["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          desaDigitalState.findMany.data = res.data.data ?? [];
          desaDigitalState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          desaDigitalState.findMany.data = [];
          desaDigitalState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch desa digital paginated:", err);
        desaDigitalState.findMany.data = [];
        desaDigitalState.findMany.totalPages = 1;
      } finally {
        desaDigitalState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DesaDigitalGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/inovasi/desadigital/${id}`);
        if (res.ok) {
          const data = await res.json();
          desaDigitalState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          desaDigitalState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading desa digital:", error);
        desaDigitalState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        desaDigitalState.delete.loading = true;
        const response = await fetch(`/api/inovasi/desadigital/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (response.ok) {
          toast.success(result.message || "Desa Digital berhasil dihapus");
          await desaDigitalState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus desa digital");
        }
      } catch (error) {
        console.log((error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus desa digital");
      } finally {
        desaDigitalState.delete.loading = false;
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
        const response = await fetch(`/api/inovasi/desadigital/${id}`, {
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading desa digital:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(desaDigitalState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        desaDigitalState.edit.loading = true;
        const response = await fetch(
          `/api/inovasi/desadigital/${desaDigitalState.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
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
          toast.success("Berhasil update desa digital");
          await desaDigitalState.findMany.load();
          return true;
        } else {
          throw new Error(result?.message || "Gagal update desa digital");
        }
      } catch (error) {
        console.error("Error updating desa digital:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update desa digital"
        );
        return false;
      } finally {
        desaDigitalState.edit.loading = false;
      }
    },
    reset() {
      desaDigitalState.edit.id = "";
      desaDigitalState.edit.form = { ...defaultForm };
    },
  },
});
export default desaDigitalState;
