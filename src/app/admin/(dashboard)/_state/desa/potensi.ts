/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1).max(5000),
  deskripsi: z.string().min(1).max(5000),
  kategoriId: z.string().min(1).max(50),
  imageId: z.string().min(1).max(50),
  content: z.string().min(1).max(5000),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  kategoriId: "",
  imageId: "",
  content: "",
};

const potensiDesa = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(potensiDesa.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        potensiDesa.create.loading = true;
        const res = await ApiFetch.api.desa.potensi["create"].post(
          potensiDesa.create.form
        );
        if (res.status === 200) {
          potensiDesa.findMany.load();
          return toast.success("Potensi berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan potensi");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        potensiDesa.create.loading = false;
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
      potensiDesa.findMany.loading = true;  // Use the full path to access the property
      potensiDesa.findMany.page = page;
      potensiDesa.findMany.search = search;
      try {
        const res = await ApiFetch.api.desa.potensi[
          "find-many"
        ].get({
          query: { page, limit, search },
        });
  
        if (res.status === 200 && res.data?.success) {
          potensiDesa.findMany.data = res.data.data || [];
          potensiDesa.findMany.total = res.data.total || 0;
          potensiDesa.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load potensi desa:", res.data?.message);
          potensiDesa.findMany.data = [];
          potensiDesa.findMany.total = 0;
          potensiDesa.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading potensi desa:", error);
        potensiDesa.findMany.data = [];
        potensiDesa.findMany.total = 0;
        potensiDesa.findMany.totalPages = 1;
      } finally {
        potensiDesa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PotensiDesaGetPayload<{
      include: {
        image: true;
        kategori: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/potensi/${id}`);
        if (res.ok) {
          const data = await res.json();
          potensiDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch potensi:", res.statusText);
          potensiDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching potensi:", error);
        potensiDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        potensiDesa.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.potensi as any)["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Potensi berhasil dihapus");
          await potensiDesa.findMany.load(); // refresh list
        } else {
          toast.error(res.data?.message || "Gagal menghapus potensi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus potensi");
      } finally {
        potensiDesa.delete.loading = false;
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
        const response = await fetch(`/api/desa/potensi/${id}`, {
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
            kategoriId: data.kategoriId,
            imageId: data.imageId || "",
            content: data.content,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading potensi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(potensiDesa.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        potensiDesa.edit.loading = true;

        const response = await fetch(`/api/desa/potensi/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            deskripsi: this.form.deskripsi,
            kategoriId: this.form.kategoriId,
            imageId: this.form.imageId,
            content: this.form.content,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update potensi");
          await potensiDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update potensi");
        }
      } catch (error) {
        console.error("Error updating potensi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update potensi"
        );
        return false;
      } finally {
        potensiDesa.edit.loading = false;
      }
    },
    reset() {
      potensiDesa.edit.id = "";
      potensiDesa.edit.form = { ...defaultForm };
    },
  },
});

const templateKategoriPotensi = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriPotensi = {
  nama: "",
};

const kategoriPotensi = proxy({
  create: {
    form: { ...defaultKategoriPotensi },
    loading: false,
    async create() {
      const cek = templateKategoriPotensi.safeParse(
        kategoriPotensi.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriPotensi.create.loading = true;
        const res = await ApiFetch.api.desa.kategoripotensi["create"].post(
          kategoriPotensi.create.form
        );
        if (res.status === 200) {
          kategoriPotensi.findMany.load();
          return toast.success("Data Kategori Potensi Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        kategoriPotensi.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriPotensiGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      kategoriPotensi.findMany.loading = true; // ✅ Akses langsung via nama path
      kategoriPotensi.findMany.page = page;
      kategoriPotensi.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.desa.kategoripotensi["findMany"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          kategoriPotensi.findMany.data = res.data.data ?? [];
          kategoriPotensi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriPotensi.findMany.data = [];
          kategoriPotensi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori potensi paginated:", err);
        kategoriPotensi.findMany.data = [];
        kategoriPotensi.findMany.totalPages = 1;
      } finally {
        kategoriPotensi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriPotensiGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/kategoripotensi/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriPotensi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriPotensi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriPotensi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriPotensi.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (ApiFetch.api.desa.kategoripotensi as any)["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Data Kategori Potensi berhasil dihapus"
          );
          await kategoriPotensi.findMany.load(); // refresh list
        } else {
          toast.error(
            res.data?.message || "Gagal menghapus Data Kategori Potensi"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Kategori Potensi");
      } finally {
        kategoriPotensi.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriPotensi },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/kategoripotensi/${id}`, {
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
            nama: data.nama,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori potensi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriPotensi.safeParse(
        kategoriPotensi.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriPotensi.update.loading = true;

        const response = await fetch(`/api/desa/kategoripotensi/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: this.form.nama,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update data kategori potensi");
          await kategoriPotensi.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data kategori potensi"
          );
        }
      } catch (error) {
        console.error("Error updating data kategori potensi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori potensi"
        );
        return false;
      } finally {
        kategoriPotensi.update.loading = false;
      }
    },
    reset() {
      kategoriPotensi.update.id = "";
      kategoriPotensi.update.form = { ...defaultKategoriPotensi };
    },
  },
});

const potensiDesaState = proxy({
  potensiDesa,
  kategoriPotensi,
});

export default potensiDesaState;
