import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
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
      | Prisma.FormulirPermohonanKeberatanGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik[
        "find-many"
      ].get();
      if (res.status === 200) {
        permohonanKeberatanInformasi.findMany.data = res.data?.data ?? [];
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
