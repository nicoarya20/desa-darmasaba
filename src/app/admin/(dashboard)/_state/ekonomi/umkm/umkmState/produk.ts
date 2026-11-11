import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import {
  validateLinkTokoOnlineList,
  type LinkTokoOnlineInput,
} from "@/lib/link-toko-online";

const produkFormSchema = z.object({
  nama: z.string().min(1, "Nama produk minimal 1 karakter"),
  harga: z.number().min(0, "Harga tidak boleh negatif"),
  stok: z.number().min(0, "Stok tidak boleh negatif"),
  satuan: z.string().optional().nullable(),
  umkmId: z.string().min(1, "UMKM wajib dipilih"),
  deskripsi: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
  isUnggulan: z.boolean().optional(),
  linkTokoOnline: z.array(z.object({ platform: z.string(), url: z.string() })).optional(),
});

const defaultProdukForm = {
  nama: "",
  harga: 0,
  stok: 0,
  satuan: "",
  umkmId: "",
  deskripsi: "",
  imageId: null as string | null,
  kategoriId: "",
  isActive: true,
  isUnggulan: false,
  linkTokoOnline: [] as LinkTokoOnlineInput[],
};

const produk = proxy({
  findMany: {
    data: [] as any[],
    page: 1,
    totalPages: 1,
    loading: false,
    async load(
      page = 1,
      limit = 10,
      search = "",
      umkmId = "",
      kategoriId = "",
      unggulan = false
    ) {
      this.loading = true;
      this.page = page;
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          umkmId,
          kategoriId,
        });
        if (unggulan) params.set("unggulan", "true");
        const res = await fetch(
          `/api/ekonomi/umkm/produk/find-many?${params}`
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
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
  create: {
    form: { ...defaultProdukForm, linkTokoOnline: [] as LinkTokoOnlineInput[] },
    loading: false,
    async submit() {
      const cek = produkFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Cek kembali form anda");
        return false;
      }
      const cekLink = validateLinkTokoOnlineList(this.form.linkTokoOnline);
      if (!cekLink.ok) {
        toast.error(cekLink.message);
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch("/api/ekonomi/umkm/produk/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Produk berhasil dibuat");
          produk.findMany.load();
          return true;
        }
        toast.error(result.message || "Gagal membuat produk");
      } catch (e) {
        toast.error("Gagal membuat produk");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
  update: {
    form: { ...defaultProdukForm, linkTokoOnline: [] as LinkTokoOnlineInput[] },
    loading: false,
    async submit(id: string) {
      const cek = produkFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Cek kembali form anda");
        return false;
      }
      const cekLink = validateLinkTokoOnlineList(this.form.linkTokoOnline);
      if (!cekLink.ok) {
        toast.error(cekLink.message);
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch(`/api/ekonomi/umkm/produk/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Produk berhasil diperbarui");
          produk.findMany.load();
          return true;
        }
        toast.error(result.message || "Gagal memperbarui produk");
      } catch (e) {
        toast.error("Gagal memperbarui produk");
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
        const res = await fetch(`/api/ekonomi/umkm/produk/del/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Produk berhasil dihapus");
          produk.findMany.load();
          return true;
        }
      } catch (e) {
        toast.error("Gagal menghapus produk");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
});

export default produk;
