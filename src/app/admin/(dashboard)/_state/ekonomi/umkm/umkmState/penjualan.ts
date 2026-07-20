import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

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
  tanggal: new Date().toISOString().split("T")[0],
  isActive: true,
};

const penjualan = proxy({
  findMany: {
    data: [] as any[],
    page: 1,
    totalPages: 1,
    loading: false,
    async load(page = 1, limit = 10, produkId = "", periode = "") {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          produkId,
          periode,
        });
        const res = await fetch(
          `/api/ekonomi/umkm/penjualan/find-many?${params}`
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
  create: {
    form: { ...defaultPenjualanForm },
    loading: false,
    async submit() {
      const cek = penjualanFormSchema.safeParse(this.form);
      if (!cek.success) {
        toast.error("Cek kembali form anda");
        return false;
      }
      this.loading = true;
      try {
        const res = await fetch("/api/ekonomi/umkm/penjualan/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Penjualan berhasil dicatat");
          penjualan.findMany.load();
          return true;
        }
      } catch (e) {
        toast.error("Gagal mencatat penjualan");
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
        const res = await fetch(`/api/ekonomi/umkm/penjualan/del/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Histori penjualan berhasil dihapus");
          penjualan.findMany.load();
          return true;
        }
        toast.error(result.message);
      } catch (e) {
        toast.error("Gagal menghapus histori penjualan");
      } finally {
        this.loading = false;
      }
      return false;
    },
  },
});

export default penjualan;
