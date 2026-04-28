/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// UMKM Form Validation
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

// Produk Form Validation (Now using PasarDesa model)
const produkFormSchema = z.object({
  nama: z.string().min(1, "Nama produk minimal 1 karakter"),
  harga: z.number().min(0, "Harga tidak boleh negatif"),
  stok: z.number().min(0, "Stok tidak boleh negatif"),
  umkmId: z.string().min(1, "UMKM wajib dipilih"),
  deskripsi: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"), // PasarDesa needs category
});

const defaultProdukForm = {
  nama: "",
  harga: 0,
  stok: 0,
  umkmId: "",
  deskripsi: "",
  imageId: null as string | null,
  kategoriId: "",
  isActive: true,
};

// Penjualan Form Validation
const penjualanFormSchema = z.object({
  produkId: z.string().min(1, "Produk wajib dipilih"),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
  hargaSatuan: z.number().min(0, "Harga tidak boleh negatif"),
  tanggal: z.string().optional(),
});

const defaultPenjualanForm = {
  produkId: "",
  jumlah: 0,
  hargaSatuan: 0,
  tanggal: new Date().toISOString().split('T')[0],
  isActive: true,
};

// Kategori Produk Form Validation
const kategoriProdukFormSchema = z.object({
  nama: z.string().min(1, "Nama kategori wajib diisi"),
});

const defaultKategoriProdukForm = {
  nama: "",
};

export const umkmState = proxy({
  // UMKM Module
  umkm: {
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
            kategoriId
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
      }
    },
    create: {
      form: { ...defaultUmkmForm },
      loading: false,
      async submit() {
        const cek = umkmFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Cek kembali form anda"); return false; }
        this.loading = true;
        try {
          const res = await fetch("/api/ekonomi/umkm/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("UMKM berhasil dibuat");
            umkmState.umkm.findMany.load();
            return true;
          }
          toast.error(result.message);
        } catch (e) {
          toast.error("Gagal membuat UMKM");
        } finally {
          this.loading = false;
        }
        return false;
      }
    },
    update: {
      form: { ...defaultUmkmForm },
      loading: false,
      async submit(id: string) {
        const cek = umkmFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Cek kembali form anda"); return false; }
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/umkm/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("UMKM berhasil diperbarui");
            umkmState.umkm.findMany.load();
            return true;
          }
          toast.error(result.message);
        } catch (e) {
          toast.error("Gagal memperbarui UMKM");
        } finally {
          this.loading = false;
        }
        return false;
      }
    },
    del: {
      loading: false,
      async submit(id: string) {
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/umkm/del/${id}`, {
            method: "DELETE"
          });
          const result = await res.json();
          if (result.success) {
            toast.success("UMKM berhasil dihapus");
            umkmState.umkm.findMany.load();
            return true;
          }
          toast.error(result.message);
        } catch (e) {
          toast.error("Gagal menghapus UMKM");
        } finally {
          this.loading = false;
        }
        return false;
      }
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
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
    }
  },

  // Produk Module
  produk: {
    findMany: {
      data: [] as any[],
      page: 1,
      totalPages: 1,
      loading: false,
      async load(page = 1, limit = 10, search = "", umkmId = "", kategoriId = "") {
        this.loading = true;
        this.page = page;
        try {
          const params = new URLSearchParams({ 
            page: page.toString(), 
            limit: limit.toString(), 
            search, 
            umkmId,
            kategoriId
          });
          const res = await fetch(`/api/ekonomi/umkm/produk/find-many?${params}`);
          const result = await res.json();
          if (result.success) {
            this.data = result.data;
            this.totalPages = result.totalPages;
          }
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
    },
    findUnique: {
      data: null as any,
      loading: false,
      async load(id: string) {
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/umkm/produk/${id}`);
          const result = await res.json();
          if (result.success) {
            this.data = result.data;
          }
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
    },
    create: {
      form: { ...defaultProdukForm },
      loading: false,
      async submit() {
        const cek = produkFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Cek kembali form anda"); return false; }
        this.loading = true;
        try {
          const res = await fetch("/api/ekonomi/umkm/produk/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Produk berhasil dibuat");
            umkmState.produk.findMany.load();
            return true;
          }
        } catch (e) { toast.error("Gagal membuat produk"); } finally { this.loading = false; }
        return false;
      }
    },
    update: {
      form: { ...defaultProdukForm },
      loading: false,
      async submit(id: string) {
        const cek = produkFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Cek kembali form anda"); return false; }
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/umkm/produk/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Produk berhasil diperbarui");
            umkmState.produk.findMany.load();
            return true;
          }
        } catch (e) { toast.error("Gagal memperbarui produk"); } finally { this.loading = false; }
        return false;
      }
    },
    del: {
      loading: false,
      async submit(id: string) {
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/umkm/produk/del/${id}`, {
            method: "DELETE"
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Produk berhasil dihapus");
            umkmState.produk.findMany.load();
            return true;
          }
        } catch (e) { toast.error("Gagal menghapus produk"); } finally { this.loading = false; }
        return false;
      }
    }
  },

  // Penjualan Module
  penjualan: {
    findMany: {
      data: [] as any[],
      page: 1,
      totalPages: 1,
      loading: false,
      async load(page = 1, limit = 10, produkId = "", periode = "") {
        this.loading = true;
        try {
          const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), produkId, periode });
          const res = await fetch(`/api/ekonomi/umkm/penjualan/find-many?${params}`);
          const result = await res.json();
          if (result.success) {
            this.data = result.data;
            this.totalPages = result.totalPages;
          }
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
    },
    create: {
      form: { ...defaultPenjualanForm },
      loading: false,
      async submit() {
        const cek = penjualanFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Cek kembali form anda"); return false; }
        this.loading = true;
        try {
          const res = await fetch("/api/ekonomi/umkm/penjualan/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Penjualan berhasil dicatat");
            umkmState.penjualan.findMany.load();
            return true;
          }
        } catch (e) { toast.error("Gagal mencatat penjualan"); } finally { this.loading = false; }
        return false;
      }
    },
    del: {
      loading: false,
      async submit(id: string) {
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/umkm/penjualan/del/${id}`, {
            method: "DELETE"
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Histori penjualan berhasil dihapus");
            umkmState.penjualan.findMany.load();
            return true;
          }
          toast.error(result.message);
        } catch (e) {
          toast.error("Gagal menghapus histori penjualan");
        } finally {
          this.loading = false;
        }
        return false;
      }
    }
  },

  // Kategori Produk (Share with Pasar Desa)
  kategoriProduk: {
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
            search 
          });
          const res = await fetch(`/api/ekonomi/kategoriproduk/find-many?${params}`);
          const result = await res.json();
          if (result.success) {
            this.data = result.data;
            this.totalPages = result.totalPages;
          }
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
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
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
    },
    create: {
      form: { ...defaultKategoriProdukForm },
      loading: false,
      async submit() {
        const cek = kategoriProdukFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Nama kategori wajib diisi"); return false; }
        this.loading = true;
        try {
          const res = await fetch("/api/ekonomi/kategoriproduk/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Kategori berhasil dibuat");
            umkmState.kategoriProduk.findMany.load();
            umkmState.kategoriProduk.findManyAll.load();
            return true;
          }
          toast.error(result.message || "Gagal membuat kategori");
        } catch (e) { toast.error("Gagal membuat kategori"); } finally { this.loading = false; }
        return false;
      }
    },
    update: {
      form: { ...defaultKategoriProdukForm },
      loading: false,
      async submit(id: string) {
        const cek = kategoriProdukFormSchema.safeParse(this.form);
        if (!cek.success) { toast.error("Nama kategori wajib diisi"); return false; }
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/kategoriproduk/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.form)
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Kategori berhasil diperbarui");
            umkmState.kategoriProduk.findMany.load();
            umkmState.kategoriProduk.findManyAll.load();
            return true;
          }
          toast.error(result.message || "Gagal memperbarui kategori");
        } catch (e) { toast.error("Gagal memperbarui kategori"); } finally { this.loading = false; }
        return false;
      }
    },
    del: {
      loading: false,
      async submit(id: string) {
        this.loading = true;
        try {
          const res = await fetch(`/api/ekonomi/kategoriproduk/del/${id}`, {
            method: "DELETE"
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Kategori berhasil dihapus");
            umkmState.kategoriProduk.findMany.load();
            umkmState.kategoriProduk.findManyAll.load();
            return true;
          }
        } catch (e) { toast.error("Gagal menghapus kategori"); } finally { this.loading = false; }
        return false;
      }
    }
  },

  // Dashboard Module
  dashboard: {
    kpi: { data: null as any, loading: false },
    summary: { data: null as any, loading: false },
    topProduk: { data: [] as any[], loading: false },
    detail: { data: [] as any[], loading: false },
    mode: "month" as "week" | "month",
    async loadAll(periode = "", mode?: "week" | "month", kategoriId = "", umkmId = "") {
      const p = periode || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const m = mode ?? this.mode;
      const modeParam = m === "week" ? "&mode=week" : "";
      const detailFilter = [
        kategoriId ? `&kategoriId=${kategoriId}` : "",
        umkmId ? `&umkmId=${umkmId}` : "",
      ].join("");
      this.kpi.loading = true;
      this.summary.loading = true;
      this.topProduk.loading = true;
      this.detail.loading = true;
      try {
        const [kpi, sum, top, det] = await Promise.all([
          fetch(`/api/ekonomi/umkm/dashboard/kpi?periode=${p}${modeParam}`).then(r => r.json()),
          fetch(`/api/ekonomi/umkm/dashboard/ringkasan-penjualan?periode=${p}${modeParam}`).then(r => r.json()),
          fetch(`/api/ekonomi/umkm/dashboard/top-produk?periode=${p}${modeParam}`).then(r => r.json()),
          fetch(`/api/ekonomi/umkm/dashboard/detail-penjualan?periode=${p}${modeParam}${detailFilter}`).then(r => r.json()),
        ]);
        if (kpi.success) this.kpi.data = kpi.data;
        if (sum.success) this.summary.data = sum.data;
        if (top.success) this.topProduk.data = top.data;
        if (det.success) this.detail.data = det.data;
        this.mode = m;
      } catch (e) { console.error(e); } finally {
        this.kpi.loading = false;
        this.summary.loading = false;
        this.topProduk.loading = false;
        this.detail.loading = false;
      }
    }
  }
});

export default umkmState;
