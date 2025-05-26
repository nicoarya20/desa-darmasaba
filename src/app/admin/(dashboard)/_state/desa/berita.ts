
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
    data: null as
      | null
      | Prisma.KategoriBeritaGetPayload<{ omit: { isActive: true } }>[],
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
          return toast.success("success create");
        }

        return toast.error("failed create");
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
    async load() {
      const res = await ApiFetch.api.desa.berita["find-many"].get();
      if (res.status === 200) {
        berita.findMany.data = (res.data?.data ) ?? [];
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
 
});

// 5. State global
const stateDashboardBerita = proxy({
  category,
  berita,
});

export default stateDashboardBerita;
