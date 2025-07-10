/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateApbDesa = z.object({
  tahun: z.number(),
  pendapatanId: z.string(),
  belanjaId: z.string(),
  pembiayaanId: z.string(),
});

const ApbDesaDefaultForm = {
  tahun: 0,
  pendapatanId: "",
  belanjaId: "",
  pembiayaanId: "",
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
    data: [] as Array<{
      id: string;
      tahun: number;
      pendapatanId: string;
      belanjaId: string;
      pembiayaanId: string;
    }>,
    loading: false,
    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.apbdesa[
          "find-many"
        ].get();
        if (res.status === 200) {
          this.data = res.data?.data ?? [];
        } else {
          toast.error(res.data?.message || "Gagal mengambil APB Desa");
        }
      } catch (error) {
        console.error("Find many error:", error);
        toast.error("Gagal mengambil APB Desa");
      } finally {
        this.loading = false;
      }
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
        const data = await response.json();
        this.id = id;
        this.form = data;
      } catch (error) {
        console.error("Load error:", error);
        toast.error("Gagal mengambil APB Desa");
      }
    },
    async update() {
      const cek = templateApbDesa.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        this.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/apbdesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tahun: this.form.tahun,
              pendapatanId: this.form.pendapatanId,
              belanjaId: this.form.belanjaId,
              pembiayaanId: this.form.pembiayaanId,
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
          toast.success("Berhasil update APB Desa");
          await ApbDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate APB Desa");
        }
      } catch (error) {
        console.error("Error updating APB Desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate APB Desa"
        );
        return false;
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
      if (!id) return toast.warn("ID tidak valid");

      try {
        ApbDesa.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/apbdesa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "APB Desa berhasil dihapus");
          await ApbDesa.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus APB Desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus APB Desa");
      } finally {
        ApbDesa.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as
      | (Prisma.ApbDesaGetPayload<{
          include: { pendapatan: true; belanja: true; pembiayaan: true };
        }> & { isActive: boolean })
      | null,
    async load(id: string) {
      const res = await fetch(`/api/ekonomi/pendapatanaslidesa/apbdesa/${id}`);
      if (res.ok) {
        const json = await res.json();
        ApbDesa.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? json.data.aktif ?? true, // Fallback ke aktif:true jika tidak ada data
            }
          : null;
      } else {
        ApbDesa.findUnique.data = null;
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
    total: 0,
    loading: false,
    load: async (page = 1, limit = 10) => {
      // Change to arrow function
      pendapatan.findMany.loading = true; // Use the full path to access the property
      pendapatan.findMany.page = page;
      try {
        const res =
          await ApiFetch.api.ekonomi.pendapatanaslidesa.pendapatanasli[
            "find-many"
          ].get({
            query: { page, limit },
          });

        if (res.status === 200 && res.data?.success) {
          pendapatan.findMany.data = res.data.data || [];
          pendapatan.findMany.total = res.data.total || 0;
          pendapatan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load pendapatan:", res.data?.message);
          pendapatan.findMany.data = [];
          pendapatan.findMany.total = 0;
          pendapatan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pendapatan:", error);
        pendapatan.findMany.data = [];
        pendapatan.findMany.total = 0;
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
        const response = await fetch(`/api/ekonomi/pendapatanaslidesa/pendapatanasli/${id}`, {
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
        const response = await fetch(`/api/ekonomi/pendapatanaslidesa/pendapatanasli/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            value: this.form.value,
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
    loading: false,
    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.belanja[
          "find-many"
        ].get();
        if (res.status === 200) {
          this.data = res.data?.data ?? [];
        } else {
          toast.error(res.data?.message || "Gagal mengambil Belanja");
        }
      } catch (error) {
        console.error("Find many error:", error);
        toast.error("Gagal mengambil Belanja");
      } finally {
        this.loading = false;
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
          throw new Error("Gagal mengambil Belanja");
        }
        const data = await response.json();
        this.id = id;
        this.form = data;
      } catch (error) {
        console.error("Load error:", error);
        toast.error("Gagal mengambil Belanja");
      }
    },
    async update() {
      const cek = templateBelanja.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        this.loading = true;
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
          toast.success("Berhasil update Belanja");
          await belanja.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate Belanja");
        }
      } catch (error) {
        console.error("Error updating Belanja:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate Belanja"
        );
        return false;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.id = "";
      this.form = { ...BelanjaDefaultForm };
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
    loading: false,
    async load() {
      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pembiayaan[
          "find-many"
        ].get();
        if (res.status === 200) {
          this.data = res.data?.data ?? [];
        } else {
          toast.error(res.data?.message || "Gagal mengambil Pembiayaan");
        }
      } catch (error) {
        console.error("Find many error:", error);
        toast.error("Gagal mengambil Pembiayaan");
      } finally {
        this.loading = false;
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
          throw new Error("Gagal mengambil Pembiayaan");
        }
        const data = await response.json();
        this.id = id;
        this.form = data;
      } catch (error) {
        console.error("Load error:", error);
        toast.error("Gagal mengambil Pembiayaan");
      }
    },
    async update() {
      const cek = templatePembiayaan.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        this.loading = true;
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
          toast.success("Berhasil update Pembiayaan");
          await pembiayaan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate Pembiayaan");
        }
      } catch (error) {
        console.error("Error updating Pembiayaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate Pembiayaan"
        );
        return false;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.id = "";
      this.form = { ...PembiayaanDefaultForm };
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
