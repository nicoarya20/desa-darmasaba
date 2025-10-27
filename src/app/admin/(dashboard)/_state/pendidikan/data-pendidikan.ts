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
            toast.success("Success create");
            dataPendidikan.create.form = {
              name: "",
              jumlah: "",
            };
            dataPendidikan.findMany.load();
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
    loading: false,
    async load() {
      const res = await ApiFetch.api.pendidikan.datapendidikan[
        "findMany"
      ].get();
      if (res.status === 200) {
        dataPendidikan.findMany.data = res.data?.data ?? [];
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
