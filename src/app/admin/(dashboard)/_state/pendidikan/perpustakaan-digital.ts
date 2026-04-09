/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDataPerpustakaan = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  imageId: z.string().min(1, "Image ID harus diisi"),
  kategoriId: z.string().min(1, "Kategori ID harus diisi"),
});

const defaultDataPerpustakaan = {
  judul: "",
  deskripsi: "",
  imageId: "",
  kategoriId: "",
};

const dataPerpustakaan = proxy({
  create: {
    form: { ...defaultDataPerpustakaan },
    loading: false,
    async create() {
      const cek = templateDataPerpustakaan.safeParse(
        dataPerpustakaan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        dataPerpustakaan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "create"
          ].post(dataPerpustakaan.create.form);
        if (res.status === 200) {
          dataPerpustakaan.findMany.load();
          return toast.success("Data Data Perpustakaan Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        dataPerpustakaan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DataPerpustakaanGetPayload<{
          include: {
            image: true;
            kategori: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", kategori = "") => {
      const startTime = Date.now();
      dataPerpustakaan.findMany.loading = true; // ✅ Akses langsung via nama path
      dataPerpustakaan.findMany.page = page;
      dataPerpustakaan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "findMany"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          dataPerpustakaan.findMany.data = res.data.data ?? [];
          dataPerpustakaan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          dataPerpustakaan.findMany.data = [];
          dataPerpustakaan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch data perpustakaan paginated:", err);
        dataPerpustakaan.findMany.data = [];
        dataPerpustakaan.findMany.totalPages = 1;
      } finally {
        // pastikan minimal 300ms sebelum loading = false (biar UX smooth)
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          dataPerpustakaan.findMany.loading = false;
        }, delay);
      }
    },
  },
  findManyAll: {
    data: null as
      | Prisma.DataPerpustakaanGetPayload<{
          include: {
            image: true;
            kategori: true;
          };
        }>[]
      | null,
    loading: false,
    search: "",
    load: async (search = "", kategori = "") => {
      dataPerpustakaan.findMany.loading = true; // ✅ Akses langsung via nama path
      dataPerpustakaan.findMany.search = search;

      try {
        const query: any = {};
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "findManyAll"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          dataPerpustakaan.findManyAll.data = res.data.data ?? [];
        } else {
          dataPerpustakaan.findManyAll.data = [];
        }
      } catch (err) {
        console.error("Gagal fetch data perpustakaan paginated:", err);
        dataPerpustakaan.findManyAll.data = [];
      } finally {
        dataPerpustakaan.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DataPerpustakaanGetPayload<{
      include: {
        kategori: true;
        image: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          dataPerpustakaan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          dataPerpustakaan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        dataPerpustakaan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        dataPerpustakaan.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data Perpustakaan berhasil dihapus");
          await dataPerpustakaan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Data Perpustakaan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Perpustakaan");
      } finally {
        dataPerpustakaan.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultDataPerpustakaan },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${id}`,
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
            kategoriId: data.kategoriId,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading perpustakaan digital:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateDataPerpustakaan.safeParse(
        dataPerpustakaan.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        dataPerpustakaan.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
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
          toast.success("Berhasil update data perpustakaan digital");
          await dataPerpustakaan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data perpustakaan digital"
          );
        }
      } catch (error) {
        console.error("Error updating data perpustakaan digital:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data perpustakaan digital"
        );
        return false;
      } finally {
        dataPerpustakaan.update.loading = false;
      }
    },
    reset() {
      dataPerpustakaan.update.id = "";
      dataPerpustakaan.update.form = { ...defaultDataPerpustakaan };
    },
  },
});

const templateKategoriBuku = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriBuku = {
  name: "",
};

const kategoriBuku = proxy({
  create: {
    form: { ...defaultKategoriBuku },
    loading: false,
    async create() {
      const cek = templateKategoriBuku.safeParse(kategoriBuku.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriBuku.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
            "create"
          ].post(kategoriBuku.create.form);
        if (res.status === 200) {
          kategoriBuku.findMany.load();
          return toast.success("Data Kategori Buku Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        kategoriBuku.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriBuku.findMany.loading = true; // ✅ Akses langsung via nama path
      kategoriBuku.findMany.page = page;
      kategoriBuku.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
            "findMany"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kategoriBuku.findMany.data = res.data.data ?? [];
          kategoriBuku.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriBuku.findMany.data = [];
          kategoriBuku.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch data kategori buku paginated:", err);
        kategoriBuku.findMany.data = [];
        kategoriBuku.findMany.totalPages = 1;
      } finally {
        kategoriBuku.findMany.loading = false;
      }
    },
  },
  findManyAll: {
      data: [] as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
      loading: false,
      search: "",
      load: async (search = "") => {
        // Change to arrow function
        kategoriBuku.findManyAll.loading = true; // Use the full path to access the property
        kategoriBuku.findManyAll.search = search;
        try {
          const query: any = { search };
          if (search) query.search = search;
  
          const res = await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
            "findManyAll"
          ].get({
            query,
          });
  
          if (res.status === 200 && res.data?.success) {
            kategoriBuku.findManyAll.data = res.data.data || [];
          } else {
            console.error("Failed to load pegawai:", res.data?.message);
            kategoriBuku.findManyAll.data = [];
          }
        } catch (error) {
          console.error("Error loading pegawai:", error);
          kategoriBuku.findManyAll.data = [];
        } finally {
          kategoriBuku.findManyAll.loading = false;
        }
      },
    }, 
  findUnique: {
    data: null as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          kategoriBuku.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriBuku.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriBuku.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriBuku.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/del/${id}`,
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
            result.message || "Data Kategori Buku berhasil dihapus"
          );
          await kategoriBuku.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Data Kategori Buku");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Kategori Buku");
      } finally {
        kategoriBuku.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriBuku },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${id}`,
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
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori buku:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriBuku.safeParse(kategoriBuku.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriBuku.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
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
          toast.success("Berhasil update data kategori buku");
          await kategoriBuku.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update data kategori buku");
        }
      } catch (error) {
        console.error("Error updating data kategori buku:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori buku"
        );
        return false;
      } finally {
        kategoriBuku.update.loading = false;
      }
    },
    reset() {
      kategoriBuku.update.id = "";
      kategoriBuku.update.form = { ...defaultKategoriBuku };
    },
  },
});

const templatePeminjamanBuku = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  noTelp: z.string().min(1, "No Telp harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  bukuId: z.string().min(1, "Buku ID harus diisi"),
  tanggalPinjam: z.string().min(1, "Tanggal Pinjam harus diisi"),
  batasKembali: z.string().min(1, "Batas Kembali harus diisi"),
  tanggalKembali: z.string().min(1, "Tanggal Kembali harus diisi"),
  catatan: z.string().min(1, "Catatan harus diisi"),
});

const defaultPeminjamanBuku = {
  nama: "",
  noTelp: "",
  alamat: "",
  bukuId: "",
  tanggalPinjam: "",
  batasKembali: "",
  tanggalKembali: "",
  catatan: "",
};

interface FormEditData {
  nama: string;
  noTelp: string;
  alamat: string;
  bukuId: string;
  buku?: {
    id: string;
    judul: string;
  };
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali: string;
  catatan: string;
  status: "Dipinjam" | "Dikembalikan" | "Terlambat" | "Dibatalkan";
}

const editForm: FormEditData = {
  nama: "",
  noTelp: "",
  alamat: "",
  bukuId: "",
  tanggalPinjam: "",
  batasKembali: "",
  tanggalKembali: "",
  catatan: "",
  status: "Dipinjam",
};

const peminjamanBuku = proxy({
  create: {
    form: { ...defaultPeminjamanBuku },
    loading: false,
    async create() {
      const cek = templatePeminjamanBuku.safeParse(peminjamanBuku.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        peminjamanBuku.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.peminjamanbuku[
            "create"
          ].post(peminjamanBuku.create.form);
        if (res.status === 200) {
          peminjamanBuku.findMany.load();
          return toast.success("Data Peminjaman Buku Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        peminjamanBuku.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.PeminjamanBukuGetPayload<{
      include: {
        buku: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      peminjamanBuku.findMany.loading = true; // ✅ Akses langsung via nama path
      peminjamanBuku.findMany.page = page;
      peminjamanBuku.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.peminjamanbuku[
            "findMany"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          peminjamanBuku.findMany.data = res.data.data ?? [];
          peminjamanBuku.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          peminjamanBuku.findMany.data = [];
          peminjamanBuku.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch data peminjaman buku paginated:", err);
        peminjamanBuku.findMany.data = [];
        peminjamanBuku.findMany.totalPages = 1;
      } finally {
        peminjamanBuku.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PeminjamanBukuGetPayload<{
      include: {
        buku: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/peminjamanbuku/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          peminjamanBuku.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          peminjamanBuku.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        peminjamanBuku.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        peminjamanBuku.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/peminjamanbuku/del/${id}`,
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
            result.message || "Data Peminjaman Buku berhasil dihapus"
          );
          await peminjamanBuku.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus Data Peminjaman Buku"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Peminjaman Buku");
      } finally {
        peminjamanBuku.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...editForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/peminjamanbuku/${id}`,
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
            noTelp: data.noTelp,
            alamat: data.alamat,
            bukuId: data.bukuId,
            tanggalPinjam: data.tanggalPinjam,
            batasKembali: data.batasKembali,
            tanggalKembali: data.tanggalKembali,
            catatan: data.catatan,
            status: data.status,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading peminjaman buku:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templatePeminjamanBuku.safeParse(peminjamanBuku.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        peminjamanBuku.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/peminjamanbuku/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              noTelp: this.form.noTelp,
              alamat: this.form.alamat,
              bukuId: this.form.bukuId,
              tanggalPinjam: this.form.tanggalPinjam,
              batasKembali: this.form.batasKembali,
              tanggalKembali: this.form.tanggalKembali,
              catatan: this.form.catatan,
              status: this.form.status,
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
          toast.success("Berhasil update data peminjaman buku");
          await peminjamanBuku.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data peminjaman buku"
          );
        }
      } catch (error) {
        console.error("Error updating data peminjaman buku:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data peminjaman buku"
        );
        return false;
      } finally {
        peminjamanBuku.update.loading = false;
      }
    },
    reset() {
      peminjamanBuku.update.id = "";
      peminjamanBuku.update.form = { ...editForm };
    },
  },
});

const perpustakaanDigitalState = proxy({
  dataPerpustakaan,
  kategoriBuku,
  peminjamanBuku,
});

export default perpustakaanDigitalState;
