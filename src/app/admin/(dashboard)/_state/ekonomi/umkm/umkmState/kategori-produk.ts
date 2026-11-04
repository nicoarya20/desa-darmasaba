import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const kategoriProdukFormSchema = z.object({
  nama: z.string().min(1, "Nama kategori wajib diisi"),
});

const defaultKategoriProdukForm = {
  nama: "",
};

const kategoriProduk = proxy({
  findMany: {
    data: [] as any[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    async load(page = 1, limit = 10, search = "") {
      this.loading = true;
      this.page = page;
      this.search = search;
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
        });
        const res = await fetch(
          `/api/ekonomi/kategoriproduk/find-many?${params}`
        );
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
  findManyAll: {
    data: [] as any[],
    loading: false,
    async load() {
      this.loading = true;
      try {
        const res = await fetch("/api/ekonomi/kategoriproduk/find-many-all");
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
  create: {
    form: { ...defaultKategoriProdukForm },
    loading: false,
    async submit() {
      const cek = kategoriProdukFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Nama kategori wajib diisi");
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch("/api/ekonomi/kategoriproduk/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Kategori berhasil dibuat");
          kategoriProduk.findMany.load();
          kategoriProduk.findManyAll.load();
          return true;
        }
        toast.error(result.message || "Gagal membuat kategori");
      } catch (e) {
        toast.error("Gagal membuat kategori");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
  update: {
    form: { ...defaultKategoriProdukForm },
    loading: false,
    async submit(id: string) {
      const cek = kategoriProdukFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Nama kategori wajib diisi");
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch(`/api/ekonomi/kategoriproduk/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Kategori berhasil diperbarui");
          kategoriProduk.findMany.load();
          kategoriProduk.findManyAll.load();
          return true;
        }
        toast.error(result.message || "Gagal memperbarui kategori");
      } catch (e) {
        toast.error("Gagal memperbarui kategori");
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
        const res = await fetch(`/api/ekonomi/kategoriproduk/del/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Kategori berhasil dihapus");
          kategoriProduk.findMany.load();
          kategoriProduk.findManyAll.load();
          return true;
        }
        // success:false → tampilkan alasan dari server (mis. "kategori masih dipakai")
        toast.error(result.message || "Gagal menghapus kategori");
      } catch (e) {
        toast.error("Gagal menghapus kategori");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
});

export default kategoriProduk;
