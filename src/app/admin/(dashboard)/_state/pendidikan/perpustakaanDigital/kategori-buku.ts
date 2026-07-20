/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKategoriBuku = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriBuku = {
  name: "",
};

const kategoriBuku = proxy({
  create: {
    form: { ...defaultKategoriBuku },
    loading: false,
    async create() {
      const cek = templateKategoriBuku.safeParse(kategoriBuku.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriBuku.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
            "create"
          ].post(kategoriBuku.create.form);
        if (res.status === 200) {
          kategoriBuku.findMany.load();
          return toast.success("Data Kategori Buku Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        kategoriBuku.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kategoriBuku.findMany.loading = true;
      kategoriBuku.findMany.page = page;
      kategoriBuku.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
            "findMany"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kategoriBuku.findMany.data = res.data.data ?? [];
          kategoriBuku.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kategoriBuku.findMany.data = [];
          kategoriBuku.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch data kategori buku paginated:", err);
        kategoriBuku.findMany.data = [];
        kategoriBuku.findMany.totalPages = 1;
      } finally {
        kategoriBuku.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: [] as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    loading: false,
    search: "",
    load: async (search = "") => {
      kategoriBuku.findManyAll.loading = true;
      kategoriBuku.findManyAll.search = search;
      try {
        const query: any = { search };
        if (search) query.search = search;

        const res = await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
          "findManyAll"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kategoriBuku.findManyAll.data = res.data.data || [];
        } else {
          console.error("Failed to load kategori buku:", res.data?.message);
          kategoriBuku.findManyAll.data = [];
        }
      } catch (error) {
        console.error("Error loading kategori buku:", error);
        kategoriBuku.findManyAll.data = [];
      } finally {
        kategoriBuku.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          kategoriBuku.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriBuku.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriBuku.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriBuku.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/del/${id}`,
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
            result.message || "Data Kategori Buku berhasil dihapus"
          );
          await kategoriBuku.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus Data Kategori Buku");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Kategori Buku");
      } finally {
        kategoriBuku.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriBuku },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${id}`,
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori buku:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriBuku.safeParse(kategoriBuku.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriBuku.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
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
          toast.success("Berhasil update data kategori buku");
          await kategoriBuku.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update data kategori buku");
        }
      } catch (error) {
        console.error("Error updating data kategori buku:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori buku"
        );
        return false;
      } finally {
        kategoriBuku.update.loading = false;
      }
    },
    reset() {
      kategoriBuku.update.id = "";
      kategoriBuku.update.form = { ...defaultKategoriBuku };
    },
  },
});

export default kategoriBuku;
