import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";
import { toast } from "react-toastify";
import { z } from "zod";

const templateDataBanjar = z.object({
  nama: z.string().min(1, "Nama banjar harus diisi"),
  penduduk: z.number().min(0, "Jumlah penduduk harus diisi"),
  kk: z.number().min(0, "Jumlah KK harus diisi"),
  miskin: z.number().min(0, "Jumlah penduduk miskin harus diisi"),
  tahun: z.number().min(2000, "Tahun harus diisi"),
});

const dataBanjar = proxy({
  create: {
    form: {
      nama: "",
      penduduk: 0,
      kk: 0,
      miskin: 0,
      tahun: new Date().getFullYear(),
    },
    loading: false,
    async create() {
      const cek = templateDataBanjar.safeParse(dataBanjar.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        dataBanjar.create.loading = true;
        const res = await ApiFetch.api.kependudukan.databanjar["create"].post(dataBanjar.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan data banjar");
            dataBanjar.create.form = { nama: "", penduduk: 0, kk: 0, miskin: 0, tahun: new Date().getFullYear() };
            dataBanjar.findMany.load();
            return id;
          }
        }
        toast.error("Gagal menambahkan data");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        dataBanjar.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", tahun = new Date().getFullYear()) => {
      dataBanjar.findMany.loading = true;
      dataBanjar.findMany.page = page;
      dataBanjar.findMany.search = search;

      try {
        const query: any = { page, limit, tahun };
        if (search) query.search = search;

        const res = await ApiFetch.api.kependudukan.databanjar["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          dataBanjar.findMany.data = res.data.data ?? [];
          dataBanjar.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          dataBanjar.findMany.data = [];
          dataBanjar.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch data banjar paginated:", err);
        dataBanjar.findMany.data = [];
        dataBanjar.findMany.totalPages = 1;
      } finally {
        dataBanjar.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as any | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kependudukan/databanjar/${id}`);
        if (res.ok) {
          const data = await res.json();
          dataBanjar.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data banjar:", res.statusText);
          dataBanjar.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data banjar:", error);
        dataBanjar.findUnique.data = null;
      }
    },
  },

  update: {
    id: "",
    form: {
      nama: "",
      penduduk: 0,
      kk: 0,
      miskin: 0,
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
        nama: this.form.nama,
        penduduk: this.form.penduduk,
        kk: this.form.kk,
        miskin: this.form.miskin,
        tahun: this.form.tahun,
      };

      const cek = templateDataBanjar.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kependudukan/databanjar/${id}`, {
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
        await dataBanjar.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data banjar");
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
        dataBanjar.delete.loading = true;

        const response = await fetch(
          `/api/kependudukan/databanjar/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data banjar berhasil dihapus");
          await dataBanjar.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus data banjar");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus data banjar");
      } finally {
        dataBanjar.delete.loading = false;
      }
    },
  },
});

export default dataBanjar;
