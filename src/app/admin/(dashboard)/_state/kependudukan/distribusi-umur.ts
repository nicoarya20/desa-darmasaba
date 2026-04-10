import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";
import { toast } from "react-toastify";
import { z } from "zod";

const templateDistribusiUmur = z.object({
  rentangUmur: z.string().min(1, "Rentang umur harus diisi"),
  jumlah: z.number().min(0, "Jumlah harus diisi"),
  tahun: z.number().min(2000, "Tahun harus diisi"),
});

const distribusiUmur = proxy({
  create: {
    form: {
      rentangUmur: "",
      jumlah: 0,
      tahun: new Date().getFullYear(),
    },
    loading: false,
    async create() {
      const cek = templateDistribusiUmur.safeParse(distribusiUmur.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        distribusiUmur.create.loading = true;
        const res = await ApiFetch.api.kependudukan.distribusiumur["create"].post(distribusiUmur.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan distribusi umur");
            distribusiUmur.create.form = { rentangUmur: "", jumlah: 0, tahun: new Date().getFullYear() };
            distribusiUmur.findMany.load();
            return id;
          }
        }
        toast.error("Gagal menambahkan data");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        distribusiUmur.create.loading = false;
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
      distribusiUmur.findMany.loading = true;
      distribusiUmur.findMany.page = page;
      distribusiUmur.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (tahun) query.tahun = tahun;
        if (search) query.search = search;

        const res = await ApiFetch.api.kependudukan.distribusiumur["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          distribusiUmur.findMany.data = res.data.data ?? [];
          distribusiUmur.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          distribusiUmur.findMany.data = [];
          distribusiUmur.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch distribusi umur paginated:", err);
        distribusiUmur.findMany.data = [];
        distribusiUmur.findMany.totalPages = 1;
      } finally {
        distribusiUmur.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as any | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kependudukan/distribusiumur/${id}`);
        if (res.ok) {
          const data = await res.json();
          distribusiUmur.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch distribusi umur:", res.statusText);
          distribusiUmur.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching distribusi umur:", error);
        distribusiUmur.findUnique.data = null;
      }
    },
  },

  update: {
    id: "",
    form: {
      rentangUmur: "",
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
        rentangUmur: this.form.rentangUmur,
        jumlah: this.form.jumlah,
        tahun: this.form.tahun,
      };

      const cek = templateDistribusiUmur.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kependudukan/distribusiumur/${id}`, {
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
        await distribusiUmur.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data distribusi umur");
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
        distribusiUmur.delete.loading = true;

        const response = await fetch(
          `/api/kependudukan/distribusiumur/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Distribusi umur berhasil dihapus");
          await distribusiUmur.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus distribusi umur");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus distribusi umur");
      } finally {
        distribusiUmur.delete.loading = false;
      }
    },
  },
});

export default distribusiUmur;
