/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKeunggulanProgram = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
});

const defaultKeunggulanProgram = {
  judul: "",
  deskripsi: "",
};

const keunggulanProgram = proxy({
  create: {
    form: { ...defaultKeunggulanProgram },
    loading: false,
    async create() {
      const cek = templateKeunggulanProgram.safeParse(
        keunggulanProgram.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        keunggulanProgram.create.loading = true;
        const res = await ApiFetch.api.pendidikan.beasiswa.keunggulanprogram[
          "create"
        ].post(keunggulanProgram.create.form);
        if (res.status === 200) {
          keunggulanProgram.findMany.load();
          return toast.success("Data Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        keunggulanProgram.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KeunggulanProgramGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      keunggulanProgram.findMany.loading = true;
      keunggulanProgram.findMany.page = page;
      keunggulanProgram.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.pendidikan.beasiswa.keunggulanprogram[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          keunggulanProgram.findMany.data = res.data.data ?? [];
          keunggulanProgram.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          keunggulanProgram.findMany.data = [];
          keunggulanProgram.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch keunggulan program paginated:", err);
        keunggulanProgram.findMany.data = [];
        keunggulanProgram.findMany.totalPages = 1;
      } finally {
        keunggulanProgram.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KeunggulanProgramGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/beasiswa/keunggulanprogram/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          keunggulanProgram.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          keunggulanProgram.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        keunggulanProgram.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        keunggulanProgram.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/beasiswa/keunggulanprogram/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Keunggulan Program berhasil dihapus");
          await keunggulanProgram.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus keunggulan program");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus keunggulan program");
      } finally {
        keunggulanProgram.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKeunggulanProgram },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/beasiswa/keunggulanprogram/${id}`,
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading keunggulan program:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKeunggulanProgram.safeParse(
        keunggulanProgram.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        keunggulanProgram.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/beasiswa/keunggulanprogram/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsi: this.form.deskripsi,
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
          toast.success("Berhasil update keunggulan program");
          await keunggulanProgram.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update keunggulan program");
        }
      } catch (error) {
        console.error("Error updating keunggulan program:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update keunggulan program"
        );
        return false;
      } finally {
        keunggulanProgram.update.loading = false;
      }
    },
    reset() {
      keunggulanProgram.update.id = "";
      keunggulanProgram.update.form = { ...defaultKeunggulanProgram };
    },
  },
});

export default keunggulanProgram;
