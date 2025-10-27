/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateprestasiDesaForm = z.object({
  name: z.string().min(1, "Judul minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  imageId: z.string().min(1, "File minimal 1"),
  kategoriId: z.string().min(1, "Kategori minimal 1 karakter"),
});

const defaultprestasiDesaForm = {
  name: "",
  deskripsi: "",
  imageId: "",
  kategoriId: "",
};

const prestasiDesa = proxy({
  create: {
    form: { ...defaultprestasiDesaForm },
    loading: false,
    async create() {
      const cek = templateprestasiDesaForm.safeParse(
        prestasiDesa.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        prestasiDesa.create.loading = true;
        const res = await ApiFetch.api.landingpage.prestasidesa[
          "create"
        ].post({
          ...prestasiDesa.create.form,
        });

        if (res.status === 200) {
          prestasiDesa.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        prestasiDesa.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.PrestasiDesaGetPayload<{
        include: {
          image: true;
          kategori: {
            select: {
              id: true;
              name: true;
            };
          };
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      prestasiDesa.findMany.loading = true; // ✅ Akses langsung via nama path
      prestasiDesa.findMany.page = page;
      prestasiDesa.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.landingpage.prestasidesa["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          prestasiDesa.findMany.data = res.data.data ?? [];
          prestasiDesa.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          prestasiDesa.findMany.data = [];
          prestasiDesa.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch prestasi desa paginated:", err);
        prestasiDesa.findMany.data = [];
        prestasiDesa.findMany.totalPages = 1;
      } finally {
        prestasiDesa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PrestasiDesaGetPayload<{
      include: {
        image: true;
        kategori: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/prestasidesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          prestasiDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          prestasiDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        prestasiDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        prestasiDesa.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/prestasidesa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "prestasi desa berhasil dihapus");
          await prestasiDesa.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus prestasi desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus prestasi desa");
      } finally {
        prestasiDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultprestasiDesaForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        prestasiDesa.edit.loading = true;

        const response = await fetch(`/api/landingpage/prestasidesa/${id}`, {
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
            kategoriId: data.kategoriId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading prestasi desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        prestasiDesa.edit.loading = false;
      }
    },

    async update() {
      const cek = templateprestasiDesaForm.safeParse(
        prestasiDesa.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        prestasiDesa.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/prestasidesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
              kategoriId: this.form.kategoriId,
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
          toast.success("Berhasil update prestasi desa");
          await prestasiDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate prestasi desa"
          );
        }
      } catch (error) {
        console.error("Error updating prestasi desa:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate prestasi desa"
        );
        return false;
      } finally {
        prestasiDesa.edit.loading = false;
      }
    },
    reset() {
      prestasiDesa.edit.id = "";
      prestasiDesa.edit.form = { ...defaultprestasiDesaForm };
    },
  },
});

// ========================================= KATEGORI kegiatan ========================================= //
const kategoriPrestasiForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
});

const kategoriPrestasiDefaultForm = {
  name: "",
};

const kategoriPrestasi = proxy({
  create: {
    form: { ...kategoriPrestasiDefaultForm },
    loading: false,
    async create() {
      const cek = kategoriPrestasiForm.safeParse(kategoriPrestasi.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kategoriPrestasi.create.loading = true;
        const res = await ApiFetch.api.landingpage.kategoriprestasi[
          "create"
        ].post(kategoriPrestasi.create.form);
        if (res.status === 200) {
          kategoriPrestasi.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kategoriPrestasi.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      name: string;
    }> | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      kategoriPrestasi.findMany.loading = true; // ✅ Akses langsung via nama path
      kategoriPrestasi.findMany.page = page;
      kategoriPrestasi.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.landingpage.kategoriprestasi["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          kategoriPrestasi.findMany.data = res.data.data ?? [];
          kategoriPrestasi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriPrestasi.findMany.data = [];
          kategoriPrestasi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori prestasi paginated:", err);
        kategoriPrestasi.findMany.data = [];
        kategoriPrestasi.findMany.totalPages = 1;
      } finally {
        kategoriPrestasi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriPrestasiDesaGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/landingpage/kategoriprestasi/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          kategoriPrestasi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriPrestasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriPrestasi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriPrestasi.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/kategoriprestasi/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kategori prestasi berhasil dihapus");
          await kategoriPrestasi.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kategori prestasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kategori prestasi");
      } finally {
        kategoriPrestasi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...kategoriPrestasiDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/landingpage/kategoriprestasi/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori prestasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = kategoriPrestasiForm.safeParse(kategoriPrestasi.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriPrestasi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/kategoriprestasi/${kategoriPrestasi.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: kategoriPrestasi.edit.form.name,
            }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate kategori prestasi (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui kategori prestasi"
            );
            await kategoriPrestasi.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate kategori prestasi"
            );
          }
        } catch (error) {
          // If JSON parsing fails, try to get the response text for better error messages
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating kategori prestasi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kategori prestasi"
        );
        return false;
      } finally {
        kategoriPrestasi.edit.loading = false;
      }
    },
    reset() {
      kategoriPrestasi.edit.id = "";
      kategoriPrestasi.edit.form = { ...kategoriPrestasiDefaultForm };
    },
  },
});

const prestasiState = proxy({
  prestasiDesa,
  kategoriPrestasi,
});

export default prestasiState;