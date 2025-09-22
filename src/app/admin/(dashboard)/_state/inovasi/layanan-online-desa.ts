/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// ========================================= ADMINISTRASI ONLINE ========================================= //
const templateAdministrasiOnlineForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  alamat: z.string().min(1, "Alamat minimal 1 karakter"),
  nomorTelepon: z.string().min(1, "Nomor telepon minimal 1 karakter"),
  jenisLayananId: z.string().min(1, "Jenis layanan minimal 1 karakter"),
});

const defaultAdministrasiOnlineForm = {
  name: "",
  alamat: "",
  nomorTelepon: "",
  jenisLayananId: "",
};

const administrasiOnline = proxy({
  create: {
    form: { ...defaultAdministrasiOnlineForm },
    loading: false,
    async create() {
      const cek = templateAdministrasiOnlineForm.safeParse(
        administrasiOnline.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        administrasiOnline.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline[
            "create"
          ].post(administrasiOnline.create.form);
        if (res.status === 200) {
          administrasiOnline.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        administrasiOnline.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.AdministrasiOnlineGetPayload<{
        include: {
          jenisLayanan: true;
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    async load(page = 1, limit = 10, search = "") {
      administrasiOnline.findMany.loading = true;
      administrasiOnline.findMany.page = page;
      administrasiOnline.findMany.search = search;
      try {
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline[
            "find-many"
          ].get({
            query: {
              page,
              limit,
              search,
            },
          });

        if (res.status === 200 && res.data?.success) {
          administrasiOnline.findMany.data = res.data.data ?? [];
          administrasiOnline.findMany.totalPages = res.data.totalPages ?? 1;
        }
      } catch (err) {
        console.error("Gagal fetch administrasi online paginated:", err);
      } finally {
        administrasiOnline.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.AdministrasiOnlineGetPayload<{
      include: {
        jenisLayanan: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          administrasiOnline.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch administrasi online:", res.statusText);
          administrasiOnline.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching administrasi online:", error);
        administrasiOnline.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        administrasiOnline.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Administrasi online berhasil dihapus"
          );
          await administrasiOnline.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus administrasi online");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus administrasi online");
      } finally {
        administrasiOnline.delete.loading = false;
      }
    },
  },
});

// ========================================= JENIS LAYANAN ========================================= //
const templateJenisLayananForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
});

const defaultJenisLayananForm = {
  nama: "",
  deskripsi: "",
};

const jenisLayanan = proxy({
  create: {
    form: { ...defaultJenisLayananForm },
    loading: false,
    async create() {
      const cek = templateJenisLayananForm.safeParse(jenisLayanan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jenisLayanan.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline.jenislayanan[
            "create"
          ].post(jenisLayanan.create.form);
        if (res.status === 200) {
          jenisLayanan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        jenisLayanan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      nama: string;
      deskripsi: string;
    }> | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      jenisLayanan.findMany.loading = true; // ✅ Akses langsung via nama path
      jenisLayanan.findMany.page = page;
      jenisLayanan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline.jenislayanan[
            "find-many"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          jenisLayanan.findMany.data = res.data.data ?? [];
          jenisLayanan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          jenisLayanan.findMany.data = [];
          jenisLayanan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch jenis layanan paginated:", err);
        jenisLayanan.findMany.data = [];
        jenisLayanan.findMany.totalPages = 1;
      } finally {
        jenisLayanan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenisLayananGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jenisLayanan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenisLayanan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        jenisLayanan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenisLayanan.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Jenis layanan berhasil dihapus");
          await jenisLayanan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus jenis layanan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenis layanan");
      } finally {
        jenisLayanan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultJenisLayananForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/${id}`,
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
            deskripsi: data.deskripsi,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading jenis layanan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateJenisLayananForm.safeParse(jenisLayanan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        jenisLayanan.edit.loading = true;
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/${jenisLayanan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: jenisLayanan.edit.form.nama,
              deskripsi: jenisLayanan.edit.form.deskripsi,
            }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate jenis layanan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui jenis layanan"
            );
            await jenisLayanan.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate jenis layanan");
          }
        } catch (error) {
          // If JSON parsing fails, try to get the response text for better error messages
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating jenis layanan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate jenis layanan"
        );
        return false;
      } finally {
        jenisLayanan.edit.loading = false;
      }
    },
    reset() {
      jenisLayanan.edit.id = "";
      jenisLayanan.edit.form = { ...defaultJenisLayananForm };
    },
  },
});

// ========================================= PENGADUAN MASYARAKAT ========================================= //
const templatePengaduanMasyarakatForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  email: z.string().min(1, "Alamat minimal 1 karakter"),
  nomorTelepon: z.string().min(1, "Nomor telepon minimal 1 karakter"),
  nik: z.string().min(1, "NIK minimal 1 karakter"),
  judulPengaduan: z.string().min(1, "Judul pengaduan minimal 1 karakter"),
  lokasiKejadian: z.string().min(1, "Lokasi kejadian minimal 1 karakter"),
  deskripsiPengaduan: z
    .string()
    .min(1, "Deskripsi pengaduan minimal 1 karakter"),
  jenisPengaduanId: z.string().min(1, "Jenis pengaduan minimal 1 karakter"),
  imageId: z.string().min(1, "Image minimal 1 karakter"),
});

const defaultPengaduanMasyarakatForm = {
  name: "",
  email: "",
  nomorTelepon: "",
  nik: "",
  judulPengaduan: "",
  lokasiKejadian: "",
  deskripsiPengaduan: "",
  jenisPengaduanId: "",
  imageId: "",
};

const pengaduanMasyarakat = proxy({
  create: {
    form: { ...defaultPengaduanMasyarakatForm },
    loading: false,
    async create() {
      const cek = templatePengaduanMasyarakatForm.safeParse(
        pengaduanMasyarakat.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pengaduanMasyarakat.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat[
            "create"
          ].post(pengaduanMasyarakat.create.form);
        if (res.status === 200) {
          pengaduanMasyarakat.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        pengaduanMasyarakat.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.PengaduanMasyarakatGetPayload<{
        include: {
          jenisPengaduan: true;
          image: true;
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pengaduanMasyarakat.findMany.loading = true; // ✅ Akses langsung via nama path
      pengaduanMasyarakat.findMany.page = page;
      pengaduanMasyarakat.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat[
            "find-many"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pengaduanMasyarakat.findMany.data = res.data.data ?? [];
          pengaduanMasyarakat.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          pengaduanMasyarakat.findMany.data = [];
          pengaduanMasyarakat.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch pengaduan masyarakat paginated:", err);
        pengaduanMasyarakat.findMany.data = [];
        pengaduanMasyarakat.findMany.totalPages = 1;
      } finally {
        pengaduanMasyarakat.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PengaduanMasyarakatGetPayload<{
      include: {
        jenisPengaduan: true;
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pengaduanMasyarakat.findUnique.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch pengaduan masyarakat:",
            res.statusText
          );
          pengaduanMasyarakat.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching pengaduan masyarakat:", error);
        pengaduanMasyarakat.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengaduanMasyarakat.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Pengaduan masyarakat berhasil dihapus"
          );
          await pengaduanMasyarakat.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus pengaduan masyarakat"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengaduan masyarakat");
      } finally {
        pengaduanMasyarakat.delete.loading = false;
      }
    },
  },
});
// ========================================= JENIS PENGADUAN ========================================= //
const templateJenisPengaduanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const defaultJenisPengaduanForm = {
  nama: "",
};

const jenisPengaduan = proxy({
  create: {
    form: { ...defaultJenisPengaduanForm },
    loading: false,
    async create() {
      const cek = templateJenisPengaduanForm.safeParse(
        jenisPengaduan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jenisPengaduan.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat.jenispengaduan[
            "create"
          ].post(jenisPengaduan.create.form);
        if (res.status === 200) {
          jenisPengaduan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        jenisPengaduan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      nama: string;
    }> | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      jenisPengaduan.findMany.loading = true; // ✅ Akses langsung via nama path
      jenisPengaduan.findMany.page = page;
      jenisPengaduan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat.jenispengaduan[
            "find-many"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          jenisPengaduan.findMany.data = res.data.data ?? [];
          jenisPengaduan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          jenisPengaduan.findMany.data = [];
          jenisPengaduan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch jenis pengaduan paginated:", err);
        jenisPengaduan.findMany.data = [];
        jenisPengaduan.findMany.totalPages = 1;
      } finally {
        jenisPengaduan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenisPengaduanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jenisPengaduan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenisPengaduan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        jenisPengaduan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenisPengaduan.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Jenis pengduan berhasil dihapus");
          await jenisPengaduan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus jenis pengaduan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenis pengaduan");
      } finally {
        jenisPengaduan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultJenisPengaduanForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/${id}`,
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading jenis pengaduan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateJenisPengaduanForm.safeParse(
        jenisPengaduan.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        jenisPengaduan.edit.loading = true;
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/${jenisPengaduan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: jenisPengaduan.edit.form.nama,
            }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate jenis pengaduan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui jenis pengaduan"
            );
            await jenisPengaduan.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate jenis pengaduan"
            );
          }
        } catch (error) {
          // If JSON parsing fails, try to get the response text for better error messages
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating jenis pengaduan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate jenis pengaduan"
        );
        return false;
      } finally {
        jenisPengaduan.edit.loading = false;
      }
    },
    reset() {
      jenisPengaduan.edit.id = "";
      jenisPengaduan.edit.form = { ...defaultJenisPengaduanForm };
    },
  },
});

const layananonlineDesa = proxy({
  administrasiOnline,
  jenisLayanan,
  pengaduanMasyarakat,
  jenisPengaduan,
});

export default layananonlineDesa;
