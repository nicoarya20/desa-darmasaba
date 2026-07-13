/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1).max(5000),
  juara: z.string().min(1).max(5000),
  deskripsi: z.string().min(1).max(5000),
  imageId: z.string().min(1).max(5000),
});

const defaultForm = {
  name: "",
  juara: "",
  deskripsi: "",
  imageId: "",
};

const penghargaanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(penghargaanState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        penghargaanState.create.loading = true;
        const res = await ApiFetch.api.desa.penghargaan["create"].post(
          penghargaanState.create.form
        );
        if (res.status === 200) {
          penghargaanState.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        penghargaanState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      penghargaanState.findMany.loading = true; // Use the full path to access the property
      penghargaanState.findMany.page = page;
      penghargaanState.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.penghargaan[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          penghargaanState.findMany.data = res.data.data || [];
          penghargaanState.findMany.total = res.data.total || 0;
          penghargaanState.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load penghargaan:", res.data?.message);
          penghargaanState.findMany.data = [];
          penghargaanState.findMany.total = 0;
          penghargaanState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        penghargaanState.findMany.data = [];
        penghargaanState.findMany.total = 0;
        penghargaanState.findMany.totalPages = 1;
      } finally {
        penghargaanState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PenghargaanGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/penghargaan/${id}`);
        if (res.ok) {
          const data = await res.json();
          penghargaanState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          penghargaanState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        penghargaanState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        penghargaanState.delete.loading = true;
        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.penghargaan as any)["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Penghargaan berhasil dihapus");
          await penghargaanState.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal menghapus penghargaan");
        }
      } catch (error) {
        console.log((error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus penghargaan");
      } finally {
        penghargaanState.delete.loading = false;
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
        const response = await fetch(`/api/desa/penghargaan/${id}`, {
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
            juara: data.juara,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(penghargaanState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        penghargaanState.edit.loading = true;
        const response = await fetch(
          `/api/desa/penghargaan/${penghargaanState.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              juara: this.form.juara,
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
          toast.success("Berhasil update penghargaan");
          await penghargaanState.findMany.load();
          return true;
        } else {
          throw new Error(result?.message || "Gagal update penghargaan");
        }
      } catch (error) {
        console.error("Error updating penghargaan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update penghargaan"
        );
        return false;
      } finally {
        penghargaanState.edit.loading = false;
      }
    },
    reset() {
      penghargaanState.edit.id = "";
      penghargaanState.edit.form = { ...defaultForm };
    },
  },
});
export default penghargaanState;