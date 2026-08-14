/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePeminjamanBuku = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  noTelp: z.string().min(1, "No Telp harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  bukuId: z.string().min(1, "Buku ID harus diisi"),
  tanggalPinjam: z.string().min(1, "Tanggal Pinjam harus diisi"),
  batasKembali: z.string().min(1, "Batas Kembali harus diisi"),
  tanggalKembali: z.string().optional(),
  catatan: z.string().optional(),
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
      peminjamanBuku.findMany.loading = true;
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
          await peminjamanBuku.findMany.load();
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
          return data;
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
          await peminjamanBuku.findMany.load();
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

export default peminjamanBuku;
