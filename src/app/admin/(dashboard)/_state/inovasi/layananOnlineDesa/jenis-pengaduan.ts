/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateJenisPengaduanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const defaultJenisPengaduanForm = {
  nama: "",
};

const jenisPengaduan = proxy({
  create: {
    form: { ...defaultJenisPengaduanForm },
    loading: false,
    async create() {
      const cek = templateJenisPengaduanForm.safeParse(
        jenisPengaduan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jenisPengaduan.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat.jenispengaduan[
            "create"
          ].post(jenisPengaduan.create.form);
        if (res.status === 200) {
          jenisPengaduan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        jenisPengaduan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      nama: string;
    }> | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      jenisPengaduan.findMany.loading = true;
      jenisPengaduan.findMany.page = page;
      jenisPengaduan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat.jenispengaduan[
            "find-many"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          jenisPengaduan.findMany.data = res.data.data ?? [];
          jenisPengaduan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          jenisPengaduan.findMany.data = [];
          jenisPengaduan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch jenis pengaduan paginated:", err);
        jenisPengaduan.findMany.data = [];
        jenisPengaduan.findMany.totalPages = 1;
      } finally {
        jenisPengaduan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenisPengaduanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jenisPengaduan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenisPengaduan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        jenisPengaduan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenisPengaduan.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Jenis pengduan berhasil dihapus");
          await jenisPengaduan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus jenis pengaduan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenis pengaduan");
      } finally {
        jenisPengaduan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultJenisPengaduanForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            nama: data.nama,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading jenis pengaduan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateJenisPengaduanForm.safeParse(
        jenisPengaduan.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        jenisPengaduan.edit.loading = true;
        const response = await fetch(
          `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/${jenisPengaduan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: jenisPengaduan.edit.form.nama,
            }),
          }
        );

        // Clone to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate jenis pengaduan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui jenis pengaduan"
            );
            await jenisPengaduan.findMany.load();
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate jenis pengaduan"
            );
          }
        } catch (error) {
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating jenis pengaduan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate jenis pengaduan"
        );
        return false;
      } finally {
        jenisPengaduan.edit.loading = false;
      }
    },
    reset() {
      jenisPengaduan.edit.id = "";
      jenisPengaduan.edit.form = { ...defaultJenisPengaduanForm };
    },
  },
});

export default jenisPengaduan;
