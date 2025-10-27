/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateJumlahPengngguran = z.object({
  month: z.string().min(1, "Bulan harus diisi"),
  year: z.number().min(1, "Tahun harus diisi"),
  totalUnemployment: z.number().min(1, "Total pengangguran harus diisi"),
  educatedUnemployment: z
    .number()
    .min(1, "Pengangguran pendidikan harus diisi"),
  uneducatedUnemployment: z
    .number()
    .min(1, "Pengangguran tidak pendidikan harus diisi"),
    percentageChange: z.number({ invalid_type_error: "Persentase perubahan harus angka" }),

});

type JumlahPengangguran = {
  month: string;
  year: number;
  totalUnemployment: number;
  educatedUnemployment: number;
  uneducatedUnemployment: number;
  percentageChange: number;
};

const jumlahPengangguranForm: JumlahPengangguran = {
  month: "",
  year: new Date().getFullYear(), // Default to current year
  totalUnemployment: 0,
  educatedUnemployment: 0,
  uneducatedUnemployment: 0,
  percentageChange: 0,
};

const jumlahPengangguran = proxy({
  findByMonthYear: {
    data: null as any,
    loading: false,
    load: async ({ month, year }: { month: string; year: number }) => {
      jumlahPengangguran.findByMonthYear.loading = true;
      try {
        const res = await fetch(
          `/api/ekonomi/jumlahpengangguran/detaildatapengangguran/month/${month}/year/${year}`
        );
        const json = await res.json();
        jumlahPengangguran.findByMonthYear.data = json.data;
        return json.data;
      } catch (err) {
        console.error("Gagal ambil data bulan/tahun:", err);
      } finally {
        jumlahPengangguran.findByMonthYear.loading = false;
      }
    },
  },
  create: {
    form: jumlahPengangguranForm,
    loading: false,
    async create() {
      // Ensure all number fields are actual numbers
      const formData = {
        ...jumlahPengangguran.create.form,
        year: Number(jumlahPengangguran.create.form.year) || new Date().getFullYear(),
        totalUnemployment: Number(jumlahPengangguran.create.form.totalUnemployment) || 0,
        educatedUnemployment: Number(jumlahPengangguran.create.form.educatedUnemployment) || 0,
        uneducatedUnemployment: Number(jumlahPengangguran.create.form.uneducatedUnemployment) || 0,
        percentageChange: Number(jumlahPengangguran.create.form.percentageChange) || 0,
      };

      const cek = templateJumlahPengngguran.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")} (${v.message})`)
          .join("\n")}]`;
        toast.error(err);
        return null;
      }
      try {
        jumlahPengangguran.create.loading = true;
        const res =
          await ApiFetch.api.ekonomi.jumlahpengangguran.detaildatapengangguran[
            "create"
          ].post(jumlahPengangguran.create.form);

        if (res.status === 200) {
          const id = res.data?.id;
          if (id) {
            toast.success("Success create");
            jumlahPengangguran.create.form = { ...jumlahPengangguranForm };
            jumlahPengangguran.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        jumlahPengangguran.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.DetailDataPengangguranGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
      page: 1,
      totalPages: 1,
      loading: false,
      search: "",
      load: async (page = 1, limit = 10, search = "") => {
        jumlahPengangguran.findMany.loading = true; // ✅ Akses langsung via nama path
        jumlahPengangguran.findMany.page = page;
        jumlahPengangguran.findMany.search = search;
  
        try {
          const query: any = { page, limit };
          if (search) query.search = search;
  
          const res = await ApiFetch.api.ekonomi.jumlahpengangguran.detaildatapengangguran[
            "find-many"
          ].get({ query });
  
          if (res.status === 200 && res.data?.success) {
            jumlahPengangguran.findMany.data = res.data.data ?? [];
            jumlahPengangguran.findMany.totalPages =
              res.data.totalPages ?? 1;
          } else {
            jumlahPengangguran.findMany.data = [];
            jumlahPengangguran.findMany.totalPages = 1;
          }
        } catch (err) {
          console.error("Gagal fetch jumlah pengangguran paginated:", err);
          jumlahPengangguran.findMany.data = [];
          jumlahPengangguran.findMany.totalPages = 1;
        } finally {
          jumlahPengangguran.findMany.loading = false;
        }
      },
    },

  findUnique: {
    data: null as Prisma.DetailDataPengangguranGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ekonomi/jumlahpengangguran/detaildatapengangguran/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          jumlahPengangguran.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch jumlahPengangguran:", res.statusText);
          jumlahPengangguran.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching jumlahPengangguran:", error);
        jumlahPengangguran.findUnique.data = null;
      }
    },
  },

  update: {
    id: "",
    form: { ...jumlahPengangguranForm },
    loading: false,
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        month: this.form.month,
        year: this.form.year,
        totalUnemployment: this.form.totalUnemployment,
        educatedUnemployment: this.form.educatedUnemployment,
        uneducatedUnemployment: this.form.uneducatedUnemployment,
        percentageChange: this.form.percentageChange,
      };

      const cek = templateJumlahPengngguran.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(
          `/api/ekonomi/jumlahpengangguran/detaildatapengangguran/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const result = await res.json();

        if (!res.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }

        toast.success("Berhasil update data!");
        await jumlahPengangguran.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data jumlah pengangguran");
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
        jumlahPengangguran.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/jumlahpengangguran/detaildatapengangguran/del/${id}`,
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
            result.message || "Jumlah pengangguran berhasil dihapus"
          );
          await jumlahPengangguran.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus jumlah pengangguran");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jumlah pengangguran");
      } finally {
        jumlahPengangguran.delete.loading = false;
      }
    },
  },
});

const jumlahPengangguranState = proxy({
  jumlahPengangguran,
});

export default jumlahPengangguranState;
