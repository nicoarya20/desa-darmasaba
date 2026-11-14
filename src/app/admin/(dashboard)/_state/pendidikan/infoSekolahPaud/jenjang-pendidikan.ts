/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const jenjangPendidikanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const jenjangPendidikanDefaultForm = {
  nama: "",
};

const jenjangPendidikan = proxy({
  create: {
    form: { ...jenjangPendidikanDefaultForm },
    loading: false,
    async create() {
      const cek = jenjangPendidikanForm.safeParse(
        jenjangPendidikan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jenjangPendidikan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.infosekolahpaud.jenjangpendidikan[
            "create"
          ].post(jenjangPendidikan.create.form);
        if (res.status === 200) {
          jenjangPendidikan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        jenjangPendidikan.create.loading = false;
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
    total: 0,
    loading: false,
    search: "",
    /** `hasLembaga` → hanya jenjang yang punya lembaga aktif (filter publik); admin memuat semua. */
    load: async (page = 1, limit = 10, search = "", hasLembaga = false) => {
      jenjangPendidikan.findMany.loading = true;
      jenjangPendidikan.findMany.page = page;
      jenjangPendidikan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (hasLembaga) query.hasLembaga = "true";
        const res =
          await ApiFetch.api.pendidikan.infosekolahpaud.jenjangpendidikan[
            "find-many"
          ].get({
            query,
          });

        if (res.status === 200 && res.data?.success) {
          jenjangPendidikan.findMany.data = res.data.data || [];
          jenjangPendidikan.findMany.total = res.data.total || 0;
          jenjangPendidikan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load jenjang pendidikan:",
            res.data?.message
          );
          jenjangPendidikan.findMany.data = [];
          jenjangPendidikan.findMany.total = 0;
          jenjangPendidikan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading jenjang pendidikan:", error);
        jenjangPendidikan.findMany.data = [];
        jenjangPendidikan.findMany.total = 0;
        jenjangPendidikan.findMany.totalPages = 1;
      } finally {
        jenjangPendidikan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenjangPendidikanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jenjangPendidikan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenjangPendidikan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        jenjangPendidikan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        jenjangPendidikan.delete.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn create/find di file ini. Eden
        // tak set Content-Type json untuk DELETE tanpa body (hindari 400 parse
        // Elysia) dan content-type aware saat parse respons (hindari SyntaxError
        // bila body non-JSON).
        const res = await (
          ApiFetch.api.pendidikan.infosekolahpaud.jenjangpendidikan as any
        )["del"][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "jenjang pendidikan berhasil dihapus"
          );
          await jenjangPendidikan.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di res.error.value,
          // bukan res.data — baca keduanya agar pesan spesifik backend tetap tampil.
          const msg =
            res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus jenjang pendidikan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenjang pendidikan");
      } finally {
        jenjangPendidikan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...jenjangPendidikanDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/${id}`,
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
        console.error("Error loading jenjang pendidikan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = jenjangPendidikanForm.safeParse(jenjangPendidikan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        jenjangPendidikan.edit.loading = true;
        const response = await fetch(
          `/api/pendidikan/infosekolahpaud/jenjangpendidikan/${jenjangPendidikan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: jenjangPendidikan.edit.form.nama,
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
                `Gagal mengupdate jenjang pendidikan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui jenjang pendidikan"
            );
            await jenjangPendidikan.findMany.load();
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate jenjang pendidikan"
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
        console.error("Error updating jenjang pendidikan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate jenjang pendidikan"
        );
        return false;
      } finally {
        jenjangPendidikan.edit.loading = false;
      }
    },
    reset() {
      jenjangPendidikan.edit.id = "";
      jenjangPendidikan.edit.form = { ...jenjangPendidikanDefaultForm };
    },
  },
});

export default jenjangPendidikan;
