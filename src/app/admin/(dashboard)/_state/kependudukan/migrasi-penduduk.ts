import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";
import { toast } from "react-toastify";
import { z } from "zod";

const templateMigrasiPenduduk = z.object({
  jenis: z.string().min(1, "Jenis migrasi harus diisi"),
  nama: z.string().min(1, "Nama harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  asalTujuan: z.string().min(1, "Asal/Tujuan harus diisi"),
  alasan: z.string().optional(),
  jenisKelamin: z.string().optional(),
});

const migrasiPenduduk = proxy({
  create: {
    form: {
      jenis: "",
      nama: "",
      tanggal: "",
      asalTujuan: "",
      alasan: "",
      jenisKelamin: "",
    },
    loading: false,
    async create() {
      const cek = templateMigrasiPenduduk.safeParse(migrasiPenduduk.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        migrasiPenduduk.create.loading = true;
        const res = await ApiFetch.api.kependudukan.migrasipenduduk["create"].post(migrasiPenduduk.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan data migrasi penduduk");
            migrasiPenduduk.create.form = { jenis: "", nama: "", tanggal: "", asalTujuan: "", alasan: "", jenisKelamin: "" };
            migrasiPenduduk.findMany.load();
            return id;
          }
        }
        toast.error("Gagal menambahkan data");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        migrasiPenduduk.create.loading = false;
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
      migrasiPenduduk.findMany.loading = true;
      migrasiPenduduk.findMany.page = page;
      migrasiPenduduk.findMany.search = search;

      try {
        const query: any = { page, limit, tahun };
        if (search) query.search = search;

        const res = await ApiFetch.api.kependudukan.migrasipenduduk["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          migrasiPenduduk.findMany.data = res.data.data ?? [];
          migrasiPenduduk.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          migrasiPenduduk.findMany.data = [];
          migrasiPenduduk.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch migrasi penduduk paginated:", err);
        migrasiPenduduk.findMany.data = [];
        migrasiPenduduk.findMany.totalPages = 1;
      } finally {
        migrasiPenduduk.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as any | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kependudukan/migrasipenduduk/${id}`);
        if (res.ok) {
          const data = await res.json();
          migrasiPenduduk.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch migrasi penduduk:", res.statusText);
          migrasiPenduduk.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching migrasi penduduk:", error);
        migrasiPenduduk.findUnique.data = null;
      }
    },
  },

  update: {
    id: "",
    form: {
      jenis: "",
      nama: "",
      tanggal: "",
      asalTujuan: "",
      alasan: "",
      jenisKelamin: "",
    },
    loading: false,
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        jenis: this.form.jenis,
        nama: this.form.nama,
        tanggal: this.form.tanggal,
        asalTujuan: this.form.asalTujuan,
        alasan: this.form.alasan,
        jenisKelamin: this.form.jenisKelamin,
      };

      const cek = templateMigrasiPenduduk.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kependudukan/migrasipenduduk/${id}`, {
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
        await migrasiPenduduk.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data migrasi penduduk");
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
        migrasiPenduduk.delete.loading = true;

        const response = await fetch(
          `/api/kependudukan/migrasipenduduk/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data migrasi penduduk berhasil dihapus");
          await migrasiPenduduk.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus data migrasi penduduk");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus data migrasi penduduk");
      } finally {
        migrasiPenduduk.delete.loading = false;
      }
    },
  },
});

export default migrasiPenduduk;
