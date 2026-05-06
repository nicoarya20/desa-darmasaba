/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

export type StatusCctv = "Online" | "Offline";

export interface CctvData {
  id: string;
  kode: string;
  nama: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  status: StatusCctv;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const templateForm = z.object({
  kode: z.string().min(1, "Kode CCTV wajib diisi"),
  nama: z.string().min(1, "Nama CCTV wajib diisi"),
  lokasi: z.string().min(1, "Lokasi wajib diisi"),
});

interface FormData {
  kode: string;
  nama: string;
  lokasi: string;
  latitude: string;
  longitude: string;
  status: StatusCctv;
  lastActive: string;
}

const defaultForm: FormData = {
  kode: "",
  nama: "",
  lokasi: "",
  latitude: "",
  longitude: "",
  status: "Online",
  lastActive: new Date().toISOString(),
};

const cctvState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(cctvState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => v.path.join(".")).join("\n")}] required`;
        return toast.error(err);
      }
      try {
        cctvState.create.loading = true;
        const form = cctvState.create.form;
        const res = await ApiFetch.api.keamanan.cctv["create"].post({
          kode: form.kode,
          nama: form.nama,
          lokasi: form.lokasi,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          status: form.status,
          lastActive: form.lastActive,
        });
        if (res.error) throw new Error("Failed to create CCTV");
        if (res.status === 200) {
          await cctvState.findMany.load();
          return toast.success("CCTV berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan CCTV");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal membuat CCTV");
      } finally {
        cctvState.create.loading = false;
      }
    },
    resetForm() {
      cctvState.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as CctvData[] | null,
    loading: false,
    page: 1,
    limit: 10,
    totalPages: 1,
    search: "",
    async load() {
      try {
        cctvState.findMany.loading = true;
        const res = await ApiFetch.api.keamanan.cctv["find-many"].get({
          query: {
            page: String(cctvState.findMany.page),
            limit: String(cctvState.findMany.limit),
            search: cctvState.findMany.search,
          },
        });
        if (res.data?.success) {
          cctvState.findMany.data = (res.data.data as any) ?? [];
          cctvState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          cctvState.findMany.data = [];
          cctvState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch CCTV:", err);
        cctvState.findMany.data = [];
        cctvState.findMany.totalPages = 1;
      } finally {
        cctvState.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as CctvData | null,
    loading: false,
    async load(id: string) {
      if (!id) return null;
      try {
        cctvState.findUnique.loading = true;
        const res = await ApiFetch.api.keamanan.cctv({ id }).get();
        if (res.data?.success) {
          cctvState.findUnique.data = res.data.data as any;
        }
        return res.data?.data ?? null;
      } catch (err) {
        console.error("Gagal fetch CCTV by id:", err);
        return null;
      } finally {
        cctvState.findUnique.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async remove(id: string) {
      try {
        cctvState.delete.loading = true;
        const response = await fetch(`/api/keamanan/cctv/del/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (response.ok && result?.success) {
          toast.success(result.message || "CCTV berhasil dihapus");
          await cctvState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus CCTV");
        }
      } catch (error) {
        console.error("Gagal delete CCTV:", error);
        toast.error("Terjadi kesalahan saat menghapus CCTV");
      } finally {
        cctvState.delete.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      if (!id) return null;
      const data = await cctvState.findUnique.load(id);
      if (data) {
        cctvState.edit.id = id;
        cctvState.edit.form = {
          kode: (data as any).kode ?? "",
          nama: (data as any).nama ?? "",
          lokasi: (data as any).lokasi ?? "",
          latitude: (data as any).latitude != null ? String((data as any).latitude) : "",
          longitude: (data as any).longitude != null ? String((data as any).longitude) : "",
          status: (data as any).status ?? "Online",
          lastActive: (data as any).lastActive ?? new Date().toISOString(),
        };
      }
      return data;
    },
    async update() {
      const cek = templateForm.safeParse(cctvState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => v.path.join(".")).join("\n")}] required`;
        return toast.error(err);
      }
      try {
        cctvState.edit.loading = true;
        const form = cctvState.edit.form;
        const res = await ApiFetch.api.keamanan.cctv({ id: cctvState.edit.id }).put({
          kode: form.kode,
          nama: form.nama,
          lokasi: form.lokasi,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          status: form.status,
          lastActive: form.lastActive,
        });
        if (res.error) throw new Error("Failed to update CCTV");
        if (res.status === 200) {
          await cctvState.findMany.load();
          return toast.success("CCTV berhasil diperbarui");
        }
        return toast.error("Gagal memperbarui CCTV");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal update CCTV");
      } finally {
        cctvState.edit.loading = false;
      }
    },
  },

  stats: {
    data: null as { cctvOnline: number; laporanMingguIni: number } | null,
    loading: false,
    async load() {
      try {
        cctvState.stats.loading = true;
        const res = await ApiFetch.api.keamanan.cctv["stats"].get();
        if (res.data?.success) {
          cctvState.stats.data = res.data.data as any;
        }
      } catch (err) {
        console.error("Gagal fetch CCTV stats:", err);
      } finally {
        cctvState.stats.loading = false;
      }
    },
  },
});

export default cctvState;
