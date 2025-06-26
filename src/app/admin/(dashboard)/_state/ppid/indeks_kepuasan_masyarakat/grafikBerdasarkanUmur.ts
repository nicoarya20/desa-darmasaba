import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikUmur = z.object({
  remaja: z.string().min(1, "Data remaja harus diisi"),
  dewasa: z.string().min(1, "Data dewasa harus diisi"),
  orangtua: z.string().min(1, "Data orangtua harus diisi"),
  lansia: z.string().min(1, "Data lansia harus diisi"),
});

type GrafikUmur = Prisma.GrafikBerdasarkanUmurGetPayload<{
  select: {
    id: true;
    remaja: true;
    dewasa: true;
    orangtua: true;
    lansia: true;
  };
}>;

const defaultForm: Omit<GrafikUmur, "id"> & { id?: string } = {
  remaja: "",
  dewasa: "",
  orangtua: "",
  lansia: "",
};

const grafikBerdasarkanUmur = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikUmur.safeParse(
        grafikBerdasarkanUmur.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanUmur.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikberdasarkanumur[
          "create"
        ].post(grafikBerdasarkanUmur.create.form);
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Success create");
            grafikBerdasarkanUmur.create.form = {
              remaja: "",
              dewasa: "",
              orangtua: "",
              lansia: "",
            };
            grafikBerdasarkanUmur.findMany.load();
            return id;
          }
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikBerdasarkanUmur.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikBerdasarkanUmurGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    loading: false,
    async load() {
      const res = await ApiFetch.api.ppid.grafikberdasarkanumur[
        "find-many"
      ].get();
      if (res.status === 200) {
        grafikBerdasarkanUmur.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.GrafikBerdasarkanUmurGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ppid/grafikberdasarkanumur/${id}`);
        if (res.ok) {
          const data = await res.json();
          grafikBerdasarkanUmur.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          grafikBerdasarkanUmur.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading grafik berdasarkan umur:", error);
        grafikBerdasarkanUmur.findUnique.data = null;
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
        const cek = templateGrafikUmur.safeParse(this.form);
        if (!cek.success) {
            const err = `[${cek.error.issues
              .map((v) => `${v.path.join(".")}`)
              .join("\n")}] required`;
            toast.error(err);
            return null;
        }
        this.loading = true;
        try {
            const response = await fetch(`/api/ppid/grafikberdasarkanumur/${id}`, {
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
            await grafikBerdasarkanUmur.findMany.load();
            return result.data;
        } catch (error) {
            console.error("Error update data:", error);
            toast.error("Gagal update data grafik berdasarkan umur");
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
        grafikBerdasarkanUmur.delete.loading = true;

        const response = await fetch(`/api/ppid/grafikberdasarkanumur/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Grafik berdasarkan umur berhasil dihapus");
          await grafikBerdasarkanUmur.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus grafik berdasarkan umur");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus grafik berdasarkan umur");
      } finally {
        grafikBerdasarkanUmur.delete.loading = false;
      }
    }
  }
});

export default grafikBerdasarkanUmur;