import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z
    .string()
    .min(3, "NIK minimal 3 karakter")
    .max(16, "NIK maksimal 16 angka"),
  notelp: z
    .string()
    .min(3, "Nomor Telepon minimal 3 karakter")
    .max(15, "Nomor Telepon maksimal 15 angka"),
  alamat: z.string().min(3, "Alamat minimal 3 karakter"),
  email: z.string().min(3, "Email minimal 3 karakter"),
  jenisInformasiDimintaId: z.string().nonempty(),
  caraMemperolehInformasiId: z.string().nonempty(),
  caraMemperolehSalinanInformasiId: z.string().nonempty(),
});

const jenisInformasiDiminta = proxy({
  findMany: {
    data: null as
      | null
      | Prisma.JenisInformasiDimintaGetPayload<{ omit: { isActive: true } }>[],
    async load() {
      const res =
        await ApiFetch.api.ppid.permohonaninformasipublik.jenisInformasi[
          "find-many"
        ].get();
      if (res.status === 200) {
        jenisInformasiDiminta.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

const caraMemperolehInformasi = proxy({
  findMany: {
    data: null as
      | null
      | Prisma.CaraMemperolehInformasiGetPayload<{
          omit: { isActive: true };
        }>[],
    async load() {
      const res =
        await ApiFetch.api.ppid.permohonaninformasipublik.memperolehInformasi[
          "find-many"
        ].get();
      if (res.status === 200) {
        caraMemperolehInformasi.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

const caraMemperolehSalinanInformasi = proxy({
  findMany: {
    data: null as
      | null
      | Prisma.CaraMemperolehSalinanInformasiGetPayload<{
          omit: { isActive: true };
        }>[],
    async load() {
      const res =
        await ApiFetch.api.ppid.permohonaninformasipublik.salinanInformasi[
          "find-many"
        ].get();
      if (res.status === 200) {
        caraMemperolehSalinanInformasi.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
console.log(caraMemperolehSalinanInformasi);

type PermohonanInformasiPublikForm =
  Prisma.PermohonanInformasiPublikGetPayload<{
    select: {
      name: true;
      nik: true;
      notelp: true;
      alamat: true;
      email: true;
      jenisInformasiDimintaId: true;
      caraMemperolehInformasiId: true;
      caraMemperolehSalinanInformasiId: true;
    };
  }>;

const statepermohonanInformasiPublik = proxy({
  create: {
    form: {} as PermohonanInformasiPublikForm,
    loading: false,
    async create() {
      const cek = templateForm.safeParse(
        statepermohonanInformasiPublik.create.form
      );

      if (!cek.success) {
        toast.error(cek.error.issues.map((i) => i.message).join("\n"));
        return false; // ⬅️ tambahkan return false
      }

      try {
        statepermohonanInformasiPublik.create.loading = true;
        const res = await ApiFetch.api.ppid.permohonaninformasipublik[
          "create"
        ].post(statepermohonanInformasiPublik.create.form);

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
        statepermohonanInformasiPublik.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PermohonanInformasiPublikGetPayload<{
          include: {
            caraMemperolehSalinanInformasi: true;
            jenisInformasiDiminta: true;
            caraMemperolehInformasi: true;
          };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.ppid.permohonaninformasipublik[
        "find-many"
      ].get();
      if (res.status === 200) {
        statepermohonanInformasiPublik.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.PermohonanInformasiPublikGetPayload<{
      include: {
        jenisInformasiDiminta: true;
        caraMemperolehInformasi: true;
        caraMemperolehSalinanInformasi: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ppid/permohonaninformasipublik/${id}`);
        if (res.ok) {
          const data = await res.json();
          statepermohonanInformasiPublik.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch program inovasi:", res.statusText);
          statepermohonanInformasiPublik.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching program inovasi:", error);
        statepermohonanInformasiPublik.findUnique.data = null;
      }
    },
  },
});

const statepermohonanInformasiPublikForm = proxy({
  statepermohonanInformasiPublik,
  jenisInformasiDiminta,
  caraMemperolehInformasi,
  caraMemperolehSalinanInformasi,
});

export default statepermohonanInformasiPublikForm;
