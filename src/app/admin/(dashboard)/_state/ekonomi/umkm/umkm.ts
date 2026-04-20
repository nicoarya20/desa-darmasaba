/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// UMKM Form Validation
const umkmFormSchema = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  pemilik: z.string().min(1, "Nama pemilik wajib diisi"),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
  deskripsi: z.string().optional(),
  alamat: z.string().optional(),
  kontak: z.string().optional(),
  imageId: z.string().optional(),
});

const defaultUmkmForm = {
  nama: "",
  pemilik: "",
  kategoriId: "",
  deskripsi: "",
  alamat: "",
  kontak: "",
  imageId: "",
  isActive: true,
};

// Produk Form Validation
const produkFormSchema = z.object({
  nama: z.string().min(1, "Nama produk minimal 1 karakter"),
  harga: z.number().min(0, "Harga tidak boleh negatif"),
  stok: z.number().min(0, "Stok tidak boleh negatif"),
  umkmId: z.string().min(1, "UMKM wajib dipilih"),
  deskripsi: z.string().optional(),
  imageId: z.string().optional(),
});

const defaultProdukForm = {
  nama: "",
  harga: 0,
  stok: 0,
  umkmId: "",
  deskripsi: "",
  imageId: "",
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
        if (!cek.success) return toast.error("Cek kembali form anda");
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
    create: {
      form: { ...defaultProdukForm },
      loading: false,
      async submit() {
        const cek = produkFormSchema.safeParse(this.form);
        if (!cek.success) return toast.error("Cek kembali form anda");
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
        if (!cek.success) return toast.error("Cek kembali form anda");
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
    }
  },

  // Kategori Produk (Share with Pasar Desa)
  kategoriProduk: {
    findManyAll: {
      data: [] as any[],
      loading: false,
      async load() {
        this.loading = true;
        try {
          const res = await fetch("/api/ekonomi/pasar-desa/kategori-produk/find-many-all");
          const result = await res.json();
          if (result.success) {
            this.data = result.data;
          }
        } catch (e) { console.error(e); } finally { this.loading = false; }
      }
    }
  },

  // Dashboard Module
  dashboard: {
    kpi: { data: null as any, loading: false },
    summary: { data: null as any, loading: false },
    topProduk: { data: [] as any[], loading: false },
    detail: { data: [] as any[], loading: false },
    async loadAll(periode = "") {
      const p = periode || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      this.kpi.loading = true;
      this.summary.loading = true;
      this.topProduk.loading = true;
      this.detail.loading = true;
      try {
        const [kpi, sum, top, det] = await Promise.all([
          fetch(`/api/ekonomi/umkm/dashboard/kpi?periode=${p}`).then(r => r.json()),
          fetch(`/api/ekonomi/umkm/dashboard/ringkasan-penjualan?periode=${p}`).then(r => r.json()),
          fetch(`/api/ekonomi/umkm/dashboard/top-produk?periode=${p}`).then(r => r.json()),
          fetch(`/api/ekonomi/umkm/dashboard/detail-penjualan?periode=${p}`).then(r => r.json())
        ]);
        if (kpi.success) this.kpi.data = kpi.data;
        if (sum.success) this.summary.data = sum.data;
        if (top.success) this.topProduk.data = top.data;
        if (det.success) this.detail.data = det.data;
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
