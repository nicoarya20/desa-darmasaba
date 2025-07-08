import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDemografiPekerjaan = z.object({
  pekerjaan: z.string().min(1, "Pekerjaan harus diisi"),
  lakiLaki: z.number().min(1, "Laki - Laki harus diisi"),
  perempuan: z.number().min(1, "Perempuan harus diisi"),
});

type DemografiPekerjaan = Prisma.DataDemografiPekerjaanGetPayload<{
  select: {
    pekerjaan: true;
    lakiLaki: true;
    perempuan: true;
  };
}>;

const defaultForm: DemografiPekerjaan = {
  pekerjaan: "",
  lakiLaki: 0,
  perempuan: 0,
};

const demografiPekerjaan = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateDemografiPekerjaan.safeParse(
        demografiPekerjaan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        demografiPekerjaan.create.loading = true;
        const res = await ApiFetch.api.ekonomi.demografipekerjaan[
          "create"
        ].post(demografiPekerjaan.create.form);

        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Success create");
            demografiPekerjaan.create.form = { ...defaultForm };
            demografiPekerjaan.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        demografiPekerjaan.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.DataDemografiPekerjaanGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.ekonomi.demografipekerjaan[
        "find-many"
      ].get();
      if (res.status === 200) {
        demografiPekerjaan.findMany.data = res.data?.data ?? [];
      }
    },
  },

  findUnique: {
    data: null as Prisma.DataDemografiPekerjaanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/demografipekerjaan/${id}`);
        if (res.ok) {
          const data = await res.json();
          demografiPekerjaan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch demografiPekerjaan:", res.statusText);
          demografiPekerjaan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching demografiPekerjaan:", error);
        demografiPekerjaan.findUnique.data = null;
      }
    },
  },

  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        pekerjaan: this.form.pekerjaan,
        lakiLaki: this.form.lakiLaki,
        perempuan: this.form.perempuan,
      };

      const cek = templateDemografiPekerjaan.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/ekonomi/demografipekerjaan/${id}`, {
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
        await demografiPekerjaan.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data demografi pekerjaan");
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
        demografiPekerjaan.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/demografipekerjaan/del/${id}`,
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
            result.message || "Demografi pekerjaan berhasil dihapus"
          );
          await demografiPekerjaan.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus demografi pekerjaan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus persentase kelahiran");
      } finally {
        demografiPekerjaan.delete.loading = false;
      }
    },
  },
});
export default demografiPekerjaan
