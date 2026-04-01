/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
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
          toast.error(res.data?.message || "Gagal menambahkan APB Desa");
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
      ApbDesa.findMany.loading = true; // ✅ Akses langsung via nama path
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
          ApbDesa.findMany.totalPages =
            res.data.totalPages ?? 1;
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
  
        // ✅ request ke endpoint find-first
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
        if (!response.ok) {
          throw new Error("Gagal memperbarui APB Desa");
        }
        const data = await response.json();
        toast.success("APB Desa berhasil diperbarui");
        return data;
      } catch (error) {
        console.error("Error updating APB Desa:", error);
        toast.error("Gagal memperbarui APB Desa");
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

        this.data = result.data; // ✅ fix utama di sini
        return result.data;
      } catch (error) {
        console.error("Error loading APB Desa detail:", error);
        toast.error("Gagal memuat detail APB Desa");
        return null;
      }
    },
  },
});

const templatePendapatan = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  value: z.number().int().positive("Nilai harus angka positif"),
});

const PendapatanDefaultForm = {
  name: "",
  value: 0,
};

const pendapatan = proxy({
  create: {
    form: { ...PendapatanDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePendapatan.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res =
          await ApiFetch.api.ekonomi.pendapatanaslidesa.pendapatanasli[
            "create"
          ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan Pendapatan Asli");
          pendapatan.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan Pendapatan Asli");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan Pendapatan Asli");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...PendapatanDefaultForm };
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pendapatan.findMany.loading = true; // ✅ Akses langsung via nama path
      pendapatan.findMany.page = page;
      pendapatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pendapatanasli[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pendapatan.findMany.data = res.data.data ?? [];
          pendapatan.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          pendapatan.findMany.data = [];
          pendapatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch pendapatan asli desa paginated:", err);
        pendapatan.findMany.data = [];
        pendapatan.findMany.totalPages = 1;
      } finally {
        pendapatan.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...PendapatanDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pendapatanasli/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
            value: data.value,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading pendapatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templatePendapatan.safeParse(pendapatan.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pendapatan.update.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pendapatanasli/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              value: this.form.value,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update pendapatan");
          await pendapatan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate pendapatan");
        }
      } catch (error) {
        console.error("Error updating pendapatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pendapatan"
        );
        return false;
      } finally {
        pendapatan.update.loading = false;
      }
    },
    reset() {
      pendapatan.update.id = "";
      pendapatan.update.form = { ...PendapatanDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pendapatan.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pendapatanasli/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pendapatan Asli berhasil dihapus");
          await pendapatan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Pendapatan Asli");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Pendapatan Asli");
      } finally {
        pendapatan.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PendapatanGetPayload<{
      select: { isActive: boolean };
    }> | null,
    async load(id: string) {
      const res = await fetch(
        `/api/ekonomi/pendapatanaslidesa/pendapatanasli/${id}`
      );
      if (res.ok) {
        const json = await res.json();
        pendapatan.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? true, // Fallback ke aktif:true jika tidak ada data
            }
          : null;
      } else {
        pendapatan.findUnique.data = null;
      }
    },
  },
});

const templateBelanja = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  value: z.number().int().positive("Nilai harus angka positif"),
});

const BelanjaDefaultForm = {
  name: "",
  value: 0,
};

const belanja = proxy({
  create: {
    form: { ...BelanjaDefaultForm },
    loading: false,
    async submit() {
      const cek = templateBelanja.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.belanja[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan Belanja");
          belanja.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan Belanja");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan Belanja");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...BelanjaDefaultForm };
    },
  },
  findMany: {
    data: [] as Array<{
      id: string;
      name: string;
      value: number;
    }>,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      belanja.findMany.loading = true; // ✅ Akses langsung via nama path
      belanja.findMany.page = page;
      belanja.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.belanja[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          belanja.findMany.data = res.data.data ?? [];
          belanja.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          belanja.findMany.data = [];
          belanja.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch Belanja paginated:", err);
        belanja.findMany.data = [];
        belanja.findMany.totalPages = 1;
      } finally {
        belanja.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...BelanjaDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/belanja/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
            value: data.value,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading belanja:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateBelanja.safeParse(belanja.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        belanja.update.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/belanja/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              value: this.form.value,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update belanja");
          await belanja.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate belanja");
        }
      } catch (error) {
        console.error("Error updating belanja:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate belanja"
        );
        return false;
      } finally {
        belanja.update.loading = false;
      }
    },
    reset() {
      belanja.update.id = "";
      belanja.update.form = { ...BelanjaDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        belanja.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/belanja/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Belanja berhasil dihapus");
          await belanja.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Belanja");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Belanja");
      } finally {
        belanja.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.BelanjaGetPayload<{
      select: { isActive: boolean };
    }> | null,
    async load(id: string) {
      const res = await fetch(`/api/ekonomi/pendapatanaslidesa/belanja/${id}`);
      if (res.ok) {
        const json = await res.json();
        belanja.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? true, // Fallback ke aktif:true jika tidak ada data
            }
          : null;
      } else {
        belanja.findUnique.data = null;
      }
    },
  },
});

const templatePembiayaan = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  value: z.number().int().positive("Nilai harus angka positif"),
});

const PembiayaanDefaultForm = {
  name: "",
  value: 0,
};

const pembiayaan = proxy({
  create: {
    form: { ...PembiayaanDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePembiayaan.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pembiayaan[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan Pembiayaan");
          pembiayaan.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan Pembiayaan");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan Pembiayaan");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...PembiayaanDefaultForm };
    },
  },
  findMany: {
    data: [] as Array<{
      id: string;
      name: string;
      value: number;
    }>,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pembiayaan.findMany.loading = true; // ✅ Akses langsung via nama path
      pembiayaan.findMany.page = page;
      pembiayaan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pembiayaan[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pembiayaan.findMany.data = res.data.data ?? [];
          pembiayaan.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          pembiayaan.findMany.data = [];
          pembiayaan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch Pembiayaan paginated:", err);
        pembiayaan.findMany.data = [];
        pembiayaan.findMany.totalPages = 1;
      } finally {
        pembiayaan.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...PembiayaanDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pembiayaan/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
            value: data.value,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading pembiayaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templatePembiayaan.safeParse(pembiayaan.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pembiayaan.update.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pembiayaan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              value: this.form.value,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update pembiayaan");
          await pembiayaan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate pembiayaan");
        }
      } catch (error) {
        console.error("Error updating pembiayaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pembiayaan"
        );
        return false;
      } finally {
        pembiayaan.update.loading = false;
      }
    },
    reset() {
      pembiayaan.update.id = "";
      pembiayaan.update.form = { ...PembiayaanDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pembiayaan.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pembiayaan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pembiayaan berhasil dihapus");
          await pembiayaan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Pembiayaan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Pembiayaan");
      } finally {
        pembiayaan.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PembiayaanGetPayload<{
      select: { isActive: boolean };
    }> | null,
    async load(id: string) {
      const res = await fetch(
        `/api/ekonomi/pendapatanaslidesa/pembiayaan/${id}`
      );
      if (res.ok) {
        const json = await res.json();
        pembiayaan.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? true, // Fallback ke aktif:true jika tidak ada data
            }
          : null;
      } else {
        pembiayaan.findUnique.data = null;
      }
    },
  },
});

const PendapatanAsliDesa = proxy({
  ApbDesa,
  belanja,
  pembiayaan,
  pendapatan,
});

export default PendapatanAsliDesa;
