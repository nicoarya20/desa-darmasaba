/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateJumlahPendudukMiskin = z.object({
  year: z.number().min(1, "Data tahun harus diisi"),
  totalPoorPopulation: z
    .number()
    .min(1, "Data total penduduk miskin harus diisi"),
});

type JumlahPendudukMiskin = Prisma.GrafikJumlahPendudukMiskinGetPayload<{
  select: {
    id: true;
    year: true;
    totalPoorPopulation: true;
  };
}>;

const defaultForm: Omit<JumlahPendudukMiskin, "id"> & { id?: string } = {
  year: 0,
  totalPoorPopulation: 0,
};

const jumlahPendudukMiskin = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateJumlahPendudukMiskin.safeParse(
        jumlahPendudukMiskin.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        jumlahPendudukMiskin.create.loading = true;
        const res = await ApiFetch.api.ekonomi.jumlahpendudukmiskin[
          "create"
        ].post(jumlahPendudukMiskin.create.form);
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan");
            jumlahPendudukMiskin.create.form = {
              year: 0,
              totalPoorPopulation: 0,
            };
            jumlahPendudukMiskin.findMany.load();
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        jumlahPendudukMiskin.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikJumlahPendudukMiskinGetPayload<{
          select: { id: true; year: true; totalPoorPopulation: true };
        }>[]
      | null,
      page: 1,
      totalPages: 1,
      loading: false,
      search: "",
     load: async (page = 1, limit = 10, search = "") => {
        jumlahPendudukMiskin.findMany.loading = true; // ✅ Akses langsung via nama path
        jumlahPendudukMiskin.findMany.page = page;
        jumlahPendudukMiskin.findMany.search = search;
    
        try {
          const query: any = { page, limit };
          if (search) query.search = search;
      
          const res = await ApiFetch.api.ekonomi.jumlahpendudukmiskin["find-many"].get({ query });
      
          if (res.status === 200 && res.data?.success) {
            jumlahPendudukMiskin.findMany.data = res.data.data ?? [];
            jumlahPendudukMiskin.findMany.totalPages = res.data.totalPages ?? 1;
          } else {
            jumlahPendudukMiskin.findMany.data = [];
            jumlahPendudukMiskin.findMany.totalPages = 1;
          }
        } catch (err) {
          console.error("Gagal fetch jumlah penduduk miskin paginated:", err);
          jumlahPendudukMiskin.findMany.data = [];
          jumlahPendudukMiskin.findMany.totalPages = 1;
        } finally {
          jumlahPendudukMiskin.findMany.loading = false;
        }
      },
    },
  findUnique: {
    data: null as Prisma.GrafikJumlahPendudukMiskinGetPayload<{
      select: { id: true; year: true; totalPoorPopulation: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/jumlahpendudukmiskin/${id}`);
        if (res.ok) {
          const data = await res.json();
          jumlahPendudukMiskin.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jumlahPendudukMiskin.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik jumlah penduduk miskin:", error);
        jumlahPendudukMiskin.findUnique.data = null;
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
      const cek = templateJumlahPendudukMiskin.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => (v.path as string[]).join("."))
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/ekonomi/jumlahpendudukmiskin/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await jumlahPendudukMiskin.findMany.load();
        return result.data;
      } catch (error) {
        console.error(
          "Error update data grafik jumlah penduduk miskin:",
          error
        );
        toast.error("Gagal update data grafik jumlah penduduk miskin");
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
        jumlahPendudukMiskin.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/jumlahpendudukmiskin/del/${id}`,
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
            result.message || "Grafik jumlah penduduk miskin berhasil dihapus"
          );
          await jumlahPendudukMiskin.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus grafik jumlah penduduk miskin"
          );
        }
      } catch (error) {
        console.error("Gagal delete grafik jumlah penduduk miskin:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus grafik jumlah penduduk miskin"
        );
      } finally {
        jumlahPendudukMiskin.delete.loading = false;
      }
    },
  },
});
export default jumlahPendudukMiskin;
