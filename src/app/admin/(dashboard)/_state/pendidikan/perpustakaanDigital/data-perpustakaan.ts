/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDataPerpustakaan = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  imageId: z.string().min(1, "Image ID harus diisi"),
  kategoriId: z.string().min(1, "Kategori ID harus diisi"),
});

const defaultDataPerpustakaan = {
  judul: "",
  deskripsi: "",
  imageId: "",
  kategoriId: "",
};

const dataPerpustakaan = proxy({
  create: {
    form: { ...defaultDataPerpustakaan },
    loading: false,
    async create() {
      const cek = templateDataPerpustakaan.safeParse(
        dataPerpustakaan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        dataPerpustakaan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "create"
          ].post(dataPerpustakaan.create.form);
        if (res.status === 200) {
          dataPerpustakaan.findMany.load();
          return toast.success("Data Data Perpustakaan Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        dataPerpustakaan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DataPerpustakaanGetPayload<{
          include: {
            image: true;
            kategori: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", kategori = "") => {
      const startTime = Date.now();
      dataPerpustakaan.findMany.loading = true;
      dataPerpustakaan.findMany.page = page;
      dataPerpustakaan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "findMany"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          dataPerpustakaan.findMany.data = res.data.data ?? [];
          dataPerpustakaan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          dataPerpustakaan.findMany.data = [];
          dataPerpustakaan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch data perpustakaan paginated:", err);
        dataPerpustakaan.findMany.data = [];
        dataPerpustakaan.findMany.totalPages = 1;
      } finally {
        // pastikan minimal 300ms sebelum loading = false (biar UX smooth)
        const elapsed = Date.now() - startTime;
        const minDelay = 300;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;

        setTimeout(() => {
          dataPerpustakaan.findMany.loading = false;
        }, delay);
      }
    },
  },
  findManyAll: {
    data: null as
      | Prisma.DataPerpustakaanGetPayload<{
          include: {
            image: true;
            kategori: true;
          };
        }>[]
      | null,
    loading: false,
    search: "",
    load: async (search = "", kategori = "") => {
      dataPerpustakaan.findMany.loading = true;
      dataPerpustakaan.findMany.search = search;

      try {
        const query: any = {};
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;

        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "findManyAll"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          dataPerpustakaan.findManyAll.data = res.data.data ?? [];
        } else {
          dataPerpustakaan.findManyAll.data = [];
        }
      } catch (err) {
        console.error("Gagal fetch data perpustakaan paginated:", err);
        dataPerpustakaan.findManyAll.data = [];
      } finally {
        dataPerpustakaan.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DataPerpustakaanGetPayload<{
      include: {
        kategori: true;
        image: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          dataPerpustakaan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          dataPerpustakaan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        dataPerpustakaan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        dataPerpustakaan.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data Perpustakaan berhasil dihapus");
          await dataPerpustakaan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus Data Perpustakaan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Perpustakaan");
      } finally {
        dataPerpustakaan.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultDataPerpustakaan },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${id}`,
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
            kategoriId: data.kategoriId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading perpustakaan digital:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateDataPerpustakaan.safeParse(
        dataPerpustakaan.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        dataPerpustakaan.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
              kategoriId: this.form.kategoriId,
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
          toast.success("Berhasil update data perpustakaan digital");
          await dataPerpustakaan.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data perpustakaan digital"
          );
        }
      } catch (error) {
        console.error("Error updating data perpustakaan digital:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data perpustakaan digital"
        );
        return false;
      } finally {
        dataPerpustakaan.update.loading = false;
      }
    },
    reset() {
      dataPerpustakaan.update.id = "";
      dataPerpustakaan.update.form = { ...defaultDataPerpustakaan };
    },
  },
});

export default dataPerpustakaan;
