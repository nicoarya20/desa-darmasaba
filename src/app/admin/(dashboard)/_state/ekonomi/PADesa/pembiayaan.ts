/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePembiayaan = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  value: z.number().int().positive("Nilai harus angka positif"),
});

const PembiayaanDefaultForm = {
  name: "",
  value: 0,
};

const pembiayaan = proxy({
  create: {
    form: { ...PembiayaanDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePembiayaan.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pembiayaan[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan Pembiayaan");
          pembiayaan.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan Pembiayaan");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Gagal menambahkan Pembiayaan");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...PembiayaanDefaultForm };
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
      pembiayaan.findMany.loading = true;
      pembiayaan.findMany.page = page;
      pembiayaan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.pendapatanaslidesa.pembiayaan[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pembiayaan.findMany.data = res.data.data ?? [];
          pembiayaan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          pembiayaan.findMany.data = [];
          pembiayaan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch Pembiayaan paginated:", err);
        pembiayaan.findMany.data = [];
        pembiayaan.findMany.totalPages = 1;
      } finally {
        pembiayaan.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...PembiayaanDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pembiayaan/${id}`,
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
        console.error("Error loading pembiayaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templatePembiayaan.safeParse(pembiayaan.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pembiayaan.update.loading = true;
        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pembiayaan/${this.id}`,
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
          toast.success("Berhasil update pembiayaan");
          await pembiayaan.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate pembiayaan");
        }
      } catch (error) {
        console.error("Error updating pembiayaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate pembiayaan"
        );
        return false;
      } finally {
        pembiayaan.update.loading = false;
      }
    },
    reset() {
      pembiayaan.update.id = "";
      pembiayaan.update.form = { ...PembiayaanDefaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pembiayaan.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/pendapatanaslidesa/pembiayaan/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pembiayaan berhasil dihapus");
          await pembiayaan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus Pembiayaan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Pembiayaan");
      } finally {
        pembiayaan.delete.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PembiayaanGetPayload<{
      select: { isActive: boolean };
    }> | null,
    async load(id: string) {
      const res = await fetch(
        `/api/ekonomi/pendapatanaslidesa/pembiayaan/${id}`
      );
      if (res.ok) {
        const json = await res.json();
        pembiayaan.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? true,
            }
          : null;
      } else {
        pembiayaan.findUnique.data = null;
      }
    },
  },
});

export default pembiayaan;
