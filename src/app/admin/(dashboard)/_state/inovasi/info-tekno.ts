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

const infoTeknoState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(infoTeknoState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        infoTeknoState.create.loading = true;
        const res = await ApiFetch.api.inovasi.infotekno["create"].post(
          infoTeknoState.create.form
        );
        if (res.status === 200) {
          infoTeknoState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        infoTeknoState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.InfoTeknoGetPayload<{
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
      infoTeknoState.findMany.loading = true; // ✅ Akses langsung via nama path
      infoTeknoState.findMany.page = page;
      infoTeknoState.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.inovasi.infotekno["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          infoTeknoState.findMany.data = res.data.data ?? [];
          infoTeknoState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          infoTeknoState.findMany.data = [];
          infoTeknoState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch info teknologi paginated:", err);
        infoTeknoState.findMany.data = [];
        infoTeknoState.findMany.totalPages = 1;
      } finally {
        infoTeknoState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.InfoTeknoGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/inovasi/infotekno/${id}`);
        if (res.ok) {
          const data = await res.json();
          infoTeknoState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          infoTeknoState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading desa digital:", error);
        infoTeknoState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        infoTeknoState.delete.loading = true;
        const response = await fetch(`/api/inovasi/infotekno/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (response.ok) {
          toast.success(result.message || "Info Tekno berhasil dihapus");
          await infoTeknoState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus info tekno");
        }
      } catch (error) {
        console.log((error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus info tekno");
      } finally {
        infoTeknoState.delete.loading = false;
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
        const response = await fetch(`/api/inovasi/infotekno/${id}`, {
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
        console.error("Error loading info tekno:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(infoTeknoState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        infoTeknoState.edit.loading = true;
        const response = await fetch(
          `/api/inovasi/infotekno/${infoTeknoState.edit.id}`,
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
          toast.success("Berhasil update info tekno");
          await infoTeknoState.findMany.load();
          return true;
        } else {
          throw new Error(result?.message || "Gagal update info tekno");
        }
      } catch (error) {
        console.error("Error updating info tekno:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update info tekno"
        );
        return false;
      } finally {
        infoTeknoState.edit.loading = false;
      }
    },
    reset() {
      infoTeknoState.edit.id = "";
      infoTeknoState.edit.form = { ...defaultForm };
    },
  },
});
export default infoTeknoState;
