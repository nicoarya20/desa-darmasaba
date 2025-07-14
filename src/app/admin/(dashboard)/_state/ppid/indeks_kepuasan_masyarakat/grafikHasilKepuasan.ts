/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikHasilKepuasanMasyarakat = z.object({
  label: z.string().min(2, "Label harus diisi"),
  kepuasan: z.string().min(1, "Kepuasan harus diisi"),
});

const defaultForm = {
  label: "",
  kepuasan: "",
};

const grafikHasilKepuasanMasyarakat = proxy({
  create: {
    form: {...defaultForm},
    loading: false,
    async create() {
      const cek = templateGrafikHasilKepuasanMasyarakat.safeParse(
        grafikHasilKepuasanMasyarakat.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikHasilKepuasanMasyarakat.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikhasilkepuasamanmasyarakat["create"].post(grafikHasilKepuasanMasyarakat.create.form);
        if (res.status === 200) {
          toast.success("Grafik hasil kepuasan masyarakat berhasil ditambahkan");
          await grafikHasilKepuasanMasyarakat.findMany.load();
        } else {
          toast.error(res.data?.message ?? "Gagal tambah grafik hasil kepuasan masyarakat");
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error("Terjadi kesalahan saat menambahkan grafik hasil kepuasan masyarakat");
      } finally {
        grafikHasilKepuasanMasyarakat.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    load: async (page = 1, limit = 10) => {  // Change to arrow function
      grafikHasilKepuasanMasyarakat.findMany.loading = true;  // Use the full path to access the property
      grafikHasilKepuasanMasyarakat.findMany.page = page;
      try {
        const res = await ApiFetch.api.ppid.grafikhasilkepuasamanmasyarakat["find-many"].get({
          query: { page, limit },
        });
  
        if (res.status === 200 && res.data?.success) {
          grafikHasilKepuasanMasyarakat.findMany.data = res.data.data || [];
          grafikHasilKepuasanMasyarakat.findMany.total = res.data.total || 0;
          grafikHasilKepuasanMasyarakat.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load grafik hasil kepuasan masyarakat:", res.data?.message);
          grafikHasilKepuasanMasyarakat.findMany.data = [];
          grafikHasilKepuasanMasyarakat.findMany.total = 0;
          grafikHasilKepuasanMasyarakat.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading grafik hasil kepuasan masyarakat:", error);
        grafikHasilKepuasanMasyarakat.findMany.data = [];
        grafikHasilKepuasanMasyarakat.findMany.total = 0;
        grafikHasilKepuasanMasyarakat.findMany.totalPages = 1;
      } finally {
        grafikHasilKepuasanMasyarakat.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.IndeksKepuasanMasyarakatGetPayload<{
      omit: { isActive: true };
    }> | null,

    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/grafikhasilkepuasamanmasyarakat/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          grafikHasilKepuasanMasyarakat.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikHasilKepuasanMasyarakat.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik hasil kepuasan masyarakat:", error);
        grafikHasilKepuasanMasyarakat.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async byId() {
      // Method implementation if needed
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
    
      // ✅ Validasi pakai Zod
      const cek = templateGrafikHasilKepuasanMasyarakat.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
    
      this.loading = true;
    
      try {
        const response = await fetch(`/api/ppid/grafikhasilkepuasamanmasyarakat/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });
    
        const result = await response.json();
    
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
    
        toast.success("Berhasil update data!");
    
        // ✅ Optional: refresh list kalau kamu langsung ke halaman list
        await grafikHasilKepuasanMasyarakat.findMany.load();
    
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik hasil kepuasan masyarakat");
      } finally {
        this.loading = false;
      }
    }
    
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        grafikHasilKepuasanMasyarakat.delete.loading = true;

        const response = await fetch(`/api/ppid/grafikhasilkepuasamanmasyarakat/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Grafik hasil kepuasan masyarakat berhasil dihapus");
          await grafikHasilKepuasanMasyarakat.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus grafik hasil kepuasan masyarakat");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik hasil kepuasan masyarakat");
      } finally {
        grafikHasilKepuasanMasyarakat.delete.loading = false;
      }
    },
  }
});

export default grafikHasilKepuasanMasyarakat;
