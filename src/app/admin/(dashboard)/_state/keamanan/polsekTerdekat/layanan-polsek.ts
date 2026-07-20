/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateFormLayananPolsek = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
});

const defaultFormLayananPolsek = {
  nama: "",
};

const layananPolsek = proxy({
  create: {
    form: { ...defaultFormLayananPolsek },
    loading: false,
    async create() {
      const cek = templateFormLayananPolsek.safeParse(
        layananPolsek.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        layananPolsek.create.loading = true;
        const res = await ApiFetch.api.keamanan["layananpolsek"][
          "create"
        ].post(layananPolsek.create.form);
        if (res.status === 200) {
          layananPolsek.findManyAll.load();
          return toast.success("Data Kategori Berita Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        layananPolsek.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.LayananPolsekGetPayload<{
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
      layananPolsek.findMany.loading = true;
      layananPolsek.findMany.page = page;
      layananPolsek.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.keamanan["layananpolsek"][
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          layananPolsek.findMany.data = res.data.data ?? [];
          layananPolsek.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          layananPolsek.findMany.data = [];
          layananPolsek.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch layanan polsek paginated:", err);
        layananPolsek.findMany.data = [];
        layananPolsek.findMany.totalPages = 1;
      } finally {
        layananPolsek.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: [] as Prisma.LayananPolsekGetPayload<{
      omit: { isActive: true };
    }>[],
    loading: false,

    async load() {
      this.loading = true;
      try {
        const res = await ApiFetch.api.keamanan["layananpolsek"][
          "findManyAll"
        ].get();

        if (res.status === 200 && res.data?.success) {
          this.data = (res.data.data ?? []).map((item: any) => ({
            id: String(item.id),
            nama: String(item.nama || ""),
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
          }));
        } else {
          this.data = [];
        }
      } catch (error) {
        console.error("Gagal fetch layanan polsek:", error);
        this.data = [];
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.LayananPolsekGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/layananpolsek/${id}`);
        if (res.ok) {
          const data = await res.json();
          layananPolsek.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          layananPolsek.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        layananPolsek.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        layananPolsek.delete.loading = true;

        const response = await fetch(
          `/api/keamanan/layananpolsek/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Data layanan polsek berhasil dihapus"
          );
          await layananPolsek.findManyAll.load();
        } else {
          toast.error(
            result?.message || "Gagal menghapus Data layanan polsek"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data layanan polsek");
      } finally {
        layananPolsek.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormLayananPolsek },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/keamanan/layananpolsek/${id}`, {
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading layanan polsek:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateFormLayananPolsek.safeParse(
        layananPolsek.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        layananPolsek.update.loading = true;

        const response = await fetch(
          `/api/keamanan/layananpolsek/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
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
          toast.success("Berhasil update data layanan polsek");
          await layananPolsek.findManyAll.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data layanan polsek"
          );
        }
      } catch (error) {
        console.error("Error updating data layanan polsek:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data layanan polsek"
        );
        return false;
      } finally {
        layananPolsek.update.loading = false;
      }
    },
    reset() {
      layananPolsek.update.id = "";
      layananPolsek.update.form = { ...defaultFormLayananPolsek };
    },
  },
});

export default layananPolsek;
