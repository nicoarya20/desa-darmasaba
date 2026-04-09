/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikKepuasan = z.object({
  nama: z.string().min(2, "Nama harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  penyakit: z.string().min(1, "Penyakit harus diisi"),
});

const defaultForm = {
  nama: "",
  tanggal: "",
  jenisKelamin: "",
  alamat: "",
  penyakit: "",
};

const grafikkepuasan = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikKepuasan.safeParse(grafikkepuasan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        grafikkepuasan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.grafikkepuasan["create"].post(
          grafikkepuasan.create.form
        );

        if (res.status === 200) {
          const id = res.data?.data;
          if (id) {
            toast.success("Sukses menambahkan");
            grafikkepuasan.create.form = { ...defaultForm };
            grafikkepuasan.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        grafikkepuasan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikKepuasanGetPayload<{
          omit: {
            isActive: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      grafikkepuasan.findMany.loading = true; // ✅ Akses langsung via nama path
      grafikkepuasan.findMany.page = page;
      grafikkepuasan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.grafikkepuasan[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          grafikkepuasan.findMany.data = res.data.data ?? [];
          grafikkepuasan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          grafikkepuasan.findMany.data = [];
          grafikkepuasan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch berita paginated:", err);
        grafikkepuasan.findMany.data = [];
        grafikkepuasan.findMany.totalPages = 1;
      } finally {
        grafikkepuasan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.GrafikKepuasanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/grafikkepuasan/${id}`);
        if (res.ok) {
          const data = await res.json();
          grafikkepuasan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch grafikkepuasan:", res.statusText);
          grafikkepuasan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching grafikkepuasan:", error);
        grafikkepuasan.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/kesehatan/grafikkepuasan/${id}`, {
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
            nama: data.nama,
            tanggal: data.tanggal,
            jenisKelamin: data.jenisKelamin,
            alamat: data.alamat,
            penyakit: data.penyakit,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading grafik kepuasan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        nama: this.form.nama,
        tanggal: this.form.tanggal,
        jenisKelamin: this.form.jenisKelamin,
        alamat: this.form.alamat,
        penyakit: this.form.penyakit,
      };

      const cek = templateGrafikKepuasan.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kesehatan/grafikkepuasan/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await res.json();

        if (!res.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }

        toast.success("Berhasil update data!");
        await grafikkepuasan.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data grafik kepuasan");
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) {
        return toast.warn("ID tidak valid");
      }
      try {
        grafikkepuasan.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/grafikkepuasan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Grafik kepuasan berhasil dihapus");
          await grafikkepuasan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus grafik kepuasan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik kepuasan");
      } finally {
        grafikkepuasan.delete.loading = false;
      }
    },
  },
});

export default grafikkepuasan;
