/* eslint-disable @typescript-eslint/no-explicit-any */
import { JenisKelaminBalita, Prisma, StatusStunting } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const formSchema = z.object({
  nama: z.string().min(1, { message: "Nama wajib diisi" }),
  nik: z.string().optional(),
  tanggalLahir: z.string().min(1, { message: "Tanggal lahir wajib diisi" }),
  jenisKelamin: z.enum(["L", "P"]),
  beratBadanKg: z.number().optional(),
  tinggiBadanCm: z.number().optional(),
  namaOrtu: z.string().optional(),
  alamat: z.string().optional(),
  noHpOrtu: z.string().optional(),
  posyanduId: z.string().optional(),
  imunisasiLengkap: z.boolean(),
  giziBaik: z.boolean(),
  pemeriksaanRutin: z.boolean(),
  statusStunting: z.enum(["NORMAL", "ALERT", "STUNTING"]),
  catatan: z.string().optional(),
});

const defaultForm = {
  nama: "",
  nik: "",
  tanggalLahir: "",
  jenisKelamin: "L" as JenisKelaminBalita,
  beratBadanKg: undefined as number | undefined,
  tinggiBadanCm: undefined as number | undefined,
  namaOrtu: "",
  alamat: "",
  noHpOrtu: "",
  posyanduId: "",
  imunisasiLengkap: false,
  giziBaik: true,
  pemeriksaanRutin: true,
  statusStunting: "NORMAL" as StatusStunting,
  catatan: "",
};

const balitaState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const cek = formSchema.safeParse(balitaState.create.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join(", ");
        toast.error(err);
        return false;
      }
      try {
        balitaState.create.loading = true;
        const res = await fetch("/api/kesehatan/balita/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cek.data),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Balita berhasil ditambahkan");
          balitaState.findMany.load();
          return true;
        }
        toast.error(result.message || "Gagal menambahkan data");
        return false;
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan");
        return false;
      } finally {
        balitaState.create.loading = false;
      }
    },
    reset() {
      balitaState.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as
      | Prisma.BalitaGetPayload<{
          include: {
            posyandu: {
              select: {
                id: true;
                name: true;
                banjar: { select: { id: true; name: true } };
              };
            };
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    statusStuntingFilter: "",
    async load(page = 1, limit = 10, search = "", statusStuntingFilter = "") {
      balitaState.findMany.loading = true;
      balitaState.findMany.page = page;
      balitaState.findMany.search = search;
      balitaState.findMany.statusStuntingFilter = statusStuntingFilter;
      try {
        const query = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) query.set("search", search);
        if (statusStuntingFilter) query.set("statusStunting", statusStuntingFilter);
        const res = await fetch(`/api/kesehatan/balita/find-many?${query}`);
        const result = await res.json();
        if (result.success) {
          balitaState.findMany.data = result.data ?? [];
          balitaState.findMany.totalPages = result.totalPages ?? 1;
          balitaState.findMany.total = result.total ?? 0;
        } else {
          balitaState.findMany.data = [];
        }
      } catch (e) {
        console.error("balitaFindMany error:", e);
        balitaState.findMany.data = [];
      } finally {
        balitaState.findMany.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/balita/${id}`);
        const result = await res.json();
        if (result.success) {
          const d = result.data;
          balitaState.edit.id = d.id;
          balitaState.edit.form = {
            nama: d.nama,
            nik: d.nik ?? "",
            tanggalLahir: d.tanggalLahir ? d.tanggalLahir.slice(0, 10) : "",
            jenisKelamin: d.jenisKelamin,
            beratBadanKg: d.beratBadanKg ?? undefined,
            tinggiBadanCm: d.tinggiBadanCm ?? undefined,
            namaOrtu: d.namaOrtu ?? "",
            alamat: d.alamat ?? "",
            noHpOrtu: d.noHpOrtu ?? "",
            posyanduId: d.posyanduId ?? "",
            imunisasiLengkap: d.imunisasiLengkap,
            giziBaik: d.giziBaik,
            pemeriksaanRutin: d.pemeriksaanRutin,
            statusStunting: d.statusStunting,
            catatan: d.catatan ?? "",
          };
          return d;
        }
        toast.error("Gagal memuat data");
        return null;
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat data");
        return null;
      }
    },
    async update() {
      const cek = formSchema.safeParse(balitaState.edit.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join(", ");
        toast.error(err);
        return false;
      }
      try {
        balitaState.edit.loading = true;
        const res = await fetch(`/api/kesehatan/balita/${balitaState.edit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cek.data),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Data balita berhasil diperbarui");
          balitaState.findMany.load();
          return true;
        }
        toast.error(result.message || "Gagal memperbarui data");
        return false;
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan");
        return false;
      } finally {
        balitaState.edit.loading = false;
      }
    },
    reset() {
      balitaState.edit.id = "";
      balitaState.edit.form = { ...defaultForm };
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      try {
        balitaState.delete.loading = true;
        const res = await fetch(`/api/kesehatan/balita/del/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          toast.success(result.message || "Data berhasil dihapus");
          await balitaState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus data");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        balitaState.delete.loading = false;
      }
    },
  },
});

export default balitaState;
