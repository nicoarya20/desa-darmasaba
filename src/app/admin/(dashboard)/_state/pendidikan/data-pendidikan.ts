/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDataPendidikan = z.object({
  name: z.string().min(1, "Data nama harus diisi"),
  jumlah: z.string().min(1, "Data jumlah harus diisi"),
});

type DataPendidikan = Prisma.DataPendidikanGetPayload<{
  select: {
    id: true;
    name: true;
    jumlah: true;
  };
}>;

const defaultForm: Omit<DataPendidikan, "id"> & { id?: string } = {
  name: "",
  jumlah: "",
};

const dataPendidikan = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateDataPendidikan.safeParse(dataPendidikan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        dataPendidikan.create.loading = true;
        const res = await ApiFetch.api.pendidikan.datapendidikan["create"].post(
          dataPendidikan.create.form
        );
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan");
            dataPendidikan.create.form = {
              name: "",
              jumlah: "",
            };
            // List di-refresh oleh halaman list saat mount (useShallowEffect),
            // jadi tidak perlu load() di sini — mencegah dua fetch balapan.
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        dataPendidikan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DataPendidikanGetPayload<{
          select: { id: true; name: true; jumlah: true };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      dataPendidikan.findMany.loading = true; // Use the full path to access the property
      dataPendidikan.findMany.page = page;
      dataPendidikan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.pendidikan.datapendidikan[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          dataPendidikan.findMany.data = res.data.data || [];
          dataPendidikan.findMany.total = res.data.total || 0;
          dataPendidikan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load data pendidikan:",
            res.data?.message
          );
          dataPendidikan.findMany.data = [];
          dataPendidikan.findMany.total = 0;
          dataPendidikan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading data pendidikan:", error);
        dataPendidikan.findMany.data = [];
        dataPendidikan.findMany.total = 0;
        dataPendidikan.findMany.totalPages = 1;
      } finally {
        dataPendidikan.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DataPendidikanGetPayload<{
      select: { id: true; name: true; jumlah: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/pendidikan/datapendidikan/${id}`);
        if (res.ok) {
          const data = await res.json();
          dataPendidikan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          dataPendidikan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading data pendidikan:", error);
        dataPendidikan.findUnique.data = null;
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
      const cek = templateDataPendidikan.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => (v.path as string[]).join("."))
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/pendidikan/datapendidikan/${id}`, {
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
        await dataPendidikan.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data data pendidikan:", error);
        toast.error("Gagal update data data pendidikan");
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
        dataPendidikan.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/datapendidikan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data berhasil dihapus");
          await dataPendidikan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus data");
        }
      } catch (error) {
        console.error("Gagal delete data pendidikan:", error);
        toast.error("Terjadi kesalahan saat menghapus data pendidikan");
      } finally {
        dataPendidikan.delete.loading = false;
      }
    },
  },
});
export default dataPendidikan;
