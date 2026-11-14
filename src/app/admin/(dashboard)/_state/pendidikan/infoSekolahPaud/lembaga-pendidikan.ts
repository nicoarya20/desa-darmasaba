/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { SORT_BY_JENJANG } from "@/lib/jenjang-pendidikan-urutan";

const lembagaPendidikanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  jenjangId: z.string().min(1, "Jenjang pendidikan minimal 1"),
});

const lembagaPendidikanDefaultForm = {
  nama: "",
  jenjangId: "",
};

const lembagaPendidikan = proxy({
  create: {
    form: { ...lembagaPendidikanDefaultForm },
    loading: false,
    async create() {
      const cek = lembagaPendidikanForm.safeParse(
        lembagaPendidikan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        lembagaPendidikan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan[
            "create"
          ].post(lembagaPendidikan.create.form);
        if (res.status === 200) {
          lembagaPendidikan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.error("Gagal menambahkan lembaga pendidikan:", error);
        toast.error("Gagal menambahkan data");
      } finally {
        lembagaPendidikan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.LembagaGetPayload<{
        include: {
          jenjangPendidikan: true;
        };
      }> & {
        siswa?: [];
        pengajar?: [];
      }
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    /** `sortByJenjang` → baris urut PAUD, TK, SD, SMP, SMA, SMK (dipakai halaman publik; admin tetap urut nama). */
    load: async (page = 1, limit = 10, search = "", jenjangPendidikan = "", sortByJenjang = false) => {
      lembagaPendidikan.findMany.loading = true;
      lembagaPendidikan.findMany.page = page;
      lembagaPendidikan.findMany.search = search;

      try {
        const query: any = {
          page,
          limit,
          ...(search && { search }),
          ...(jenjangPendidikan && { jenjangPendidikanId: jenjangPendidikan }),
          ...(sortByJenjang && { sort: SORT_BY_JENJANG }),
        };

        const res = await ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : [];
          const total = typeof res.data.total === "number" ? res.data.total : 0;
          const totalPages = typeof res.data.totalPages === "number" ? res.data.totalPages : 1;

          lembagaPendidikan.findMany.data = data;
          lembagaPendidikan.findMany.total = total;
          lembagaPendidikan.findMany.totalPages = totalPages;
        } else {
          console.error(
            "Failed to load lembaga pendidikan:",
            res.data?.message || "No error message provided"
          );
          throw new Error(res.data?.message || "Failed to load lembaga pendidikan");
        }
      } catch (error) {
        console.error("Error loading lembaga pendidikan:", error);
        lembagaPendidikan.findMany.data = [];
        lembagaPendidikan.findMany.total = 0;
        lembagaPendidikan.findMany.totalPages = 1;
      } finally {
        lembagaPendidikan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.LembagaGetPayload<{
      include: {
        jenjangPendidikan: true;
        siswa: true;
        pengajar: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          lembagaPendidikan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          lembagaPendidikan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        lembagaPendidikan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        lembagaPendidikan.delete.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn create/find di file ini. Eden
        // tak set Content-Type json untuk DELETE tanpa body (hindari 400 parse
        // Elysia) dan content-type aware saat parse respons (hindari SyntaxError
        // bila body non-JSON).
        const res = await (
          ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan as any
        )["del"][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "lembaga pendidikan berhasil dihapus"
          );
          await lembagaPendidikan.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di res.error.value,
          // bukan res.data — baca keduanya agar pesan spesifik backend tetap tampil.
          const msg =
            res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus lembaga pendidikan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus lembaga pendidikan");
      } finally {
        lembagaPendidikan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...lembagaPendidikanDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/${id}`,
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
            jenjangId: data.jenjangId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading lembaga pendidikan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = lembagaPendidikanForm.safeParse(lembagaPendidikan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        lembagaPendidikan.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/lembagapendidikan/${lembagaPendidikan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: lembagaPendidikan.edit.form.nama,
              jenjangId: lembagaPendidikan.edit.form.jenjangId,
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
                `Gagal mengupdate lembaga pendidikan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui lembaga pendidikan"
            );
            await lembagaPendidikan.findMany.load();
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate lembaga pendidikan"
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
        console.error("Error updating lembaga pendidikan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate lembaga pendidikan"
        );
        return false;
      } finally {
        lembagaPendidikan.edit.loading = false;
      }
    },
    reset() {
      lembagaPendidikan.edit.id = "";
      lembagaPendidikan.edit.form = { ...lembagaPendidikanDefaultForm };
    },
  },
});

export default lembagaPendidikan;
