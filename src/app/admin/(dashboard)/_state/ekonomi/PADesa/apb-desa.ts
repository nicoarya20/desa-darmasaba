/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateApbDesa = z.object({
  tahun: z.number().min(4, "Tahun minimal 4 karakter"),
  pembiayaanIds: z
    .array(z.string().uuid())
    .nonempty("Pilih minimal 1 pembiayaan"),
  belanjaIds: z.array(z.string().uuid()).nonempty("Pilih minimal 1 belanja"),
  pendapatanIds: z
    .array(z.string().uuid())
    .nonempty("Pilih minimal 1 pendapatan"),
});

const ApbDesaDefaultForm = {
  tahun: 0,
  pendapatanIds: [] as string[],
  belanjaIds: [] as string[],
  pembiayaanIds: [] as string[],
};

const ApbDesa = proxy({
  create: {
    form: { ...ApbDesaDefaultForm },
    loading: false,
    async submit() {
      const cek = templateApbDesa.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.apbdesa[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan APB Desa");
          ApbDesa.findMany.load();
          this.reset();
        } else {
          // Pesan server (mis. 409 "Tahun sudah dipakai") — via data/error Eden
          toast.error(getServerMessage(res) || "Gagal menambahkan APB Desa");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan APB Desa");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...ApbDesaDefaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.ApbDesaGetPayload<{
          include: {
            pendapatan: true;
            belanja: true;
            pembiayaan: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      ApbDesa.findMany.loading = true;
      ApbDesa.findMany.page = page;
      ApbDesa.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.apbdesa[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          ApbDesa.findMany.data = res.data.data ?? [];
          ApbDesa.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          ApbDesa.findMany.data = [];
          ApbDesa.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch APB Desa paginated:", err);
        ApbDesa.findMany.data = [];
        ApbDesa.findMany.totalPages = 1;
      } finally {
        ApbDesa.findMany.loading = false;
      }
    },
  },
  findFirst: {
    data: null as Prisma.ApbDesaGetPayload<{
      include: { pendapatan: true; belanja: true; pembiayaan: true };
    }> | null,
    loading: false,
    async load(params?: Record<string, any>) {
      try {
        this.loading = true;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.apbdesa[
          "find-first"
        ].get({ query: params || {} });

        if (res.status === 200 && res.data?.success) {
          this.data = res.data.data ?? null;
        } else {
          this.data = null;
          toast.error(res.data?.message || "Gagal memuat data pertama APB Desa");
        }
      } catch (error) {
        console.error("Error findFirst APB Desa:", error);
        toast.error("Gagal memuat data APB Desa pertama");
        this.data = null;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.data = null;
    },
  },
  update: {
    id: "",
    form: { ...ApbDesaDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/apbdesa/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil APB Desa");
        }
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal memuat APB Desa");
        }

        const data = result.data;

        this.id = id;
        this.form = {
          tahun: data.tahun || 0,
          pendapatanIds: data.pendapatan?.map((p: any) => p.id) || [],
          belanjaIds: data.belanja?.map((b: any) => b.id) || [],
          pembiayaanIds: data.pembiayaan?.map((p: any) => p.id) || [],
        };

        return data;
      } catch (error) {
        console.error("Error loading APB Desa:", error);
        toast.error("Gagal memuat data APB Desa");
        return null;
      }
    },
    async update() {
      try {
        this.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/apbdesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          // Pesan server (mis. 409 "Tahun sudah dipakai") diteruskan via Error
          throw new Error(
            getServerMessage(data) || "Gagal memperbarui APB Desa"
          );
        }
        toast.success("APB Desa berhasil diperbarui");
        return data;
      } catch (error) {
        console.error("Error updating APB Desa:", error);
        toast.error((error as Error).message || "Gagal memperbarui APB Desa");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.id = "";
      this.form = { ...ApbDesaDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      try {
        this.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/apbdesa/del/${id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Gagal menghapus APB Desa");
        }
        toast.success("APB Desa berhasil dihapus");
        return true;
      } catch (error) {
        console.error("Error deleting APB Desa:", error);
        toast.error("Gagal menghapus APB Desa");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ApbDesaGetPayload<{
      include: { pendapatan: true; belanja: true; pembiayaan: true };
    }> | null,

    async load(id: string) {
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/apbdesa/${id}`
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil detail APB Desa");
        }
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal mengambil data");
        }

        this.data = result.data;
        return result.data;
      } catch (error) {
        console.error("Error loading APB Desa detail:", error);
        toast.error("Gagal memuat detail APB Desa");
        return null;
      }
    },
  },
});

export default ApbDesa;
