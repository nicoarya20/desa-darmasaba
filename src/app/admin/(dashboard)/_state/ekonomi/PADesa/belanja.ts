/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateBelanja = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  value: z.number().int().positive("Nilai harus angka positif"),
});

const BelanjaDefaultForm = {
  name: "",
  value: 0,
};

const belanja = proxy({
  create: {
    form: { ...BelanjaDefaultForm },
    loading: false,
    async submit() {
      const cek = templateBelanja.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.belanja[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan Belanja");
          belanja.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan Belanja");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan Belanja");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...BelanjaDefaultForm };
    },
  },
  findMany: {
    data: [] as Array<{
      id: string;
      name: string;
      value: number;
    }>,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      belanja.findMany.loading = true;
      belanja.findMany.page = page;
      belanja.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.belanja[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          belanja.findMany.data = res.data.data ?? [];
          belanja.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          belanja.findMany.data = [];
          belanja.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch Belanja paginated:", err);
        belanja.findMany.data = [];
        belanja.findMany.totalPages = 1;
      } finally {
        belanja.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...BelanjaDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/belanja/${id}`,
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
            name: data.name,
            value: data.value,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading belanja:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateBelanja.safeParse(belanja.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        belanja.update.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/belanja/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              value: this.form.value,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update belanja");
          await belanja.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate belanja");
        }
      } catch (error) {
        console.error("Error updating belanja:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate belanja"
        );
        return false;
      } finally {
        belanja.update.loading = false;
      }
    },
    reset() {
      belanja.update.id = "";
      belanja.update.form = { ...BelanjaDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        belanja.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/belanja/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Belanja berhasil dihapus");
          await belanja.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus Belanja");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Belanja");
      } finally {
        belanja.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.BelanjaGetPayload<{
      select: { isActive: boolean };
    }> | null,
    async load(id: string) {
      const res = await fetch(`/api/ekonomi/pendapatanaslidesa/belanja/${id}`);
      if (res.ok) {
        const json = await res.json();
        belanja.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? true,
            }
          : null;
      } else {
        belanja.findUnique.data = null;
      }
    },
  },
});

export default belanja;
