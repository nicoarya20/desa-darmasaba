/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePasarDesaForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  harga: z.number().min(1, "Harga minimal 1"),
  alamatUsaha: z.string().min(1, "Alamat minimal 1 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  rating: z.number().min(1, "Rating minimal 1"),
  kategoriId: z.array(z.string()).min(1, "Minimal pilih satu kategori"),
});

const defaultPasarDesaForm = {
  nama: "",
  harga: 0,
  alamatUsaha: "",
  imageId: "",
  rating: 0,
  kategoriId: [] as string[],
};

const pasarDesa = proxy({
  create: {
    form: { ...defaultPasarDesaForm },
    loading: false,
    async create() {
      const cek = templatePasarDesaForm.safeParse(pasarDesa.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pasarDesa.create.loading = true;
        const res = await ApiFetch.api.ekonomi.pasardesa["create"].post(
          pasarDesa.create.form
        );
        if (res.status === 200) {
          pasarDesa.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        pasarDesa.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PasarDesaGetPayload<{
          include: {
            image: true;
            KategoriToPasar: {
              include: {
                kategori: true;
              };
            };
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "", categoryId?: string) => {
      pasarDesa.findMany.loading = true;
      pasarDesa.findMany.page = page;
      pasarDesa.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (categoryId) query.categoryId = categoryId;
    
        const res = await ApiFetch.api.ekonomi.pasardesa["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          pasarDesa.findMany.data = res.data.data ?? [];
          pasarDesa.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          pasarDesa.findMany.data = [];
          pasarDesa.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch keamanan lingkungan paginated:", err);
        pasarDesa.findMany.data = [];
        pasarDesa.findMany.totalPages = 1;
      } finally {
        pasarDesa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PasarDesaGetPayload<{
      include: {
        image: true;
        KategoriToPasar: {
          include: {
            kategori: true;
          };
        };
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/pasardesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          pasarDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pasarDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        pasarDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pasarDesa.delete.loading = true;

        const response = await fetch(`/api/ekonomi/pasardesa/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pasar desa berhasil dihapus");
          await pasarDesa.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pasar desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pasar desa");
      } finally {
        pasarDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultPasarDesaForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/ekonomi/pasardesa/${id}`, {
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
            harga: data.harga,
            alamatUsaha: data.alamatUsaha,
            imageId: data.imageId,
            rating: data.rating,
            kategoriId: data.kategoriId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading pasar desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templatePasarDesaForm.safeParse(pasarDesa.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pasarDesa.edit.loading = true;
        const response = await fetch(`/api/ekonomi/pasardesa/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: this.form.nama,
            harga: this.form.harga,
            alamatUsaha: this.form.alamatUsaha,
            imageId: this.form.imageId,
            rating: this.form.rating,
            kategoriId: this.form.kategoriId,
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
          toast.success("Berhasil update pasar desa");
          await pasarDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate pasar desa");
        }
      } catch (error) {
        console.error("Error updating pasar desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pasar desa"
        );
        return false;
      } finally {
        pasarDesa.edit.loading = false;
      }
    },
    reset() {
      pasarDesa.edit.id = "";
      pasarDesa.edit.form = { ...defaultPasarDesaForm };
    },
  },
});

// ========================================= KATEGORI PRODUK ========================================= //
const kategoriProdukForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const kategoriProdukDefaultForm = {
  nama: "",
};

const kategoriProduk = proxy({
  create: {
    form: { ...kategoriProdukDefaultForm },
    loading: false,
    async create() {
      const cek = kategoriProdukForm.safeParse(kategoriProduk.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kategoriProduk.create.loading = true;
        const res = await ApiFetch.api.ekonomi.kategoriproduk["create"].post(
          kategoriProduk.create.form
        );
        if (res.status === 200) {
          kategoriProduk.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kategoriProduk.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.KategoriProdukGetPayload<{
          omit: {
            isActive: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search2: "",
   load: async (page = 1, limit = 10, search2 = "") => {
      kategoriProduk.findMany.loading = true; // ✅ Akses langsung via nama path
      kategoriProduk.findMany.page = page;
      kategoriProduk.findMany.search2 = search2;
  
      try {
        const query: any = { page, limit };
        if (search2) query.search2 = search2;
    
        const res = await ApiFetch.api.ekonomi.kategoriproduk["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          kategoriProduk.findMany.data = res.data.data ?? [];
          kategoriProduk.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriProduk.findMany.data = [];
          kategoriProduk.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kategori produk paginated:", err);
        kategoriProduk.findMany.data = [];
        kategoriProduk.findMany.totalPages = 1;
      } finally {
        kategoriProduk.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriProdukGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/kategoriproduk/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriProduk.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriProduk.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriProduk.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriProduk.delete.loading = true;

        const response = await fetch(`/api/ekonomi/kategoriproduk/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kategori produk berhasil dihapus");
          await kategoriProduk.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kategori produk");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kategori produk");
      } finally {
        kategoriProduk.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...kategoriProdukDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/ekonomi/kategoriproduk/${id}`, {
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
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori produk:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = kategoriProdukForm.safeParse(kategoriProduk.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriProduk.edit.loading = true;
        const response = await fetch(
          `/api/ekonomi/kategoriproduk/${kategoriProduk.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: kategoriProduk.edit.form.nama,
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
                `Gagal mengupdate kategori produk (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui kategori produk"
            );
            await kategoriProduk.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate kategori produk"
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
        console.error("Error updating kategori produk:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kategori produk"
        );
        return false;
      } finally {
        kategoriProduk.edit.loading = false;
      }
    },
    reset() {
      kategoriProduk.edit.id = "";
      kategoriProduk.edit.form = { ...kategoriProdukDefaultForm };
    },
  },
});

const pasarDesaState = proxy({
  pasarDesa,
  kategoriProduk,
});
export default pasarDesaState;
