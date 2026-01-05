/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// Template form responden

const templateResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  jenisKelaminId: z.string().min(1, "Jenis kelamin harus diisi"),
  ratingId: z.string().min(1, "Rating harus diisi"),
  kelompokUmurId: z.string().min(1, "Kelompok umur harus diisi"),
});

const defaultFormResponden = {
  name: "",
  tanggal: "",
  jenisKelaminId: "",
  ratingId: "",
  kelompokUmurId: "",
};

const responden = proxy({
  create: {
    form: { ...defaultFormResponden },
    loading: false,
    async create() {
      const cek = templateResponden.safeParse(responden.create.form);
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }

      try {
        responden.create.loading = true;
        const res = await ApiFetch.api.landingpage.responden["create"].post(
          responden.create.form
        );
        if (res.status === 200) {
          toast.success("Responden berhasil ditambahkan");
          await responden.findMany.load();
        } else {
          toast.error(res.data?.message ?? "Gagal tambah responden");
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error("Terjadi kesalahan saat menambahkan responden");
      } finally {
        responden.create.loading = false;
      }
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
      responden.findMany.loading = true; // Use the full path to access the property
      responden.findMany.page = page;
      responden.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        
        const res = await ApiFetch.api.landingpage.responden["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          responden.findMany.data = res.data.data || [];
          responden.findMany.total = res.data.total || 0;
          responden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load responden:", res.data?.message);
          responden.findMany.data = [];
          responden.findMany.total = 0;
          responden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        responden.findMany.data = [];
        responden.findMany.total = 0;
        responden.findMany.totalPages = 1;
      } finally {
        responden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.RespondenGetPayload<{
      include: {
        jenisKelamin: true;
        rating: true;
        kelompokUmur: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/responden/${id}`);
        if (res.ok) {
          const data = await res.json();
          responden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          responden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        responden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormResponden },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        responden.update.loading = true;

        const response = await fetch(`/api/landingpage/responden/${id}`, {
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
            tanggal: data.tanggal,
            jenisKelaminId: data.jenisKelaminId,
            ratingId: data.ratingId,
            kelompokUmurId: data.kelompokUmurId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        responden.update.loading = false;
      }
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      const cek = templateResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/landingpage/responden/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            tanggal: this.form.tanggal,
            jenisKelaminId: this.form.jenisKelaminId,
            ratingId: this.form.ratingId,
            kelompokUmurId: this.form.kelompokUmurId,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await responden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data responden");
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        responden.delete.loading = true;

        const response = await fetch(`/api/landingpage/responden/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "responden berhasil dihapus");
          await responden.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus responden");
      } finally {
        responden.delete.loading = false;
      }
    },
  },
});

// Template form jenis kelamin responden
const templateJenisKelaminResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultFormJenisKelaminResponden = {
  name: "",
};

const jenisKelaminResponden = proxy({
  create: {
    form: { ...defaultFormJenisKelaminResponden },
    loading: false,
    async create() {
      const cek = templateJenisKelaminResponden.safeParse(
        jenisKelaminResponden.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }
      jenisKelaminResponden.create.loading = true;
      try {
        jenisKelaminResponden.create.loading = true;
        const res = await ApiFetch.api.landingpage.jeniskelaminresponden[
          "create"
        ].post(jenisKelaminResponden.create.form);
        if (res.status === 200) {
          toast.success("Jenis kelamin responden berhasil ditambahkan");
          await jenisKelaminResponden.findMany.load();
        } else {
          toast.error(
            res.data?.message ?? "Gagal tambah jenis kelamin responden"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan jenis kelamin responden"
        );
      } finally {
        jenisKelaminResponden.create.loading = false;
      }
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
      jenisKelaminResponden.findMany.loading = true; // Use the full path to access the property
      jenisKelaminResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.landingpage.jeniskelaminresponden[
          "findMany"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          jenisKelaminResponden.findMany.data = res.data.data || [];
          jenisKelaminResponden.findMany.total = res.data.total || 0;
          jenisKelaminResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load jenis kelamin responden:",
            res.data?.message
          );
          jenisKelaminResponden.findMany.data = [];
          jenisKelaminResponden.findMany.total = 0;
          jenisKelaminResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading jenis kelamin responden:", error);
        jenisKelaminResponden.findMany.data = [];
        jenisKelaminResponden.findMany.total = 0;
        jenisKelaminResponden.findMany.totalPages = 1;
      } finally {
        jenisKelaminResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenisKelaminRespondenGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/jeniskelaminresponden/${id}`);
        if (res.ok) {
          const data = await res.json();
          jenisKelaminResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenisKelaminResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading jenis kelamin responden:", error);
        jenisKelaminResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormJenisKelaminResponden },
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
      const cek = templateJenisKelaminResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/landingpage/jeniskelaminresponden/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await jenisKelaminResponden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data jenis kelamin responden");
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenisKelaminResponden.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/jeniskelaminresponden/del/${id}`,
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
            result.message || "jenis kelamin responden berhasil dihapus"
          );
          await jenisKelaminResponden.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus jenis kelamin responden"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenis kelamin responden");
      } finally {
        jenisKelaminResponden.delete.loading = false;
      }
    },
  },
});

// Template form pilihan rating responden

const templatePilihanRatingResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultFormPilihanRatingResponden = {
  name: "",
};

const pilihanRatingResponden = proxy({
  create: {
    form: { ...defaultFormPilihanRatingResponden },
    loading: false,
    async create() {
      const cek = templatePilihanRatingResponden.safeParse(
        pilihanRatingResponden.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }
      pilihanRatingResponden.create.loading = true;
      try {
        pilihanRatingResponden.create.loading = true;
        const res = await ApiFetch.api.landingpage.pilihanratingresponden[
          "create"
        ].post(pilihanRatingResponden.create.form);
        if (res.status === 200) {
          toast.success("Jenis kelamin responden berhasil ditambahkan");
          await pilihanRatingResponden.findMany.load();
        } else {
          toast.error(
            res.data?.message ?? "Gagal tambah jenis kelamin responden"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan jenis kelamin responden"
        );
      } finally {
        pilihanRatingResponden.create.loading = false;
      }
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
      pilihanRatingResponden.findMany.loading = true; // Use the full path to access the property
      pilihanRatingResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.landingpage.pilihanratingresponden[
          "findMany"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          pilihanRatingResponden.findMany.data = res.data.data || [];
          pilihanRatingResponden.findMany.total = res.data.total || 0;
          pilihanRatingResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load pilihan rating responden:",
            res.data?.message
          );
          pilihanRatingResponden.findMany.data = [];
          pilihanRatingResponden.findMany.total = 0;
          pilihanRatingResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pilihan rating responden:", error);
        pilihanRatingResponden.findMany.data = [];
        pilihanRatingResponden.findMany.total = 0;
        pilihanRatingResponden.findMany.totalPages = 1;
      } finally {
        pilihanRatingResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PilihanRatingRespondenGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/pilihanratingresponden/${id}`);
        if (res.ok) {
          const data = await res.json();
          pilihanRatingResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pilihanRatingResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading pilihan rating responden:", error);
        pilihanRatingResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormPilihanRatingResponden },
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
      const cek = templatePilihanRatingResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/landingpage/pilihanratingresponden/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await pilihanRatingResponden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data pilihan rating responden");
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pilihanRatingResponden.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/pilihanratingresponden/del/${id}`,
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
            result.message || "pilihan rating responden berhasil dihapus"
          );
          await pilihanRatingResponden.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus pilihan rating responden"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pilihan rating responden");
      } finally {
        pilihanRatingResponden.delete.loading = false;
      }
    },
  },
});

// Template form kelompok umur responden

const templateKelompokUmurResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultFormKelompokUmurResponden = {
  name: "",
};

const kelompokUmurResponden = proxy({
  create: {
    form: { ...defaultFormKelompokUmurResponden },
    loading: false,
    async create() {
      const cek = templateKelompokUmurResponden.safeParse(
        kelompokUmurResponden.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }
      kelompokUmurResponden.create.loading = true;
      try {
        kelompokUmurResponden.create.loading = true;
        const res = await ApiFetch.api.landingpage.umurresponden["create"].post(
          kelompokUmurResponden.create.form
        );
        if (res.status === 200) {
          toast.success("Kelompok umur responden berhasil ditambahkan");
          await kelompokUmurResponden.findMany.load();
        } else {
          toast.error(
            res.data?.message ?? "Gagal tambah kelompok umur responden"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan kelompok umur responden"
        );
      } finally {
        kelompokUmurResponden.create.loading = false;
      }
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
      kelompokUmurResponden.findMany.loading = true; // Use the full path to access the property
      kelompokUmurResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.landingpage.umurresponden[
          "findMany"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          kelompokUmurResponden.findMany.data = res.data.data || [];
          kelompokUmurResponden.findMany.total = res.data.total || 0;
          kelompokUmurResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load kelompok umur responden:",
            res.data?.message
          );
          kelompokUmurResponden.findMany.data = [];
          kelompokUmurResponden.findMany.total = 0;
          kelompokUmurResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading kelompok umur responden:", error);
        kelompokUmurResponden.findMany.data = [];
        kelompokUmurResponden.findMany.total = 0;
        kelompokUmurResponden.findMany.totalPages = 1;
      } finally {
        kelompokUmurResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.UmurRespondenGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/umurresponden/${id}`);
        if (res.ok) {
          const data = await res.json();
          kelompokUmurResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kelompokUmurResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading kelompok umur responden:", error);
        kelompokUmurResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormKelompokUmurResponden },
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
      const cek = templateKelompokUmurResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/landingpage/umurresponden/${id}`, {
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
        await kelompokUmurResponden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data kelompok umur responden");
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kelompokUmurResponden.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/umurresponden/del/${id}`,
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
            result.message || "kelompok umur responden berhasil dihapus"
          );
          await kelompokUmurResponden.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus kelompok umur responden"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kelompok umur responden");
      } finally {
        kelompokUmurResponden.delete.loading = false;
      }
    },
  },
});

const indeksKepuasanState = proxy({
    responden,
    kelompokUmurResponden,
    jenisKelaminResponden,
    pilihanRatingResponden
})

export default indeksKepuasanState