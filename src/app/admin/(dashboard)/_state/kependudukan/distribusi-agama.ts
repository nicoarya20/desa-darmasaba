import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";
import { toast } from "react-toastify";
import { z } from "zod";

const templateDistribusiAgama = z.object({
  agama: z.string().min(1, "Agama harus diisi"),
  jumlah: z.number().min(0, "Jumlah harus diisi"),
  tahun: z.number().min(2000, "Tahun harus diisi"),
});

const distribusiAgama = proxy({
  create: {
    form: {
      agama: "",
      jumlah: 0,
      tahun: new Date().getFullYear(),
    },
    loading: false,
    async create() {
      const cek = templateDistribusiAgama.safeParse(distribusiAgama.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        distribusiAgama.create.loading = true;
        const res = await ApiFetch.api.kependudukan.distribusiagama["create"].post(distribusiAgama.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan distribusi agama");
            distribusiAgama.create.form = { agama: "", jumlah: 0, tahun: new Date().getFullYear() };
            distribusiAgama.findMany.load();
            return id;
          }
        }
        toast.error("Gagal menambahkan data");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        distribusiAgama.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", tahun?: number) => {
      distribusiAgama.findMany.loading = true;
      distribusiAgama.findMany.page = page;
      distribusiAgama.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (tahun) query.tahun = tahun;
        if (search) query.search = search;

        const res = await ApiFetch.api.kependudukan.distribusiagama["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          distribusiAgama.findMany.data = res.data.data ?? [];
          distribusiAgama.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          distribusiAgama.findMany.data = [];
          distribusiAgama.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch distribusi agama paginated:", err);
        distribusiAgama.findMany.data = [];
        distribusiAgama.findMany.totalPages = 1;
      } finally {
        distribusiAgama.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as any | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kependudukan/distribusiagama/${id}`);
        if (res.ok) {
          const data = await res.json();
          distribusiAgama.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch distribusiAgama:", res.statusText);
          distribusiAgama.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching distribusiAgama:", error);
        distribusiAgama.findUnique.data = null;
      }
    },
  },

  update: {
    id: "",
    form: {
      agama: "",
      jumlah: 0,
      tahun: new Date().getFullYear(),
    },
    loading: false,
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        agama: this.form.agama,
        jumlah: this.form.jumlah,
        tahun: this.form.tahun,
      };

      const cek = templateDistribusiAgama.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kependudukan/distribusiagama/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await res.json();

        if (!res.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }

        toast.success("Berhasil update data!");
        await distribusiAgama.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data distribusi agama");
        throw error;
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
        distribusiAgama.delete.loading = true;

        const response = await fetch(
          `/api/kependudukan/distribusiagama/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Distribusi agama berhasil dihapus");
          await distribusiAgama.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus distribusi agama");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus distribusi agama");
      } finally {
        distribusiAgama.delete.loading = false;
      }
    },
  },
});

export default distribusiAgama;
