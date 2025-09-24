/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateSuratKeteranganForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
  image2Id: z.string().nonempty(),
});

const suratKeteranganForm = {
  name: "",
  deskripsi: "",
  imageId: "",
  image2Id: "",
};

const telunjukSaktiDesaForm = {
  name: "",
  deskripsi: "",
  link: "",
};

const templateTelunjukSaktiDesaForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

const templatePelayananPerizinanBerusaha = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  link: z.string().min(3, "Link minimal 3 karakter"),
});

type pelayananPerizinanBerusahaForm =
  Prisma.PelayananPerizinanBerusahaGetPayload<{
    select: {
      id: true;
      name: true;
      deskripsi: true;
      link: true;
    };
  }>;

const pelayananPerizinanBerusahaForm = {
  name: "",
  deskripsi: "",
  link: "",
};

const templatePelayananPendudukNonPermanen = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type pelayananPendudukNonPermanenForm =
  Prisma.PelayananPendudukNonPermanenGetPayload<{
    select: {
      id: true;
      name: true;
      deskripsi: true;
    };
  }>;

const pelayananPendudukNonPermanenForm = {
  name: "",
  deskripsi: "",
};

const templateAjukanForm = z.object({
  nama: z.string().min(1).max(5000),
  nik: z.string().min(1).max(5000),
  alamat: z.string().min(1).max(5000),
  nomorKk: z.string().min(1).max(5000),
  kategoriId: z.string().min(1).max(5000),
});

const defaultAjukanForm = {
  nama: "",
  nik: "",
  alamat: "",
  nomorKk: "",
  kategoriId: "",
};

const suratKeterangan = proxy({
  create: {
    form: { ...suratKeteranganForm },
    loading: false,
    async create() {
      const cek = templateSuratKeteranganForm.safeParse(
        suratKeterangan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        suratKeterangan.create.loading = true;
        const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan[
          "create"
        ].post(suratKeterangan.create.form);
        if (res.status === 200) {
          suratKeterangan.findMany.load();
          return toast.success("Surat Keterangan berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan surat keterangan");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        suratKeterangan.create.loading = false;
      }
    },
    resetForm() {
      suratKeterangan.create.form = { ...suratKeteranganForm };
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      suratKeterangan.findMany.loading = true; // Use the full path to access the property
      suratKeterangan.findMany.page = page;
      suratKeterangan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          suratKeterangan.findMany.data = res.data.data || [];
          suratKeterangan.findMany.total = res.data.total || 0;
          suratKeterangan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load surat keterangan:", res.data?.message);
          suratKeterangan.findMany.data = [];
          suratKeterangan.findMany.total = 0;
          suratKeterangan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading surat keterangan:", error);
        suratKeterangan.findMany.data = [];
        suratKeterangan.findMany.total = 0;
        suratKeterangan.findMany.totalPages = 1;
      } finally {
        suratKeterangan.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: null as Prisma.PelayananSuratKeteranganGetPayload<{
      omit: { isActive: true };
    }>[] | null,
    loading: false,
    load: async () => {
      suratKeterangan.findManyAll.loading = true;
      try {
        const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan["findManyAll"].get();

        if (res.status === 200 && res.data?.success) {
          suratKeterangan.findManyAll.data = res.data.data || [];
        } else {
          suratKeterangan.findManyAll.data = [];
          console.error("Failed to load surat keterangan all:", res.data?.message);
        }
      } catch (error) {
        console.error("Error loading surat keterangan all:", error);
        suratKeterangan.findManyAll.data = [];
      } finally {
        suratKeterangan.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PelayananSuratKeteranganGetPayload<{
      include: {
        image: true;
        image2: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          suratKeterangan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch surat keterangan:", res.statusText);
          suratKeterangan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching surat keterangan:", error);
        suratKeterangan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        suratKeterangan.delete.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success(result.message || "Surat Keterangan berhasil dihapus");
          await suratKeterangan.findMany.load(); // refresh list
        } else {
          toast.error(result.message || "Gagal menghapus surat keterangan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus surat keterangan");
      } finally {
        suratKeterangan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...suratKeteranganForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/${id}`,
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
            deskripsi: data.deskripsi,
            imageId: data.imageId || "",
            image2Id: data.image2Id || "",
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching surat keterangan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateSuratKeteranganForm.safeParse(
        suratKeterangan.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        suratKeterangan.edit.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
              image2Id: this.form.image2Id,
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
          toast.success(result.message || "Surat Keterangan berhasil diupdate");
          await suratKeterangan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate surat keterangan"
          );
        }
      } catch (error) {
        console.error("Error updating surat keterangan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update surat keterangan"
        );
        return false;
      } finally {
        suratKeterangan.edit.loading = false;
      }
    },
  },
});

const pelayananTelunjukSaktiDesa = proxy({
  create: {
    form: { ...telunjukSaktiDesaForm },
    loading: false,
    async create() {
      const cek = templateTelunjukSaktiDesaForm.safeParse(
        pelayananTelunjukSaktiDesa.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pelayananTelunjukSaktiDesa.create.loading = true;
        const res = await ApiFetch.api.desa.layanan.pelayanantelunjuksaktidesa[
          "create"
        ].post(pelayananTelunjukSaktiDesa.create.form);
        if (res.status === 200) {
          pelayananTelunjukSaktiDesa.findMany.load();
          return toast.success("Telunjuk Sakti Desa berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan telunjuk sakti desa");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pelayananTelunjukSaktiDesa.create.loading = false;
      }
    },
    resetForm() {
      pelayananTelunjukSaktiDesa.create.form = { ...telunjukSaktiDesaForm };
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      pelayananTelunjukSaktiDesa.findMany.loading = true; // Use the full path to access the property
      pelayananTelunjukSaktiDesa.findMany.page = page;
      pelayananTelunjukSaktiDesa.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.layanan.pelayanantelunjuksaktidesa[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pelayananTelunjukSaktiDesa.findMany.data = res.data.data || [];
          pelayananTelunjukSaktiDesa.findMany.total = res.data.total || 0;
          pelayananTelunjukSaktiDesa.findMany.totalPages =
            res.data.totalPages || 1;
        } else {
          console.error("Failed to load surat keterangan:", res.data?.message);
          pelayananTelunjukSaktiDesa.findMany.data = [];
          suratKeterangan.findMany.total = 0;
          suratKeterangan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading surat keterangan:", error);
        pelayananTelunjukSaktiDesa.findMany.data = [];
        pelayananTelunjukSaktiDesa.findMany.total = 0;
        pelayananTelunjukSaktiDesa.findMany.totalPages = 1;
      } finally {
        pelayananTelunjukSaktiDesa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PelayananTelunjukSaktiDesaGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pelayananTelunjukSaktiDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch telunjuk sakti desa:", res.statusText);
          pelayananTelunjukSaktiDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching telunjuk sakti desa:", error);
        pelayananTelunjukSaktiDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pelayananTelunjukSaktiDesa.delete.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success(
            result.message || "Telunjuk Sakti Desa berhasil dihapus"
          );
          await pelayananTelunjukSaktiDesa.findMany.load(); // refresh list
        } else {
          toast.error(result.message || "Gagal menghapus telunjuk sakti desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus telunjuk sakti desa");
      } finally {
        pelayananTelunjukSaktiDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...telunjukSaktiDesaForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/${id}`,
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
            deskripsi: data.deskripsi,
            link: data.link,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching telunjuk sakti desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateTelunjukSaktiDesaForm.safeParse(
        pelayananTelunjukSaktiDesa.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pelayananTelunjukSaktiDesa.edit.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              link: this.form.link,
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
          toast.success(
            result.message || "Telunjuk Sakti Desa berhasil diupdate"
          );
          await pelayananTelunjukSaktiDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate telunjuk sakti desa"
          );
        }
      } catch (error) {
        console.error("Error updating telunjuk sakti desa:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update telunjuk sakti desa"
        );
        return false;
      } finally {
        pelayananTelunjukSaktiDesa.edit.loading = false;
      }
    },
  },
});

const pelayananPerizinanBerusaha = proxy({
  findById: {
    data: null as pelayananPerizinanBerusahaForm | null,
    loading: false,
    initialize() {
      pelayananPerizinanBerusaha.findById.data = {
        id: "",
        name: "",
        deskripsi: "",
        link: "",
      } as pelayananPerizinanBerusahaForm;
    },
    async load(id: string) {
      try {
        pelayananPerizinanBerusaha.findById.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananperizinanberusaha/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pelayananPerizinanBerusaha.findById.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch pelayanan perizinan berusaha:",
            res.statusText
          );
          pelayananPerizinanBerusaha.findById.data = null;
        }
      } catch (error) {
        console.error("Error fetching pelayanan perizinan berusaha:", error);
        pelayananPerizinanBerusaha.findById.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...pelayananPerizinanBerusahaForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak boleh kosong");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayananperizinanberusaha/${id}`,
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
          pelayananPerizinanBerusaha.update.id = data.id;
          pelayananPerizinanBerusaha.update.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            link: data.link,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching pelayanan perizinan berusaha:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update(data: pelayananPerizinanBerusahaForm) {
      const cek = templatePelayananPerizinanBerusaha.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        pelayananPerizinanBerusaha.update.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananperizinanberusaha/${data.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (res.ok) {
          toast.success("Pelayanan perizinan berusaha berhasil diupdate");
          await pelayananPerizinanBerusaha.findById.load(data.id);
        } else {
          toast.error("Gagal mengupdate pelayanan perizinan berusaha");
        }
      } catch (error) {
        console.error("Error updating pelayanan perizinan berusaha:", error);
        toast.error(
          "Terjadi kesalahan saat mengupdate pelayanan perizinan berusaha"
        );
      } finally {
        pelayananPerizinanBerusaha.update.loading = false;
      }
    },
  },
});

const pelayananPendudukNonPermanen = proxy({
  findById: {
    data: null as pelayananPendudukNonPermanenForm | null,
    loading: false,
    initialize() {
      pelayananPendudukNonPermanen.findById.data = {
        id: "",
        name: "",
        deskripsi: "",
      } as pelayananPendudukNonPermanenForm;
    },
    async load(id: string) {
      try {
        pelayananPendudukNonPermanen.findById.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananpenduduknonpermanen/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pelayananPendudukNonPermanen.findById.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch pelayanan penduduk non permanen:",
            res.statusText
          );
          pelayananPendudukNonPermanen.findById.data = null;
        }
      } catch (error) {
        console.error("Error fetching pelayanan penduduk non permanen:", error);
        pelayananPendudukNonPermanen.findById.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...pelayananPendudukNonPermanenForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak boleh kosong");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayananpenduduknonpermanen/${id}`,
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
          pelayananPendudukNonPermanen.update.id = data.id;
          pelayananPendudukNonPermanen.update.form = {
            name: data.name,
            deskripsi: data.deskripsi,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching pelayanan penduduk non permanen:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update(data: pelayananPendudukNonPermanenForm) {
      const cek = templatePelayananPendudukNonPermanen.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        pelayananPendudukNonPermanen.update.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananpenduduknonpermanen/${data.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (res.ok) {
          toast.success("Pelayanan penduduk non permanen berhasil diupdate");
          await pelayananPendudukNonPermanen.findById.load(data.id);
        } else {
          toast.error("Gagal mengupdate pelayanan penduduk non permanen");
        }
      } catch (error) {
        console.error("Error updating pelayanan penduduk non permanen:", error);
        toast.error(
          "Terjadi kesalahan saat mengupdate pelayanan penduduk non permanen"
        );
      } finally {
        pelayananPendudukNonPermanen.update.loading = false;
      }
    },
  },
});

const ajukanPermohonan = proxy({
  create: {
    form: { ...defaultAjukanForm },
    loading: false,
    async create() {
      const cek = templateAjukanForm.safeParse(
        ajukanPermohonan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        ajukanPermohonan.create.loading = true;
        const res = await ApiFetch.api.desa.ajukanpermohonan[
          "create"
        ].post(ajukanPermohonan.create.form);
        if (res.status === 200) {
          ajukanPermohonan.findMany.load();
          return toast.success("Ajukan permohonan berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan ajukan permohonan");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        ajukanPermohonan.create.loading = false;
      }
    },
    resetForm() {
      ajukanPermohonan.create.form = { ...defaultAjukanForm };
    },
  },
  findMany: {
    data: null as Prisma.AjukanPermohonanGetPayload<{
      include: {
        kategori: true;
      };
    }>[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      ajukanPermohonan.findMany.loading = true; // Use the full path to access the property
      ajukanPermohonan.findMany.page = page;
      ajukanPermohonan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.ajukanpermohonan[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          ajukanPermohonan.findMany.data = res.data.data || [];
          ajukanPermohonan.findMany.total = res.data.total || 0;
          ajukanPermohonan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load ajukan permohonan:", res.data?.message);
          ajukanPermohonan.findMany.data = [];
          ajukanPermohonan.findMany.total = 0;
          ajukanPermohonan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading ajukan permohonan:", error);
        ajukanPermohonan.findMany.data = [];
        ajukanPermohonan.findMany.total = 0;
        ajukanPermohonan.findMany.totalPages = 1;
      } finally {
        ajukanPermohonan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.AjukanPermohonanGetPayload<{
      include: {
        kategori: true;
      }
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/desa/ajukanpermohonan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          ajukanPermohonan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch ajukan permohonan:", res.statusText);
          ajukanPermohonan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching ajukan permohonan:", error);
        ajukanPermohonan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        ajukanPermohonan.delete.loading = true;
        const response = await fetch(
          `/api/desa/ajukanpermohonan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success(result.message || "Ajukan permohonan berhasil dihapus");
          await ajukanPermohonan.findMany.load(); // refresh list
        } else {
          toast.error(result.message || "Gagal menghapus ajukan permohonan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus ajukan permohonan");
      } finally {
        ajukanPermohonan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultAjukanForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/ajukanpermohonan/${id}`,
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
            nama: data.nama,
            nik: data.nik,
            alamat: data.alamat,
            nomorKk: data.nomorKk,
            kategoriId: data.kategoriId,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching ajukan permohonan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateAjukanForm.safeParse(
        ajukanPermohonan.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        ajukanPermohonan.edit.loading = true;
        const response = await fetch(
          `/api/desa/ajukanpermohonan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              nik: this.form.nik,
              alamat: this.form.alamat,
              nomorKk: this.form.nomorKk,
              kategoriId: this.form.kategoriId,
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
          toast.success(result.message || "Ajukan permohonan berhasil diupdate");
          await ajukanPermohonan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate ajukan permohonan"
          );
        }
      } catch (error) {
        console.error("Error updating ajukan permohonan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update ajukan permohonan"
        );
        return false;
      } finally {
        ajukanPermohonan.edit.loading = false;
      }
    },
  },
});

const stateLayananDesa = proxy({
  suratKeterangan,
  pelayananPerizinanBerusaha,
  pelayananTelunjukSaktiDesa,
  pelayananPendudukNonPermanen,
  ajukanPermohonan,
});

export default stateLayananDesa;
