/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  jenisKelaminId: z.string().min(1, "Jenis kelamin harus diisi"),
  ratingId: z.string().min(1, "Rating harus diisi"),
  kelompokUmurId: z.string().min(1, "Kelompok umur harus diisi"),
});

const defaultFormResponden = {
  name: "",
  tanggal: "",
  jenisKelaminId: "",
  ratingId: "",
  kelompokUmurId: "",
};

const responden = proxy({
  create: {
    form: { ...defaultFormResponden },
    loading: false,
    /** Kirim form; true bila tersimpan, false bila validasi/API gagal (toast sudah ditampilkan). */
    async create(): Promise<boolean> {
      const cek = templateResponden.safeParse(responden.create.form);
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return false;
      }

      try {
        responden.create.loading = true;
        const res = await ApiFetch.api.landingpage.responden["create"].post(
          responden.create.form
        );
        if (res.status === 200) {
          toast.success("Responden berhasil ditambahkan");
          await responden.findMany.load();
          return true;
        } else {
          toast.error(getServerMessage(res) ?? "Gagal tambah responden");
          return false;
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error("Terjadi kesalahan saat menambahkan responden");
        return false;
      } finally {
        responden.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      responden.findMany.loading = true;
      responden.findMany.page = page;
      responden.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.responden["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          responden.findMany.data = res.data.data || [];
          responden.findMany.total = res.data.total || 0;
          responden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load responden:", res.data?.message);
          responden.findMany.data = [];
          responden.findMany.total = 0;
          responden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        responden.findMany.data = [];
        responden.findMany.total = 0;
        responden.findMany.totalPages = 1;
      } finally {
        responden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.RespondenGetPayload<{
      include: {
        jenisKelamin: true;
        rating: true;
        kelompokUmur: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/responden/${id}`);
        if (res.ok) {
          const data = await res.json();
          responden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          responden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        responden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormResponden },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        responden.update.loading = true;

        const response = await fetch(`/api/landingpage/responden/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
            tanggal: data.tanggal,
            jenisKelaminId: data.jenisKelaminId,
            ratingId: data.ratingId,
            kelompokUmurId: data.kelompokUmurId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        responden.update.loading = false;
      }
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      const cek = templateResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/landingpage/responden/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            tanggal: this.form.tanggal,
            jenisKelaminId: this.form.jenisKelaminId,
            ratingId: this.form.ratingId,
            kelompokUmurId: this.form.kelompokUmurId,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await responden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data responden");
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        responden.delete.loading = true;

        const response = await fetch(`/api/landingpage/responden/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "responden berhasil dihapus");
          await responden.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus responden");
      } finally {
        responden.delete.loading = false;
      }
    },
  },
});

export default responden;
