/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePendapatan = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  value: z.number().int().positive("Nilai harus angka positif"),
});

const PendapatanDefaultForm = {
  name: "",
  value: 0,
};

const pendapatan = proxy({
  create: {
    form: { ...PendapatanDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePendapatan.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res =
          await ApiFetch.api.ekonomi.pendapatanaslidesa.pendapatanasli[
            "create"
          ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan Pendapatan Asli");
          pendapatan.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan Pendapatan Asli");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan Pendapatan Asli");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...PendapatanDefaultForm };
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pendapatan.findMany.loading = true;
      pendapatan.findMany.page = page;
      pendapatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pendapatanasli[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pendapatan.findMany.data = res.data.data ?? [];
          pendapatan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          pendapatan.findMany.data = [];
          pendapatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch pendapatan asli desa paginated:", err);
        pendapatan.findMany.data = [];
        pendapatan.findMany.totalPages = 1;
      } finally {
        pendapatan.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...PendapatanDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pendapatanasli/${id}`,
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
        console.error("Error loading pendapatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templatePendapatan.safeParse(pendapatan.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pendapatan.update.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pendapatanasli/${this.id}`,
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
          toast.success("Berhasil update pendapatan");
          await pendapatan.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate pendapatan");
        }
      } catch (error) {
        console.error("Error updating pendapatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pendapatan"
        );
        return false;
      } finally {
        pendapatan.update.loading = false;
      }
    },
    reset() {
      pendapatan.update.id = "";
      pendapatan.update.form = { ...PendapatanDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pendapatan.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pendapatanasli/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pendapatan Asli berhasil dihapus");
          await pendapatan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus Pendapatan Asli");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Pendapatan Asli");
      } finally {
        pendapatan.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PendapatanGetPayload<{
      select: { isActive: boolean };
    }> | null,
    async load(id: string) {
      const res = await fetch(
        `/api/ekonomi/pendapatanaslidesa/pendapatanasli/${id}`
      );
      if (res.ok) {
        const json = await res.json();
        pendapatan.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? true,
            }
          : null;
      } else {
        pendapatan.findUnique.data = null;
      }
    },
  },
});

export default pendapatan;
