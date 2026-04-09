/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().min(3, "Email minimal 3 karakter"),
  notelp: z
    .string()
    .min(3, "Nomor Telepon minimal 3 karakter")
    .max(15, "Nomor Telepon maksimal 15 angka"),
  alasan: z.string().min(3, "Alasan minimal 3 karakter"),
});

type PermohonanKeberatanInformasiForm =
  Prisma.FormulirPermohonanKeberatanGetPayload<{
    select: {
      name: true;
      email: true;
      notelp: true;
      alasan: true;
    };
  }>;

const permohonanKeberatanInformasi = proxy({
  create: {
    form: {} as PermohonanKeberatanInformasiForm,
    loading: false,
    async create() {
      const cek = templateForm.safeParse(
        permohonanKeberatanInformasi.create.form
      );
      if (!cek.success) {
        toast.error(cek.error.issues.map((i) => i.message).join("\n"));
        return false; // ⬅️ tambahkan return false
      }
      try {
        permohonanKeberatanInformasi.create.loading = true;
        const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik[
          "create"
        ].post(permohonanKeberatanInformasi.create.form);
        if (res.data?.success === false) {
            toast.error(res.data?.message);
            return false; // ⬅️ gagal
        }

        toast.success("Sukses menambahkan");
        return true; // ⬅️ sukses
      } catch {
        toast.error("Terjadi kesalahan server");
        return false;
      } finally {
        permohonanKeberatanInformasi.create.loading = false;
      }
    },
  },
  findMany: {
   data: null as
      | null
      | Prisma.FormulirPermohonanKeberatanGetPayload<{
          omit: { isActive: true };
        }>[],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      permohonanKeberatanInformasi.findMany.loading = true; // Use the full path to access the property
      permohonanKeberatanInformasi.findMany.page = page;
      permohonanKeberatanInformasi.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          permohonanKeberatanInformasi.findMany.data = res.data.data || [];
          permohonanKeberatanInformasi.findMany.total = res.data.total || 0;
          permohonanKeberatanInformasi.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load permohonan keberatan informasi:", res.data?.message);
          permohonanKeberatanInformasi.findMany.data = [];
          permohonanKeberatanInformasi.findMany.total = 0;
          permohonanKeberatanInformasi.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading permohonan keberatan informasi:", error);
        permohonanKeberatanInformasi.findMany.data = [];
        permohonanKeberatanInformasi.findMany.total = 0;
        permohonanKeberatanInformasi.findMany.totalPages = 1;
      } finally {
        permohonanKeberatanInformasi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.FormulirPermohonanKeberatanGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/permohonankeberataninformasipublik/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          permohonanKeberatanInformasi.findUnique.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch permohonan keberatan informasi:",
            res.statusText
          );
          permohonanKeberatanInformasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching permohonan keberatan informasi:", error);
        permohonanKeberatanInformasi.findUnique.data = null;
      }
    },
  },
});

export default permohonanKeberatanInformasi;
