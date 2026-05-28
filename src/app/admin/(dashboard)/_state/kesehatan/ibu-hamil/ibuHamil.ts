/* eslint-disable @typescript-eslint/no-explicit-any */
import { IbuHamilStatus, Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const formSchema = z.object({
  nama: z.string().min(1, { message: "Nama wajib diisi" }),
  nik: z.string().optional(),
  usiaKehamilan: z.number().min(0),
  hpht: z.string().optional(),
  taksiranLahir: z.string().optional(),
  alamat: z.string().optional(),
  noHp: z.string().optional(),
  catatan: z.string().optional(),
  posyanduId: z.string().optional(),
  status: z.enum(["AKTIF", "MELAHIRKAN", "KEGUGURAN", "NONAKTIF"]),
});

const defaultForm = {
  nama: "",
  nik: "",
  usiaKehamilan: 0,
  hpht: "",
  taksiranLahir: "",
  alamat: "",
  noHp: "",
  catatan: "",
  posyanduId: "",
  status: "AKTIF" as IbuHamilStatus,
};

const ibuHamilState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const cek = formSchema.safeParse(ibuHamilState.create.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join(", ");
        toast.error(err);
        return false;
      }
      try {
        ibuHamilState.create.loading = true;
        const res = await fetch("/api/kesehatan/ibuhamil/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cek.data),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Ibu hamil berhasil ditambahkan");
          ibuHamilState.findMany.load();
          return true;
        }
        toast.error(result.message || "Gagal menambahkan data");
        return false;
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan");
        return false;
      } finally {
        ibuHamilState.create.loading = false;
      }
    },
    reset() {
      ibuHamilState.create.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as
      | Prisma.IbuHamilGetPayload<{
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
    statusFilter: "",
    async load(page = 1, limit = 10, search = "", statusFilter = "") {
      ibuHamilState.findMany.loading = true;
      ibuHamilState.findMany.page = page;
      ibuHamilState.findMany.search = search;
      ibuHamilState.findMany.statusFilter = statusFilter;
      try {
        const query = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) query.set("search", search);
        if (statusFilter) query.set("status", statusFilter);
        const res = await fetch(`/api/kesehatan/ibuhamil/find-many?${query}`);
        const result = await res.json();
        if (result.success) {
          ibuHamilState.findMany.data = result.data ?? [];
          ibuHamilState.findMany.totalPages = result.totalPages ?? 1;
          ibuHamilState.findMany.total = result.total ?? 0;
        } else {
          ibuHamilState.findMany.data = [];
        }
      } catch (e) {
        console.error("ibuHamilFindMany error:", e);
        ibuHamilState.findMany.data = [];
      } finally {
        ibuHamilState.findMany.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/ibuhamil/${id}`);
        const result = await res.json();
        if (result.success) {
          const d = result.data;
          ibuHamilState.edit.id = d.id;
          ibuHamilState.edit.form = {
            nama: d.nama,
            nik: d.nik ?? "",
            usiaKehamilan: d.usiaKehamilan,
            hpht: d.hpht ? d.hpht.slice(0, 10) : "",
            taksiranLahir: d.taksiranLahir ? d.taksiranLahir.slice(0, 10) : "",
            alamat: d.alamat ?? "",
            noHp: d.noHp ?? "",
            catatan: d.catatan ?? "",
            posyanduId: d.posyanduId ?? "",
            status: d.status,
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
      const cek = formSchema.safeParse(ibuHamilState.edit.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join(", ");
        toast.error(err);
        return false;
      }
      try {
        ibuHamilState.edit.loading = true;
        const res = await fetch(`/api/kesehatan/ibuhamil/${ibuHamilState.edit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cek.data),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Ibu hamil berhasil diperbarui");
          ibuHamilState.findMany.load();
          return true;
        }
        toast.error(result.message || "Gagal memperbarui data");
        return false;
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan");
        return false;
      } finally {
        ibuHamilState.edit.loading = false;
      }
    },
    reset() {
      ibuHamilState.edit.id = "";
      ibuHamilState.edit.form = { ...defaultForm };
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      try {
        ibuHamilState.delete.loading = true;
        const res = await fetch(`/api/kesehatan/ibuhamil/del/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          toast.success(result.message || "Data berhasil dihapus");
          await ibuHamilState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus data");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        ibuHamilState.delete.loading = false;
      }
    },
  },
});

export default ibuHamilState;
