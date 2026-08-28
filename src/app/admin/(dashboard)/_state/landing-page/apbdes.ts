/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// --- Zod Schema untuk APBDes Item (dengan field kalkulasi) ---
const ApbdesItemSchema = z.object({
  kode: z.string().min(1, "Kode wajib diisi"),
  uraian: z.string().min(1, "Uraian wajib diisi"),
  anggaran: z.number().min(0, "Anggaran tidak boleh negatif"),
  level: z.number().int().min(1).max(3),
  tipe: z.enum(['pendapatan', 'belanja', 'pembiayaan']).nullable().optional(),
  // Field kalkulasi dari realisasiItems (auto-calculated di backend)
  realisasi: z.number().min(0).default(0),
  selisih: z.number().default(0),
  persentase: z.number().default(0),
});

const ApbdesFormSchema = z.object({
  tahun: z.number().int().min(2000, "Tahun tidak valid"),
  name: z.string().optional(),
  deskripsi: z.string().optional(),
  jumlah: z.string().optional(),
  // Image dan file opsional (bisa kosong)
  imageId: z.string().optional(),
  fileId: z.string().optional(),
  items: z.array(ApbdesItemSchema).min(1, "Minimal ada 1 item"),
});

// --- Default Form ---
const defaultApbdesForm = {
  tahun: new Date().getFullYear(),
  name: "",
  deskripsi: "",
  jumlah: "",
  imageId: "",
  fileId: "",
  items: [] as z.infer<typeof ApbdesItemSchema>[],
};

// --- Helper: Normalize item (dengan field kalkulasi) ---
function normalizeItem(item: Partial<z.infer<typeof ApbdesItemSchema>>): z.infer<typeof ApbdesItemSchema> {
  return {
    kode: item.kode || "",
    uraian: item.uraian || "",
    anggaran: item.anggaran ?? 0,
    level: item.level || 1,
    tipe: item.tipe ?? null,
    realisasi: item.realisasi ?? 0,
    selisih: item.selisih ?? 0,
    persentase: item.persentase ?? 0,
  };
}

// --- State Utama ---
const apbdes = proxy({
  create: {
    form: { ...defaultApbdesForm },
    loading: false,

    addItem(item: Partial<z.infer<typeof ApbdesItemSchema>>) {
      const normalized = normalizeItem(item);
      this.form.items.push(normalized);
    },

    removeItem(index: number) {
      this.form.items.splice(index, 1);
    },

    updateItem(index: number, updates: Partial<z.infer<typeof ApbdesItemSchema>>) {
      const current = this.form.items[index];
      if (current) {
        const updated = normalizeItem({ ...current, ...updates });
        this.form.items[index] = updated;
      }
    },

    reset() {
      this.form = { ...defaultApbdesForm };
    },

    async create() {
      const parsed = ApbdesFormSchema.safeParse(this.form);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")} - ${issue.message}`);
        toast.error(`Validasi gagal:\n${errors.join("\n")}`);
        return;
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.landingpage.apbdes["create"].post(parsed.data);

        if (res.data?.success) {
          toast.success("APBDes berhasil dibuat");
          apbdes.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal membuat APBDes");
        }
      } catch (error: any) {
        console.error("Create APBDes error:", error);
        toast.error(error?.message || "Terjadi kesalahan saat membuat APBDes");
      } finally {
        this.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.APBDesGetPayload<{
          include: { image: true; file: true; items: { include: { realisasiItems: true } } };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",

    load: async (page = 1, limit = 10, search = "") => {
      apbdes.findMany.loading = true;
      apbdes.findMany.page = page;
      apbdes.findMany.search = search;
    
      try {
        const query: Record<string, string> = { page: String(page), limit: String(limit) };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.landingpage.apbdes["findMany"].get({ query });
    
        if (res.data?.success) {
          apbdes.findMany.data = res.data.data || [];
          apbdes.findMany.total = res.data.meta?.total || 0;
          apbdes.findMany.totalPages = res.data.meta?.totalPages || 1;
        } else {
          apbdes.findMany.data = [];
          apbdes.findMany.total = 0;
          apbdes.findMany.totalPages = 1;
          toast.error(res.data?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("FindMany error:", error);
        apbdes.findMany.data = [];
        apbdes.findMany.total = 0;
        apbdes.findMany.totalPages = 1;
        toast.error("Gagal memuat daftar APBDes");
      } finally {
        apbdes.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as
      | Prisma.APBDesGetPayload<{
          include: { image: true; file: true; items: { include: { realisasiItems: true } } };
        }>
      | null,
    loading: false,
    error: null as string | null,

    async load(id: string) {
      if (!id || id.trim() === '') {
        this.data = null;
        this.error = "ID tidak valid";
        return;
      }

      // Prevent multiple simultaneous loads
      if (this.loading) {
        console.log("⚠️ Already loading, skipping...");
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const url = `/api/landingpage/apbdes/${id}`;
        console.log("🌐 Fetching:", url);

        const response = await fetch(url);
        const res = await response.json();

        console.log("📦 Response:", res);

        if (res.success && res.data) {
          this.data = res.data;
        } else {
          this.data = null;
          this.error = res.message || "Gagal memuat detail APBDes";
          toast.error(this.error);
        }
      } catch (error) {
        console.error("❌ FindUnique error:", error);
        this.data = null;
        this.error = "Gagal memuat detail APBDes";
        toast.error(this.error);
      } finally {
        this.loading = false;
      }
    }
  },

  delete: {
    loading: false,
    async byId(id: string): Promise<boolean> {
      if (!id) {
        toast.warn("ID tidak valid");
        return false;
      }

      try {
        this.loading = true;
        const res = await (ApiFetch.api.landingpage.apbdes as any)["del"][id].delete();

        if (res.data?.success) {
          toast.success("APBDes berhasil dihapus");
          await apbdes.findMany.load();
          return true;
        }

        toast.error(res.data?.message || "Gagal menghapus APBDes");
        return false;
      } catch (error: any) {
        console.error("Delete error:", error);
        toast.error(error?.message || "Terjadi kesalahan saat menghapus");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultApbdesForm },
    loading: false,

    async load(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        this.loading = true;
        const res = await (ApiFetch.api.landingpage.apbdes as any)[id].get();

        if (res.data?.success) {
          const data = res.data.data;
          this.id = data.id;
          this.form = {
            tahun: data.tahun || new Date().getFullYear(),
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            jumlah: data.jumlah || "",
            imageId: data.imageId || "",
            fileId: data.fileId || "",
            items: (data.items || []).map((item: any) => ({
              kode: item.kode,
              uraian: item.uraian,
              anggaran: item.anggaran,
              realisasi: item.totalRealisasi || 0,
              selisih: item.selisih || 0,
              persentase: item.persentase || 0,
              level: item.level,
              tipe: item.tipe || 'pendapatan',
            })),
          };
          return data;
        } else {
          throw new Error(res.data?.message || "Gagal memuat data");
        }
      } catch (error: any) {
        console.error("Edit load error:", error);
        toast.error(error.message || "Gagal memuat data untuk diedit");
      } finally {
        this.loading = false;
      }
    },

    async update() {
      const parsed = ApbdesFormSchema.safeParse(this.form);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")} - ${issue.message}`);
        toast.error(`Validasi gagal:\n${errors.join("\n")}`);
        return false;
      }

      try {
        this.loading = true;
        // Include the ID in the request body
        // Omit realisasi, selisih, persentase karena itu calculated fields di backend
        const requestData = {
          tahun: parsed.data.tahun,
          name: parsed.data.name,
          deskripsi: parsed.data.deskripsi,
          jumlah: parsed.data.jumlah,
          imageId: parsed.data.imageId,
          fileId: parsed.data.fileId,
          id: this.id,
          items: parsed.data.items.map(item => ({
            kode: item.kode,
            uraian: item.uraian,
            anggaran: item.anggaran,
            level: item.level,
            tipe: item.tipe ?? null,
          })),
        };

        const res = await (ApiFetch.api.landingpage.apbdes as any)[this.id].put(requestData);

        if (res.data?.success) {
          toast.success("APBDes berhasil diperbarui");
          apbdes.findMany.load();
          return true;
        } else {
          throw new Error(res.data?.message || "Gagal memperbarui APBDes");
        }
      } catch (error: any) {
        console.error("Update error:", error);
        toast.error(error.message || "Gagal memperbarui APBDes");
        return false;
      } finally {
        this.loading = false;
      }
    },

    addItem(item: Partial<z.infer<typeof ApbdesItemSchema>>) {
      const normalized = normalizeItem(item);
      this.form.items.push(normalized);
    },

    removeItem(index: number) {
      this.form.items.splice(index, 1);
    },

    reset() {
      this.id = "";
      this.form = { ...defaultApbdesForm };
    },
  },

  // =========================================
  // REALISASI STATE MANAGEMENT
  // =========================================
  realisasi: {
    // Create realisasi
    async create(itemId: string, data: { kode: string; jumlah: number; tanggal: string; keterangan?: string; buktiFileId?: string }) {
      try {
        const res = await (ApiFetch.api.landingpage.apbdes as any)[itemId].realisasi.post(data);

        if (res.data?.success) {
          toast.success("Realisasi berhasil ditambahkan");
          // Reload findUnique untuk update data
          const currentId = apbdes.findUnique.data?.id;
          if (currentId) {
            await apbdes.findUnique.load(currentId);
          }
          return true;
        } else {
          toast.error(res.data?.message || "Gagal menambahkan realisasi");
          return false;
        }
      } catch (error: any) {
        console.error("Create realisasi error:", error);
        toast.error(error?.message || "Terjadi kesalahan saat menambahkan realisasi");
        return false;
      }
    },

    // Update realisasi
    async update(realisasiId: string, data: { kode?: string; jumlah?: number; tanggal?: string; keterangan?: string; buktiFileId?: string }) {
      try {
        const res = await (ApiFetch.api.landingpage.apbdes as any).realisasi[realisasiId].put(data);

        if (res.data?.success) {
          toast.success("Realisasi berhasil diperbarui");
          // Reload findUnique untuk update data
          const currentId = apbdes.findUnique.data?.id;
          if (currentId) {
            await apbdes.findUnique.load(currentId);
          }
          return true;
        } else {
          toast.error(res.data?.message || "Gagal memperbarui realisasi");
          return false;
        }
      } catch (error: any) {
        console.error("Update realisasi error:", error);
        toast.error(error?.message || "Terjadi kesalahan saat memperbarui realisasi");
        return false;
      }
    },

    // Delete realisasi
    async delete(realisasiId: string) {
      try {
        const res = await (ApiFetch.api.landingpage.apbdes as any).realisasi[realisasiId].delete();

        if (res.data?.success) {
          toast.success("Realisasi berhasil dihapus");
          // Reload findUnique untuk update data
          if (apbdes.findUnique.data) {
            await apbdes.findUnique.load(apbdes.findUnique.data.id);
          }
          return true;
        } else {
          toast.error(res.data?.message || "Gagal menghapus realisasi");
          return false;
        }
      } catch (error: any) {
        console.error("Delete realisasi error:", error);
        toast.error(error?.message || "Terjadi kesalahan saat menghapus realisasi");
        return false;
      }
    },
  },
});

export default apbdes;