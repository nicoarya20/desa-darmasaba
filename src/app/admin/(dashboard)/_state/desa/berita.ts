import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// 1. Schema validasi dengan Zod
const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  kategoriBeritaId: z.string().nonempty(),
  imageId: z.string().nonempty(),
});

// 2. Default value form berita (hindari uncontrolled input)
const defaultForm = {
  judul: "",
  deskripsi: "",
  imageId: "",
  content: "",
  kategoriBeritaId: "",
};

// 3. Kategori proxy
const category = proxy({
  findMany: {
    data: [] as Prisma.KategoriBeritaGetPayload<{ omit: { isActive: true } }>[],
    async load() {
      const res = await ApiFetch.api.desa.berita.category["find-many"].get();
      if (res.status === 200) {
        category.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

// 4. Berita proxy
const berita = proxy({
  create: {
    form: { ...defaultForm }, // ✅ ini kunci fix-nya
    loading: false,
    async create() {
      const cek = templateForm.safeParse(berita.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        berita.create.loading = true;
        const res = await ApiFetch.api.desa.berita["create"].post(
          berita.create.form
        );
        if (res.status === 200) {
          berita.findMany.load();
          return toast.success("Berita berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan berita");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        berita.create.loading = false;
      }
    },
    resetForm() {
      berita.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as
      | Prisma.BeritaGetPayload<{
          include: {
            image: true;
            kategoriBerita: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
  
    async load(page = 1, limit = 10) {
      berita.findMany.loading = true;
      berita.findMany.page = page;
      try {
        const res = await ApiFetch.api.desa.berita["find-many"].get({
          query: {
            page,
            limit,
          },
        });
  
        if (res.status === 200 && res.data?.success) {
          berita.findMany.data = res.data.data ?? [];
          berita.findMany.totalPages = res.data.totalPages ?? 1;
        }
      } catch (err) {
        console.error("Gagal fetch berita paginated:", err);
      } finally {
        berita.findMany.loading = false;
      }
    },
  },
  
  findUnique: {
    data: null as
      | Prisma.BeritaGetPayload<{
          include: {
            image: true;
            kategoriBerita: true;
          };
        }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/berita/${id}`);
        if (res.ok) {
          const data = await res.json();
          berita.findUnique.data = data.data ?? null;
        } else {
          console.error('Failed to fetch berita:', res.statusText);
          berita.findUnique.data = null;
        }
      } catch (error) {
        console.error('Error fetching berita:', error);
        berita.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        berita.delete.loading = true;

        const response = await fetch(`/api/desa/berita/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        
        if (response.ok && result?.success) {
          toast.success(result.message || "Berita berhasil dihapus");
          await berita.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus berita");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus berita");
      } finally {
        berita.delete.loading = false;
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
        const response = await fetch(`/api/desa/berita/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            content: data.content,
            kategoriBeritaId: data.kategoriBeritaId || "",
            imageId: data.imageId || "",
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error(error instanceof Error ? error.message : "Gagal memuat data");
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(berita.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
    
      try {
        berita.edit.loading = true;
        
        const response = await fetch(`/api/desa/berita/${this.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            judul: this.form.judul,
            deskripsi: this.form.deskripsi,
            content: this.form.content,
            kategoriBeritaId: this.form.kategoriBeritaId || null,
            imageId: this.form.imageId,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
    
        if (result.success) {
          toast.success("Berhasil update berita");
          await berita.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update berita");
        }
      } catch (error) {
        console.error("Error updating berita:", error);
        toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat update berita");
        return false;
      } finally {
        berita.edit.loading = false;
      }
    },

    reset() {
      berita.edit.id = "";
      berita.edit.form = { ...defaultForm };
    },
  },
  
});

// 5. State global
const stateDashboardBerita = proxy({
  category,
  berita,
});

export default stateDashboardBerita;
