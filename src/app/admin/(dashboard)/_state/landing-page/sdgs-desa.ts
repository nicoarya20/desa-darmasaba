/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatesdgsDesaForm = z.object({
  name: z.string().min(1, "Judul minimal 1 karakter"),
  jumlah: z.string().min(1, "Deskripsi minimal 1 karakter"),
  imageId: z.string().min(1, "File minimal 1"),
});

const defaultsdgsDesaForm = {
  name: "",
  jumlah: "",
  imageId: "",
};

const sdgsDesa = proxy({
  create: {
    form: { ...defaultsdgsDesaForm },
    loading: false,
    async create() {
      const cek = templatesdgsDesaForm.safeParse(
        sdgsDesa.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        sdgsDesa.create.loading = true;
        const res = await ApiFetch.api.landingpage.sdgsdesa[
          "create"
        ].post({
          ...sdgsDesa.create.form,
        });

        if (res.status === 200) {
          sdgsDesa.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        sdgsDesa.create.loading = false;
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
    load: async (page = 1, limit = 10, search = "") => {  // Change to arrow function
      sdgsDesa.findMany.loading = true;  // Use the full path to access the property
      sdgsDesa.findMany.page = page;
      sdgsDesa.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        
        const res = await ApiFetch.api.landingpage.sdgsdesa[
          "findMany"
        ].get({
          query,
        });
        
        if (res.status === 200 && res.data?.success) {
          sdgsDesa.findMany.data = res.data.data || [];
          sdgsDesa.findMany.total = res.data.total || 0;
          sdgsDesa.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load media sosial:", res.data?.message);
          sdgsDesa.findMany.data = [];
          sdgsDesa.findMany.total = 0;
          sdgsDesa.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading media sosial:", error);
        sdgsDesa.findMany.data = [];
        sdgsDesa.findMany.total = 0;
        sdgsDesa.findMany.totalPages = 1;
      } finally {
        sdgsDesa.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: null as any[] | null,
    loading: false,
    load: async () => {  // Change to arrow function
      sdgsDesa.findManyAll.loading = true;  // Use the full path to access the property
      try {
        const query: any = {};
        
        const res = await ApiFetch.api.landingpage.sdgsdesa[
          "findManyAll"
        ].get({
          query,
        });
        
        if (res.status === 200 && res.data?.success) {
          sdgsDesa.findManyAll.data = res.data.data || [];
        } else {
          console.error("Failed to load media sosial:", res.data?.message);
          sdgsDesa.findManyAll.data = [];
        }
      } catch (error) {
        console.error("Error loading media sosial:", error);
        sdgsDesa.findManyAll.data = [];
      } finally {
        sdgsDesa.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.SdgsDesaGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/sdgsdesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          sdgsDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          sdgsDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        sdgsDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        sdgsDesa.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/sdgsdesa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "sdgs desa berhasil dihapus");
          await sdgsDesa.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus sdgs desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus sdgs desa");
      } finally {
        sdgsDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultsdgsDesaForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        sdgsDesa.edit.loading = true;

        const response = await fetch(`/api/landingpage/sdgsdesa/${id}`, {
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
            jumlah: data.jumlah,
            imageId: data.imageId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading sdgs desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        sdgsDesa.edit.loading = false;
      }
    },

    async update() {
      const cek = templatesdgsDesaForm.safeParse(
        sdgsDesa.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        sdgsDesa.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/sdgsdesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              jumlah: this.form.jumlah,
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
          toast.success("Berhasil update sdgs desa");
          await sdgsDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate sdgs desa"
          );
        }
      } catch (error) {
        console.error("Error updating sdgs desa:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate sdgs desa"
        );
        return false;
      } finally {
        sdgsDesa.edit.loading = false;
      }
    },
    reset() {
      sdgsDesa.edit.id = "";
      sdgsDesa.edit.form = { ...defaultsdgsDesaForm };
    },
  },
});

export default sdgsDesa;