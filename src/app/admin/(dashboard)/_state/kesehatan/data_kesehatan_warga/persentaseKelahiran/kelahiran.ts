/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKelahiran = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  tanggal: z.string().min(4, "Tahun harus diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
});

const defaultKelahiran = {
  nama: "",
  tanggal: "",
  jenisKelamin: "",
  alamat: "",
};

const kelahiran = proxy({
  create: {
    form: { ...defaultKelahiran },
    loading: false,
    async create() {
      const cek = templateKelahiran.safeParse(kelahiran.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kelahiran.create.loading = true;
        const res = await ApiFetch.api.kesehatan.kelahiran["create"].post(
          kelahiran.create.form
        );
        if (res.status === 200) {
          kelahiran.findMany.load();
          return toast.success("Kelahiran berhasil disimpan!");
        }

        return toast.error("Gagal menyimpan kelahiran");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        kelahiran.create.loading = false;
      }
    },
    resetForm() {
      kelahiran.create.form = { ...defaultKelahiran };
    },
  },
  findMany: {
    data: null as
      | Prisma.KelahiranGetPayload<{
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
      kelahiran.findMany.loading = true;
      kelahiran.findMany.page = page;
      kelahiran.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.kelahiran["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kelahiran.findMany.data = res.data.data ?? [];
          kelahiran.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kelahiran.findMany.data = [];
          kelahiran.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kelahiran paginated:", err);
        kelahiran.findMany.data = [];
        kelahiran.findMany.totalPages = 1;
      } finally {
        kelahiran.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KelahiranGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/kelahiran/${id}`);
        if (res.ok) {
          const data = await res.json();
          kelahiran.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch kelahiran:", res.statusText);
          kelahiran.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching kelahiran:", error);
        kelahiran.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kelahiran.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body (hindari 400 parse Elysia) & content-type aware saat parse
        // respons (hindari SyntaxError bila body non-JSON).
        const res = await (ApiFetch.api.kesehatan as any).kelahiran["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Kelahiran berhasil dihapus");
          await kelahiran.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kelahiran");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kelahiran");
      } finally {
        kelahiran.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultKelahiran },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/kesehatan/kelahiran/${id}`, {
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading data kelahiran:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateKelahiran.safeParse(kelahiran.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kelahiran.edit.loading = true;

        const response = await fetch(`/api/kesehatan/kelahiran/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: this.form.nama,
            tanggal: this.form.tanggal,
            jenisKelamin: this.form.jenisKelamin,
            alamat: this.form.alamat,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update data kelahiran");
          await kelahiran.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update data kelahiran");
        }
      } catch (error) {
        console.error("Error updating data kelahiran:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kelahiran"
        );
        return false;
      } finally {
        kelahiran.edit.loading = false;
      }
    },

    reset() {
      kelahiran.edit.id = "";
      kelahiran.edit.form = { ...defaultKelahiran };
    },
  },
});

export default kelahiran;
