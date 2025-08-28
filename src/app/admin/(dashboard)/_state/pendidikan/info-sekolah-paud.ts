/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// ========================================= JENJANG PENDIDIKAN ========================================= //
const jenjangPendidikanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const jenjangPendidikanDefaultForm = {
  nama: "",
};

const jenjangPendidikan = proxy({
  create: {
    form: { ...jenjangPendidikanDefaultForm },
    loading: false,
    async create() {
      const cek = jenjangPendidikanForm.safeParse(
        jenjangPendidikan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jenjangPendidikan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.infosekolahpaud.jenjangpendidikan[
            "create"
          ].post(jenjangPendidikan.create.form);
        if (res.status === 200) {
          jenjangPendidikan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        jenjangPendidikan.create.loading = false;
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
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      jenjangPendidikan.findMany.loading = true; // Use the full path to access the property
      jenjangPendidikan.findMany.page = page;
      jenjangPendidikan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res =
          await ApiFetch.api.pendidikan.infosekolahpaud.jenjangpendidikan[
            "find-many"
          ].get({
            query,
          });

        if (res.status === 200 && res.data?.success) {
          jenjangPendidikan.findMany.data = res.data.data || [];
          jenjangPendidikan.findMany.total = res.data.total || 0;
          jenjangPendidikan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load jenjang pendidikan:",
            res.data?.message
          );
          jenjangPendidikan.findMany.data = [];
          jenjangPendidikan.findMany.total = 0;
          jenjangPendidikan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading jenjang pendidikan:", error);
        jenjangPendidikan.findMany.data = [];
        jenjangPendidikan.findMany.total = 0;
        jenjangPendidikan.findMany.totalPages = 1;
      } finally {
        jenjangPendidikan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenjangPendidikanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jenjangPendidikan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenjangPendidikan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        jenjangPendidikan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenjangPendidikan.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/del/${id}`,
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
            result.message || "jenjang pendidikan berhasil dihapus"
          );
          await jenjangPendidikan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus jenjang pendidikan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenjang pendidikan");
      } finally {
        jenjangPendidikan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...jenjangPendidikanDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/${id}`,
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
        console.error("Error loading jenjang pendidikan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = jenjangPendidikanForm.safeParse(jenjangPendidikan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        jenjangPendidikan.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/${jenjangPendidikan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: jenjangPendidikan.edit.form.nama,
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
                `Gagal mengupdate jenjang pendidikan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui jenjang pendidikan"
            );
            await jenjangPendidikan.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate jenjang pendidikan"
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
        console.error("Error updating jenjang pendidikan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate jenjang pendidikan"
        );
        return false;
      } finally {
        jenjangPendidikan.edit.loading = false;
      }
    },
    reset() {
      jenjangPendidikan.edit.id = "";
      jenjangPendidikan.edit.form = { ...jenjangPendidikanDefaultForm };
    },
  },
});

// ========================================= LEMBAGA PENDIDIKAN ========================================= //

const lembagaPendidikanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  jenjangId: z.string().min(1, "Jenjang pendidikan minimal 1"),
});

const lembagaPendidikanDefaultForm = {
  nama: "",
  jenjangId: "",
};

const lembagaPendidikan = proxy({
  create: {
    form: { ...lembagaPendidikanDefaultForm },
    loading: false,
    async create() {
      const cek = lembagaPendidikanForm.safeParse(
        lembagaPendidikan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        lembagaPendidikan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan[
            "create"
          ].post(lembagaPendidikan.create.form);
        if (res.status === 200) {
          lembagaPendidikan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        lembagaPendidikan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.LembagaGetPayload<{
        include: {
          jenjangPendidikan: true;
          siswa: true;
          pengajar: true;
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", jenjangPendidikan = "") => {
      lembagaPendidikan.findMany.loading = true;
      lembagaPendidikan.findMany.page = page;
      lembagaPendidikan.findMany.search = search;
      
      try {
        const query: any = { 
          page, 
          limit, 
          ...(search && { search }),
          ...(jenjangPendidikan && { jenjangPendidikanId: jenjangPendidikan })
        };
        
        console.log('Fetching lembaga with query:', query);
        
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan["find-many"].get({ query });
        
        console.log('API Response:', res);

        if (res.status === 200 && res.data?.success) {
          lembagaPendidikan.findMany.data = Array.isArray(res.data.data) ? res.data.data : [];
          lembagaPendidikan.findMany.total = typeof res.data.total === 'number' ? res.data.total : 0;
          lembagaPendidikan.findMany.totalPages = typeof res.data.totalPages === 'number' ? res.data.totalPages : 1;
          console.log('Successfully loaded lembaga data:', {
            count: lembagaPendidikan.findMany.data.length,
            total: lembagaPendidikan.findMany.total,
            totalPages: lembagaPendidikan.findMany.totalPages
          });
        } else {
          console.error(
            "Failed to load lembaga pendidikan:",
            res.data?.message || 'No error message provided'
          );
          throw new Error(res.data?.message || 'Failed to load lembaga pendidikan');
        }
      } catch (error) {
        console.error("Error loading lembaga pendidikan:", error);
        lembagaPendidikan.findMany.data = [];
        lembagaPendidikan.findMany.total = 0;
        lembagaPendidikan.findMany.totalPages = 1;
      } finally {
        lembagaPendidikan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.LembagaGetPayload<{
      include: {
        jenjangPendidikan: true;
        siswa: true;
        pengajar: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          lembagaPendidikan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          lembagaPendidikan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        lembagaPendidikan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        lembagaPendidikan.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/del/${id}`,
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
            result.message || "lembaga pendidikan berhasil dihapus"
          );
          await lembagaPendidikan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus lembaga pendidikan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus lembaga pendidikan");
      } finally {
        lembagaPendidikan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...lembagaPendidikanDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/${id}`,
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
            jenjangId: data.jenjangId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading lembaga pendidikan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = lembagaPendidikanForm.safeParse(lembagaPendidikan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        lembagaPendidikan.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/${lembagaPendidikan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: lembagaPendidikan.edit.form.nama,
              jenjangId: lembagaPendidikan.edit.form.jenjangId,
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
                `Gagal mengupdate lembaga pendidikan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui lembaga pendidikan"
            );
            await lembagaPendidikan.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate lembaga pendidikan"
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
        console.error("Error updating lembaga pendidikan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate lembaga pendidikan"
        );
        return false;
      } finally {
        lembagaPendidikan.edit.loading = false;
      }
    },
    reset() {
      lembagaPendidikan.edit.id = "";
      lembagaPendidikan.edit.form = { ...lembagaPendidikanDefaultForm };
    },
  },
});

// ========================================= SISWA ========================================= //

const siswaForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  lembagaId: z.string().min(1, "lembaga pendidikan minimal 1"),
});

const siswaDefaultForm = {
  nama: "",
  lembagaId: "",
};

const siswa = proxy({
  create: {
    form: { ...siswaDefaultForm },
    loading: false,
    async create() {
      const cek = siswaForm.safeParse(siswa.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        siswa.create.loading = true;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.siswa[
          "create"
        ].post(siswa.create.form);
        if (res.status === 200) {
          siswa.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        siswa.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.SiswaGetPayload<{
        include: {
          lembaga: {
            include: {
              jenjangPendidikan: true;
            };
          };
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    jenjangPendidikan: "",
    load: async (page = 1, limit = 10, search = "", jenjangPendidikan = "") => {
      siswa.findMany.loading = true;
      siswa.findMany.page = page;
      siswa.findMany.search = search;
      siswa.findMany.jenjangPendidikan = jenjangPendidikan;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (jenjangPendidikan) query.jenjangPendidikanName = jenjangPendidikan;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.siswa[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          siswa.findMany.data = res.data.data || [];
          siswa.findMany.total = res.data.total || 0;
          siswa.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load siswa:",
            res.data?.message
          );
          siswa.findMany.data = [];
          siswa.findMany.total = 0;
          siswa.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading siswa:", error);
        siswa.findMany.data = [];
        siswa.findMany.total = 0;
        siswa.findMany.totalPages = 1;
      } finally {
        siswa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.SiswaGetPayload<{
      include: {
        lembaga: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/pendidikan/infosekolahpaud/siswa/${id}`);
        if (res.ok) {
          const data = await res.json();
          siswa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          siswa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        siswa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        siswa.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/siswa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "siswa berhasil dihapus");
          await siswa.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus siswa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus siswa");
      } finally {
        siswa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...siswaDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/siswa/${id}`,
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
            lembagaId: data.lembagaId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading siswa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = siswaForm.safeParse(siswa.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        siswa.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/siswa/${siswa.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: siswa.edit.form.nama,
              lembagaId: siswa.edit.form.lembagaId,
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
              result?.message || `Gagal mengupdate siswa (${response.status})`
            );
          }

          if (result.success) {
            toast.success(result.message || "Berhasil memperbarui siswa");
            await siswa.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate siswa");
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
        console.error("Error updating siswa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate siswa"
        );
        return false;
      } finally {
        siswa.edit.loading = false;
      }
    },
    reset() {
      siswa.edit.id = "";
      siswa.edit.form = { ...siswaDefaultForm };
    },
  },
});

// ========================================= PENGAJAR ========================================= //

const pengajarForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  lembagaId: z.string().min(1, "lembaga pendidikan minimal 1"),
});

const pengajarDefaultForm = {
  nama: "",
  lembagaId: "",
};

const pengajar = proxy({
  create: {
    form: { ...pengajarDefaultForm },
    loading: false,
    async create() {
      const cek = pengajarForm.safeParse(pengajar.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pengajar.create.loading = true;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.pengajar[
          "create"
        ].post(pengajar.create.form);
        if (res.status === 200) {
          pengajar.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        pengajar.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.PengajarGetPayload<{
        include: {
          lembaga: {
            include: {
              jenjangPendidikan: true
            }
          }
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    jenjangPendidikan: "",
    load: async (page = 1, limit = 10, search = "", jenjangPendidikan = "") => {
      // Change to arrow function
      pengajar.findMany.loading = true; // Use the full path to access the property
      pengajar.findMany.page = page;
      pengajar.findMany.search = search;
      pengajar.findMany.jenjangPendidikan = jenjangPendidikan;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (jenjangPendidikan) query.jenjangPendidikanId = jenjangPendidikan;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.pengajar[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pengajar.findMany.data = res.data.data || [];
          pengajar.findMany.total = res.data.total || 0;
          pengajar.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load pengajar:",
            res.data?.message
          );
          pengajar.findMany.data = [];
          pengajar.findMany.total = 0;
          pengajar.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pengajar:", error);
        pengajar.findMany.data = [];
        pengajar.findMany.total = 0;
        pengajar.findMany.totalPages = 1;
      } finally {
        pengajar.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PengajarGetPayload<{
      include: {
        lembaga: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pengajar.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pengajar.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        pengajar.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengajar.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "pengajar berhasil dihapus");
          await pengajar.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pengajar");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengajar");
      } finally {
        pengajar.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...pengajarDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/${id}`,
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
            lembagaId: data.lembagaId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading siswa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = pengajarForm.safeParse(pengajar.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pengajar.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/${pengajar.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: pengajar.edit.form.nama,
              lembagaId: pengajar.edit.form.lembagaId,
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
                `Gagal mengupdate pengajar (${response.status})`
            );
          }

          if (result.success) {
            toast.success(result.message || "Berhasil memperbarui pengajar");
            await pengajar.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate pengajar");
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
        console.error("Error updating pengajar:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pengajar"
        );
        return false;
      } finally {
        pengajar.edit.loading = false;
      }
    },
    reset() {
      pengajar.edit.id = "";
      pengajar.edit.form = { ...pengajarDefaultForm };
    },
  },
});

const infoSekolahPaud = proxy({
  jenjangPendidikan,
  lembagaPendidikan,
  siswa,
  pengajar,
});

export default infoSekolahPaud;
