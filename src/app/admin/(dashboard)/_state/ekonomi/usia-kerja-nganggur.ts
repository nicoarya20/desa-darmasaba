/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikUsiaKerjaYangMenganggur = z.object({
  usia18_25: z.string().min(1, "Data usia 18-25 harus diisi"),
  usia26_35: z.string().min(1, "Data usia 26-35 harus diisi"),
  usia36_45: z.string().min(1, "Data usia 36-45 harus diisi"),
  usia46_keatas: z.string().min(1, "Data usia 46 keatas harus diisi"),
}); 

type GrafikUsiaKerjaYangMenganggur = Prisma.GrafikMenganggurBerdasarkanUsiaGetPayload<{
  select: {
    id: true;
    usia18_25: true;
    usia26_35: true;
    usia36_45: true;
    usia46_keatas: true;
  };
}>;

const defaultForm: Omit<GrafikUsiaKerjaYangMenganggur, 'id'> & { id?: string } = {
  usia18_25: "",
  usia26_35: "",
  usia36_45: "",
  usia46_keatas: "",
};

const grafikBerdasarkanUsiaKerjaNganggur = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikUsiaKerjaYangMenganggur.safeParse(
        grafikBerdasarkanUsiaKerjaNganggur.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanUsiaKerjaNganggur.create.loading = true;
        const res = await ApiFetch.api.ekonomi.grafikusiakerjayangmenganggur[
          "create"
        ].post(grafikBerdasarkanUsiaKerjaNganggur.create.form);
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan");
            grafikBerdasarkanUsiaKerjaNganggur.create.form = {
              usia18_25: "",
              usia26_35: "",
              usia36_45: "",
              usia46_keatas: "",
            };
            grafikBerdasarkanUsiaKerjaNganggur.findMany.load();
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikBerdasarkanUsiaKerjaNganggur.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikMenganggurBerdasarkanUsiaGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
      page: 1,
      totalPages: 1,
      loading: false,
      search: "",
     load: async (page = 1, limit = 10, search = "") => {
        grafikBerdasarkanUsiaKerjaNganggur.findMany.loading = true; // ✅ Akses langsung via nama path
        grafikBerdasarkanUsiaKerjaNganggur.findMany.page = page;
        grafikBerdasarkanUsiaKerjaNganggur.findMany.search = search;
    
        try {
          const query: any = { page, limit };
          if (search) query.search = search;
      
          const res = await ApiFetch.api.ekonomi.grafikusiakerjayangmenganggur["find-many"].get({ query });
      
          if (res.status === 200 && res.data?.success) {
            grafikBerdasarkanUsiaKerjaNganggur.findMany.data = res.data.data ?? [];
            grafikBerdasarkanUsiaKerjaNganggur.findMany.totalPages = res.data.totalPages ?? 1;
          } else {
            grafikBerdasarkanUsiaKerjaNganggur.findMany.data = [];
            grafikBerdasarkanUsiaKerjaNganggur.findMany.totalPages = 1;
          }
        } catch (err) {
          console.error("Gagal fetch grafik berdasarkan usia kerja yang menganggur paginated:", err);
          grafikBerdasarkanUsiaKerjaNganggur.findMany.data = [];
          grafikBerdasarkanUsiaKerjaNganggur.findMany.totalPages = 1;
        } finally {
          grafikBerdasarkanUsiaKerjaNganggur.findMany.loading = false;
        }
      },
    },
  findUnique: {
    data: null as Prisma.GrafikMenganggurBerdasarkanUsiaGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ekonomi/grafikusiakerjayangmenganggur/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          grafikBerdasarkanUsiaKerjaNganggur.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikBerdasarkanUsiaKerjaNganggur.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan usia kerja yang menganggur:", error);
        grafikBerdasarkanUsiaKerjaNganggur.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: {...defaultForm},
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
      const cek = templateGrafikUsiaKerjaYangMenganggur.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/ekonomi/grafikusiakerjayangmenganggur/${id}`, {
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
        await grafikBerdasarkanUsiaKerjaNganggur.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik berdasarkan usia kerja yang menganggur");
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
        grafikBerdasarkanUsiaKerjaNganggur.delete.loading = true;

        // Pakai Eden (ApiFetch) — DELETE tanpa body tak diberi Content-Type json,
        // jadi tak memicu 400 parse-body kosong di Elysia (build production STG).
        const res = await (ApiFetch.api.ekonomi.grafikusiakerjayangmenganggur as any)["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Grafik berdasarkan usia kerja yang menganggur berhasil dihapus");
          await grafikBerdasarkanUsiaKerjaNganggur.findMany.load(); // refresh list
        } else {
          toast.error(res.data?.message || "Gagal menghapus grafik berdasarkan usia kerja yang menganggur");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik berdasarkan usia kerja yang menganggur");
      } finally {
        grafikBerdasarkanUsiaKerjaNganggur.delete.loading = false;
      }
    },
  }
});

const templateGrafikBerpendidikanYangMenganggur = z.object({
  SD: z.string().min(1, "Data SD harus diisi"),
  SMP: z.string().min(1, "Data SMP harus diisi"),
  SMA: z.string().min(1, "Data SMA harus diisi"),
  D3: z.string().min(1, "Data D3 harus diisi"),
  S1: z.string().min(1, "Data S1 harus diisi"),
}); 

type GrafikBerpendidikanYangMenganggur = Prisma.GrafikMenganggurBerdasarkanPendidikanGetPayload<{
  select: {
    id: true;
    SD: true;
    SMP: true;
    SMA: true;
    D3: true;
    S1: true;
  };
}>;

const defaultFormBerpendidikan: Omit<GrafikBerpendidikanYangMenganggur, 'id'> & { id?: string } = {
  SD: "",
  SMP: "",
  SMA: "",
  D3: "",
  S1: "",
};

const grafikBerdasarkanPendidikan = proxy({
  create: {
    form: defaultFormBerpendidikan,
    loading: false,
    async create() {
      const cek = templateGrafikBerpendidikanYangMenganggur.safeParse(
        grafikBerdasarkanPendidikan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanPendidikan.create.loading = true;
        const res = await ApiFetch.api.ekonomi.grafikmenganggurberdasarkanpendidikan[
          "create"
        ].post(grafikBerdasarkanPendidikan.create.form);
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Sukses menambahkan");
            grafikBerdasarkanPendidikan.create.form = {
              SD: "",
              SMP: "",
              SMA: "",
              D3: "",
              S1: "",
            };
            grafikBerdasarkanPendidikan.findMany.load();
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikBerdasarkanPendidikan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikMenganggurBerdasarkanPendidikanGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
      page: 1,
      totalPages: 1,
      loading: false,
      search: "",
     load: async (page = 1, limit = 10, search = "") => {
        grafikBerdasarkanPendidikan.findMany.loading = true; // ✅ Akses langsung via nama path
        grafikBerdasarkanPendidikan.findMany.page = page;
        grafikBerdasarkanPendidikan.findMany.search = search;
    
        try {
          const query: any = { page, limit };
          if (search) query.search = search;
      
          const res = await ApiFetch.api.ekonomi.grafikmenganggurberdasarkanpendidikan["find-many"].get({ query });
      
          if (res.status === 200 && res.data?.success) {
            grafikBerdasarkanPendidikan.findMany.data = res.data.data ?? [];
            grafikBerdasarkanPendidikan.findMany.totalPages = res.data.totalPages ?? 1;
          } else {
            grafikBerdasarkanPendidikan.findMany.data = [];
            grafikBerdasarkanPendidikan.findMany.totalPages = 1;
          }
        } catch (err) {
          console.error("Gagal fetch grafik berdasarkan pendidikan paginated:", err);
          grafikBerdasarkanPendidikan.findMany.data = [];
          grafikBerdasarkanPendidikan.findMany.totalPages = 1;
        } finally {
          grafikBerdasarkanPendidikan.findMany.loading = false;
        }
      },
  },
  findUnique: {
    data: null as Prisma.GrafikMenganggurBerdasarkanPendidikanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ekonomi/grafikmenganggurberdasarkanpendidikan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          grafikBerdasarkanPendidikan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikBerdasarkanPendidikan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan usia kerja yang menganggur:", error);
        grafikBerdasarkanPendidikan.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: {...defaultFormBerpendidikan},
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
      const cek = templateGrafikBerpendidikanYangMenganggur.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/ekonomi/grafikmenganggurberdasarkanpendidikan/${id}`, {
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
        await grafikBerdasarkanPendidikan.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik berdasarkan pendidikan yang menganggur");
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
        grafikBerdasarkanPendidikan.delete.loading = true;

        // Pakai Eden (ApiFetch) — DELETE tanpa body tak diberi Content-Type json,
        // jadi tak memicu 400 parse-body kosong di Elysia (build production STG).
        const res = await (ApiFetch.api.ekonomi.grafikmenganggurberdasarkanpendidikan as any)["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Grafik berdasarkan pendidikan yang menganggur berhasil dihapus");
          await grafikBerdasarkanPendidikan.findMany.load(); // refresh list
        } else {
          toast.error(res.data?.message || "Gagal menghapus grafik berdasarkan pendidikan yang menganggur");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik berdasarkan pendidikan yang menganggur");
      } finally {
        grafikBerdasarkanPendidikan.delete.loading = false;
      }
    },
  }
});

const grafikNganggur = proxy({
  grafikBerdasarkanUsiaKerjaNganggur,
  grafikBerdasarkanPendidikan
})

export default grafikNganggur;
