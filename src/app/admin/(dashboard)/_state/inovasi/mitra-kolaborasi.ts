/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const mitraKolaborasiForm = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  imageId: z.string().nonempty(),
});

const defaultForm = {
  name: "",
  imageId: "",
};

const mitraKolaborasi = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = mitraKolaborasiForm.safeParse(mitraKolaborasi.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        mitraKolaborasi.create.loading = true;
        const res = await ApiFetch.api.inovasi.mitrakolaborasi["create"].post(
          mitraKolaborasi.create.form
        );
        if (res.status === 200) {
          mitraKolaborasi.findMany.load();
          return toast.success("mitraKolaborasi berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan mitraKolaborasi");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        mitraKolaborasi.create.loading = false;
      }
    },
    resetForm() {
      mitraKolaborasi.create.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.MitraKolaborasiGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      mitraKolaborasi.findMany.loading = true; // ✅ Akses langsung via nama path
      mitraKolaborasi.findMany.page = page;
      mitraKolaborasi.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.inovasi.mitrakolaborasi["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          mitraKolaborasi.findMany.data = res.data.data ?? [];
          mitraKolaborasi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          mitraKolaborasi.findMany.data = [];
          mitraKolaborasi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch mitraKolaborasi paginated:", err);
        mitraKolaborasi.findMany.data = [];
        mitraKolaborasi.findMany.totalPages = 1;
      } finally {
        mitraKolaborasi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.MitraKolaborasiGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/inovasi/mitrakolaborasi/${id}`);
        if (res.ok) {
          const data = await res.json();
          mitraKolaborasi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch mitraKolaborasi:", res.statusText);
          mitraKolaborasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching mitraKolaborasi:", error);
        mitraKolaborasi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        mitraKolaborasi.delete.loading = true;
        const response = await fetch(`/api/inovasi/mitrakolaborasi/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (response.ok) {
          toast.success(result.message || "mitraKolaborasi berhasil dihapus");
          await mitraKolaborasi.findMany.load(); // refresh list
        } else {
          toast.error(result.message || "Gagal menghapus mitraKolaborasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus mitraKolaborasi");
      } finally {
        mitraKolaborasi.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/inovasi/mitrakolaborasi/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
            name: data.name,
            imageId: data.imageId,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading mitraKolaborasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = mitraKolaborasiForm.safeParse(mitraKolaborasi.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        mitraKolaborasi.update.loading = true;
        const response = await fetch(`/api/inovasi/mitrakolaborasi/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            imageId: this.form.imageId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "mitraKolaborasi berhasil diupdate");
          await mitraKolaborasi.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate mitraKolaborasi");
        }
      } catch (error) {
        console.error("Error updating mitraKolaborasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate mitraKolaborasi"
        );
        return false;
      } finally {
        mitraKolaborasi.update.loading = false;
      }
    },
    reset() {
      mitraKolaborasi.update.id = "";
      mitraKolaborasi.update.form = { ...defaultForm };
    },
  },
});

export default mitraKolaborasi;
