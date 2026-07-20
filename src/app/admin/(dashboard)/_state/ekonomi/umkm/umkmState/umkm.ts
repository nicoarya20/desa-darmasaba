import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const umkmFormSchema = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  pemilik: z.string().min(1, "Nama pemilik wajib diisi"),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
  deskripsi: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  kontak: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
});

const defaultUmkmForm = {
  nama: "",
  pemilik: "",
  kategoriId: "",
  deskripsi: "",
  alamat: "",
  kontak: "",
  imageId: null as string | null,
  isActive: true,
};

const umkm = proxy({
  findMany: {
    data: [] as any[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    async load(page = 1, limit = 10, search = "", kategoriId = "") {
      this.loading = true;
      this.page = page;
      this.search = search;
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          kategoriId,
        });
        const res = await fetch(`/api/ekonomi/umkm/find-many?${params}`);
        const result = await res.json();
        if (result.success) {
          this.data = result.data;
          this.totalPages = result.totalPages;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
  create: {
    form: { ...defaultUmkmForm },
    loading: false,
    async submit() {
      const cek = umkmFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Cek kembali form anda");
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch("/api/ekonomi/umkm/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("UMKM berhasil dibuat");
          umkm.findMany.load();
          return true;
        }
        toast.error(result.message);
      } catch (e) {
        toast.error("Gagal membuat UMKM");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
  update: {
    form: { ...defaultUmkmForm },
    loading: false,
    async submit(id: string) {
      const cek = umkmFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Cek kembali form anda");
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch(`/api/ekonomi/umkm/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("UMKM berhasil diperbarui");
          umkm.findMany.load();
          return true;
        }
        toast.error(result.message);
      } catch (e) {
        toast.error("Gagal memperbarui UMKM");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
  del: {
    loading: false,
    async submit(id: string) {
      this.loading = true;
      try {
        const res = await fetch(`/api/ekonomi/umkm/del/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("UMKM berhasil dihapus");
          umkm.findMany.load();
          return true;
        }
        toast.error(result.message);
      } catch (e) {
        toast.error("Gagal menghapus UMKM");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
  findUnique: {
    data: null as any,
    loading: false,
    async load(id: string) {
      this.loading = true;
      try {
        const res = await fetch(`/api/ekonomi/umkm/${id}`);
        const result = await res.json();
        if (result.success) {
          this.data = result.data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
});

export default umkm;
