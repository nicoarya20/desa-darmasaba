/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateBanjar = z.object({
  name: z.string().min(1, "Nama banjar wajib diisi"),
});

const defaultBanjar = { name: "" };

const banjar = proxy({
  create: {
    form: { ...defaultBanjar },
    loading: false,
    async create() {
      const cek = templateBanjar.safeParse(banjar.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => v.path.join(".")).join("\n")}] required`;
        return toast.error(err);
      }

      try {
        banjar.create.loading = true;
        const res = await fetch("/api/desa/banjar/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(banjar.create.form),
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          banjar.findMany.load();
          return toast.success("Banjar berhasil dibuat");
        }
        return toast.error(result?.message || "Gagal membuat banjar");
      } catch (error) {
        console.error(error);
        return toast.error("Gagal membuat banjar");
      } finally {
        banjar.create.loading = false;
      }
    },
  },

  findMany: {
    data: [] as Prisma.BanjarGetPayload<object>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      banjar.findMany.loading = true;
      banjar.findMany.page = page;
      banjar.findMany.search = search;

      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("search", search);

        const res = await fetch(`/api/desa/banjar/findMany?${params.toString()}`);
        const result = await res.json();

        if (res.ok && result?.success) {
          banjar.findMany.data = result.data ?? [];
          banjar.findMany.totalPages = result.totalPages ?? 1;
        } else {
          banjar.findMany.data = [];
          banjar.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch banjar:", err);
        banjar.findMany.data = [];
        banjar.findMany.totalPages = 1;
      } finally {
        banjar.findMany.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        banjar.delete.loading = true;
        const res = await fetch(`/api/desa/banjar/del/${id}`, { method: "DELETE" });
        const result = await res.json();

        if (res.ok && result?.success) {
          toast.success(result.message || "Banjar berhasil dihapus");
          await banjar.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus banjar");
        }
      } catch (error) {
        console.error("Gagal delete banjar:", error);
        toast.error("Terjadi kesalahan saat menghapus banjar");
      } finally {
        banjar.delete.loading = false;
      }
    },
  },

  update: {
    id: "",
    form: { ...defaultBanjar },
    loading: false,
    async load(id: string) {
      if (!id) { toast.warn("ID tidak valid"); return null; }

      try {
        const res = await fetch(`/api/desa/banjar/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();
        if (result?.success) {
          banjar.update.id = result.data.id;
          banjar.update.form = { name: result.data.name };
          return result.data;
        }
        throw new Error(result?.message || "Gagal memuat data");
      } catch (error) {
        console.error("Error loading banjar:", error);
        toast.error(error instanceof Error ? error.message : "Gagal memuat data");
        return null;
      }
    },
    async update() {
      const cek = templateBanjar.safeParse(banjar.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => v.path.join(".")).join("\n")}] required`;
        return toast.error(err);
      }

      try {
        banjar.update.loading = true;
        const res = await fetch(`/api/desa/banjar/${banjar.update.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(banjar.update.form),
        });
        const result = await res.json();

        if (res.ok && result?.success) {
          return toast.success("Banjar berhasil diperbarui");
        }
        return toast.error(result?.message || "Gagal mengupdate banjar");
      } catch (error) {
        console.error("Error updating banjar:", error);
        toast.error("Gagal mengupdate banjar");
      } finally {
        banjar.update.loading = false;
      }
    },
  },
});

export default banjar;
