import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikResponden = z.object({
  sangatbaik: z.string().min(1, "Data sangat baik harus diisi"),
  baik: z.string().min(1, "Data baik harus diisi"),
  kurangbaik: z.string().min(1, "Data kurang baik harus diisi"),
  tidakbaik: z.string().min(1, "Data tidak baik harus diisi"),
});

type GrafikResponden = Prisma.GrafikBerdasarkanRespondenGetPayload<{
  select: {
    id: true;
    sangatbaik: true;
    baik: true;
    kurangbaik: true;
    tidakbaik: true;
  };
}>;

const defaultForm: Omit<GrafikResponden, 'id'> & { id?: string } = {
  sangatbaik: "",
  baik: "",
  kurangbaik: "",
  tidakbaik: "",
};

const grafikBerdasarkanResponden = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikResponden.safeParse(
        grafikBerdasarkanResponden.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanResponden.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikberdasarkanresponden[
          "create"
        ].post(grafikBerdasarkanResponden.create.form);
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Success create");
            grafikBerdasarkanResponden.create.form = {
              sangatbaik: "",
              baik: "",
              kurangbaik: "",
              tidakbaik: "",
            };
            grafikBerdasarkanResponden.findMany.load();
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikBerdasarkanResponden.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikBerdasarkanRespondenGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    loading: false,
    async load() {
      const res = await ApiFetch.api.ppid.grafikberdasarkanresponden[
        "find-many"
      ].get();
      if (res.status === 200) {
        grafikBerdasarkanResponden.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.GrafikBerdasarkanRespondenGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/grafikberdasarkanresponden/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          grafikBerdasarkanResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikBerdasarkanResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan responden:", error);
        grafikBerdasarkanResponden.findUnique.data = null;
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

      const cek = templateGrafikResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      this.loading = true;

      try {
        const response = await fetch(`/api/ppid/grafikberdasarkanresponden/${id}`, {
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

        await grafikBerdasarkanResponden.findMany.load();

        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data grafik berdasarkan responden");
      } finally {
        this.loading = false;
      }
    }
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        grafikBerdasarkanResponden.delete.loading = true;

        const response = await fetch(`/api/ppid/grafikberdasarkanresponden/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Grafik berdasarkan responden berhasil dihapus");
          await grafikBerdasarkanResponden.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus grafik berdasarkan responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik berdasarkan responden");
      } finally {
        grafikBerdasarkanResponden.delete.loading = false;
      }
    }
  }
});

export default grafikBerdasarkanResponden;