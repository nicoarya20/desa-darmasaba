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
  percentageChange: z.number().min(0, "Persentase perubahan harus diisi"),
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
  year: 0,
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
      const cek = templateJumlahPengngguran.safeParse(
        jumlahPengangguran.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
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
          const id = res.data?.data?.id;
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
    async load() {
      const res =
        await ApiFetch.api.ekonomi.jumlahpengangguran.detaildatapengangguran[
          "find-many"
        ].get();
      if (res.status === 200) {
        jumlahPengangguran.findMany.data = res.data?.data ?? [];
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

const templateRingkasanData = z.object({
  year: z.number().min(1, "Tahun harus diisi"),
  totalUnemployment: z.number().min(1, "Total pengangguran harus diisi"),
  educatedUnemployment: z
    .number()
    .min(1, "Pengangguran pendidikan harus diisi"),
  percentageEducatedOfTotal: z
    .number()
    .min(1, "Persentase pendidikan harus diisi"),
  productiveAgePopulation: z.number().min(1, "Populasi produktif harus diisi"),
  percentageProductiveOfTotal: z
    .number()
    .min(1, "Persentase produktif harus diisi"),
  percentageChangeFromPreviousYear: z
    .number()
    .min(1, "Persentase perubahan harus diisi"),
});

type RingkasanData = {
  year: number;
  totalUnemployment: number;
  educatedUnemployment: number;
  percentageEducatedOfTotal: number;
  productiveAgePopulation: number;
  percentageProductiveOfTotal: number;
  percentageChangeFromPreviousYear: number;
};

const ringkasanDataForm: RingkasanData = {
  year: 0,
  totalUnemployment: 0,
  educatedUnemployment: 0,
  percentageEducatedOfTotal: 0,
  productiveAgePopulation: 0,
  percentageProductiveOfTotal: 0,
  percentageChangeFromPreviousYear: 0,
};

const ringkasanData = proxy({
  create: {
    form: ringkasanDataForm,
    loading: false,
    async create() {
      const cek = templateRingkasanData.safeParse(ringkasanData.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        ringkasanData.create.loading = true;
        const res =
          await ApiFetch.api.ekonomi.jumlahpengangguran.ringkasandatapengangguran[
            "create"
          ].post(ringkasanData.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Success create");
            ringkasanData.create.form = { ...ringkasanDataForm };
            ringkasanData.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        ringkasanData.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.RingkasanDataPengangguranGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    async load() {
      const res =
        await ApiFetch.api.ekonomi.jumlahpengangguran.ringkasandatapengangguran[
          "find-many"
        ].get();
      if (res.status === 200) {
        ringkasanData.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.RingkasanDataPengangguranGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ekonomi/jumlahpengangguran/ringkasandatapengangguran/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          ringkasanData.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch ringkasanData:", res.statusText);
          ringkasanData.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching ringkasanData:", error);
        ringkasanData.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...ringkasanDataForm },
    loading: false,
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        year: this.form.year,
        totalUnemployment: this.form.totalUnemployment,
        educatedUnemployment: this.form.educatedUnemployment,
        percentageEducatedOfTotal: this.form.percentageEducatedOfTotal,
        productiveAgePopulation: this.form.productiveAgePopulation,
        percentageProductiveOfTotal: this.form.percentageProductiveOfTotal,
        percentageChangeFromPreviousYear:
          this.form.percentageChangeFromPreviousYear,
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
          `/api/ekonomi/jumlahpengangguran/ringkasandatapengangguran/${id}`,
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
        await ringkasanData.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data ringkasan data pengangguran");
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
        ringkasanData.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/jumlahpengangguran/ringkasandatapengangguran/del/${id}`,
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
            result.message || "Ringkasan data pengangguran berhasil dihapus"
          );
          await ringkasanData.findMany.load();
        } else {
          toast.error(
            result?.message || "Gagal menghapus ringkasan data pengangguran"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus ringkasan data pengangguran"
        );
      } finally {
        ringkasanData.delete.loading = false;
      }
    },
  },
});

const templateSedangMencariKerja = z.object({
  count: z.number().min(1, "Jumlah harus diisi"),
  percentageOfTotal: z.number().min(1, "Persentase harus diisi"),
  recordedDate: z.string().min(1, "Tanggal harus diisi"),
});

type SedangMencariKerja = {
  count: number;
  percentageOfTotal: number;
  recordedDate: string;
};

const sedangMencariKerjaForm: SedangMencariKerja = {
  count: 0,
  percentageOfTotal: 0,
  recordedDate: "",
};

const sedangMencariKerja = proxy({
  create: {
    form: sedangMencariKerjaForm,
    loading: false,
    async create() {
      const cek = templateSedangMencariKerja.safeParse(
        sedangMencariKerja.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        sedangMencariKerja.create.loading = true;
        const res =
          await ApiFetch.api.ekonomi.jumlahpengangguran.sedangmencarikerja[
            "create"
          ].post(sedangMencariKerja.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Success create");
            sedangMencariKerja.create.form = { ...sedangMencariKerjaForm };
            sedangMencariKerja.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        sedangMencariKerja.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.SedangMencariKerjaGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    async load() {
      const res =
        await ApiFetch.api.ekonomi.jumlahpengangguran.sedangmencarikerja[
          "find-many"
        ].get();
      if (res.status === 200) {
        sedangMencariKerja.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.SedangMencariKerjaGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ekonomi/jumlahpengangguran/sedangmencarikerja/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          sedangMencariKerja.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch sedangMencariKerja:", res.statusText);
          sedangMencariKerja.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching sedangMencariKerja:", error);
        sedangMencariKerja.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...sedangMencariKerjaForm },
    loading: false,
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        count: this.form.count,
        percentageOfTotal: this.form.percentageOfTotal,
        recordedDate: this.form.recordedDate,
      };

      const cek = templateSedangMencariKerja.safeParse(formData);
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
          `/api/ekonomi/jumlahpengangguran/sedangmencarikerja/${id}`,
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
        await sedangMencariKerja.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data sedang mencari kerja");
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
        sedangMencariKerja.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/jumlahpengangguran/sedangmencarikerja/del/${id}`,
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
            result.message || "Sedang mencari kerja berhasil dihapus"
          );
          await sedangMencariKerja.findMany.load();
        } else {
          toast.error(
            result?.message || "Gagal menghapus sedang mencari kerja"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus sedang mencari kerja");
      } finally {
        sedangMencariKerja.delete.loading = false;
      }
    },
  },
});

const jumlahPengangguranState = proxy({
  jumlahPengangguran,
  ringkasanData,
  sedangMencariKerja,
});

export default jumlahPengangguranState;
