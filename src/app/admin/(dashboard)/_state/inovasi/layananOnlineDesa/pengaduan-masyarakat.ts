/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

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
      pengaduanMasyarakat.findMany.loading = true;
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

        // Eden delete — avoids 400 parse-body error on empty-body DELETE in Elysia
        const res = await (
          ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat as any
        )["del"][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Pengaduan masyarakat berhasil dihapus"
          );
          await pengaduanMasyarakat.findMany.load();
        } else {
          toast.error(
            res.data?.message || "Gagal menghapus pengaduan masyarakat"
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

export default pengaduanMasyarakat;
