/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { SORT_BY_JENJANG } from "@/lib/jenjang-pendidikan-urutan";

const siswaForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  lembagaId: z.string().min(1, "lembaga pendidikan minimal 1"),
});

const siswaDefaultForm = {
  nama: "",
  lembagaId: "",
};

const siswa = proxy({
  create: {
    form: { ...siswaDefaultForm },
    loading: false,
    async create() {
      const cek = siswaForm.safeParse(siswa.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        siswa.create.loading = true;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.siswa[
          "create"
        ].post(siswa.create.form);
        if (res.status === 200) {
          siswa.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.error("Gagal menambahkan siswa:", error);
        toast.error("Gagal menambahkan data");
      } finally {
        siswa.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.SiswaGetPayload<{
        include: {
          lembaga: {
            include: {
              jenjangPendidikan: true;
            };
          };
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    jenjangPendidikan: "",
    /** `sortByJenjang` → baris urut PAUD, TK, SD, SMP, SMA, SMK (dipakai halaman publik; admin tetap urut nama). */
    load: async (page = 1, limit = 10, search = "", jenjangPendidikan = "", sortByJenjang = false) => {
      siswa.findMany.loading = true;
      siswa.findMany.page = page;
      siswa.findMany.search = search;
      siswa.findMany.jenjangPendidikan = jenjangPendidikan;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (jenjangPendidikan) query.jenjangPendidikanName = jenjangPendidikan;
        if (sortByJenjang) query.sort = SORT_BY_JENJANG;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.siswa[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          siswa.findMany.data = res.data.data || [];
          siswa.findMany.total = res.data.total || 0;
          siswa.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load siswa:",
            res.data?.message
          );
          siswa.findMany.data = [];
          siswa.findMany.total = 0;
          siswa.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading siswa:", error);
        siswa.findMany.data = [];
        siswa.findMany.total = 0;
        siswa.findMany.totalPages = 1;
      } finally {
        siswa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.SiswaGetPayload<{
      include: {
        lembaga: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/pendidikan/infosekolahpaud/siswa/${id}`);
        if (res.ok) {
          const data = await res.json();
          siswa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          siswa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        siswa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        siswa.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/siswa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "siswa berhasil dihapus");
          await siswa.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus siswa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus siswa");
      } finally {
        siswa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...siswaDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/siswa/${id}`,
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
            lembagaId: data.lembagaId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading siswa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = siswaForm.safeParse(siswa.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        siswa.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/siswa/${siswa.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: siswa.edit.form.nama,
              lembagaId: siswa.edit.form.lembagaId,
            }),
          }
        );

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
              result?.message || `Gagal mengupdate siswa (${response.status})`
            );
          }

          if (result.success) {
            toast.success(result.message || "Berhasil memperbarui siswa");
            await siswa.findMany.load();
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate siswa");
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
        console.error("Error updating siswa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate siswa"
        );
        return false;
      } finally {
        siswa.edit.loading = false;
      }
    },
    reset() {
      siswa.edit.id = "";
      siswa.edit.form = { ...siswaDefaultForm };
    },
  },
});

export default siswa;
