/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { SORT_BY_JENJANG } from "@/lib/jenjang-pendidikan-urutan";

const pengajarForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  lembagaId: z.string().min(1, "lembaga pendidikan minimal 1"),
});

const pengajarDefaultForm = {
  nama: "",
  lembagaId: "",
};

const pengajar = proxy({
  create: {
    form: { ...pengajarDefaultForm },
    loading: false,
    async create() {
      const cek = pengajarForm.safeParse(pengajar.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pengajar.create.loading = true;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.pengajar[
          "create"
        ].post(pengajar.create.form);
        if (res.status === 200) {
          pengajar.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.error("Gagal menambahkan pengajar:", error);
        toast.error("Gagal menambahkan data");
      } finally {
        pengajar.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.PengajarGetPayload<{
        include: {
          lembaga: {
            include: {
              jenjangPendidikan: true
            }
          }
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
      pengajar.findMany.loading = true;
      pengajar.findMany.page = page;
      pengajar.findMany.search = search;
      pengajar.findMany.jenjangPendidikan = jenjangPendidikan;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (jenjangPendidikan) query.jenjangPendidikanId = jenjangPendidikan;
        if (sortByJenjang) query.sort = SORT_BY_JENJANG;
        const res = await ApiFetch.api.pendidikan.infosekolahpaud.pengajar[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pengajar.findMany.data = res.data.data || [];
          pengajar.findMany.total = res.data.total || 0;
          pengajar.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load pengajar:",
            res.data?.message
          );
          pengajar.findMany.data = [];
          pengajar.findMany.total = 0;
          pengajar.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pengajar:", error);
        pengajar.findMany.data = [];
        pengajar.findMany.total = 0;
        pengajar.findMany.totalPages = 1;
      } finally {
        pengajar.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PengajarGetPayload<{
      include: {
        lembaga: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pengajar.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pengajar.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        pengajar.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengajar.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "pengajar berhasil dihapus");
          await pengajar.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus pengajar");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengajar");
      } finally {
        pengajar.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...pengajarDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/${id}`,
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
        console.error("Error loading pengajar:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = pengajarForm.safeParse(pengajar.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pengajar.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/pengajar/${pengajar.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: pengajar.edit.form.nama,
              lembagaId: pengajar.edit.form.lembagaId,
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
              result?.message ||
                `Gagal mengupdate pengajar (${response.status})`
            );
          }

          if (result.success) {
            toast.success(result.message || "Berhasil memperbarui pengajar");
            await pengajar.findMany.load();
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate pengajar");
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
        console.error("Error updating pengajar:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pengajar"
        );
        return false;
      } finally {
        pengajar.edit.loading = false;
      }
    },
    reset() {
      pengajar.edit.id = "";
      pengajar.edit.form = { ...pengajarDefaultForm };
    },
  },
});

export default pengajar;
