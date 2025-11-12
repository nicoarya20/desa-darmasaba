/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikSektorUnggulan = z.object({
  name: z.string().min(2, "Nama harus diisi"),
  description: z.string().min(2, "Deskripsi harus diisi"),
  value: z.number().min(1, "Nilai harus diisi"),
});

interface SektorUnggulanForm {
  id?: string;
  name: string;
  description: string;
  value: number;
}

const defaultForm: SektorUnggulanForm = {
  name: "",
  description: "",
  value: 0,
};

const grafikSektorUnggulan = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikSektorUnggulan.safeParse(
        grafikSektorUnggulan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikSektorUnggulan.create.loading = true;
        const res = await ApiFetch.api.ekonomi.sektourunggulandesa[
          "create"
        ].post(grafikSektorUnggulan.create.form);
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan");
            grafikSektorUnggulan.create.form = {
              name: "",
              description: "",
              value: 0,
            };
            grafikSektorUnggulan.findMany.load();
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikSektorUnggulan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.SektorUnggulanDesaGetPayload<{
          select: {
            id: true;
            name: true;
            description: true;
            value: true;
            createdAt: true;
            updatedAt: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      grafikSektorUnggulan.findMany.loading = true; // ✅ Akses langsung via nama path
      grafikSektorUnggulan.findMany.page = page;
      grafikSektorUnggulan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.sektourunggulandesa[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          grafikSektorUnggulan.findMany.data = res.data.data ?? [];
          grafikSektorUnggulan.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          grafikSektorUnggulan.findMany.data = [];
          grafikSektorUnggulan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch sektor unggulan desa paginated:", err);
        grafikSektorUnggulan.findMany.data = [];
        grafikSektorUnggulan.findMany.totalPages = 1;
      } finally {
        grafikSektorUnggulan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.SektorUnggulanDesaGetPayload<{
      select: {
        id: true;
        name: true;
        description: true;
        value: true;
        createdAt: true;
        updatedAt: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/sektourunggulandesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          grafikSektorUnggulan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikSektorUnggulan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik sektor unggulan desa:", error);
        grafikSektorUnggulan.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async byId() {
      // Method implementation if needed
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      const cek = templateGrafikSektorUnggulan.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/ekonomi/sektourunggulandesa/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await grafikSektorUnggulan.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik sektor unggulan desa");
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        grafikSektorUnggulan.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/sektourunggulandesa/del/${id}`,
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
            result.message || "Grafik sektor unggulan desa berhasil dihapus"
          );
          await grafikSektorUnggulan.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus grafik sektor unggulan desa"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus grafik sektor unggulan desa"
        );
      } finally {
        grafikSektorUnggulan.delete.loading = false;
      }
    },
  },
});
export default grafikSektorUnggulan;
