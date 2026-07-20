/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePersentaseKelahiran = z.object({
  tahun: z.string().min(4, "Tahun harus diisi"),
  kematianKasar: z.string().min(1, "Kematian kasar harus diisi"),
  kelahiranKasar: z.string().min(1, "Kelahiran kasar harus diisi"),
  kematianBayi: z.string().min(1, "Kematian bayi harus diisi"),
});

type Persentase = Prisma.DataKematian_KelahiranGetPayload<{
  select: {
    kematianId: true;
    kelahiranId: true;
  };
}>;

const defaultForm: Persentase = {
  kematianId: "",
  kelahiranId: "",
};

const persentasekelahiran = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templatePersentaseKelahiran.safeParse(
        persentasekelahiran.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        persentasekelahiran.create.loading = true;
        const res = await ApiFetch.api.kesehatan.persentasekelahiran[
          "create"
        ].post(persentasekelahiran.create.form);

        if (res.status === 200) {
          const id = res.data?.data;
          if (id) {
            toast.success("Sukses menambahkan");
            persentasekelahiran.create.form = { ...defaultForm };
            persentasekelahiran.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        persentasekelahiran.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.DataKematian_KelahiranGetPayload<{
          include: {
            kematian: true;
            kelahiran: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      persentasekelahiran.findMany.loading = true;
      persentasekelahiran.findMany.page = page;
      persentasekelahiran.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.persentasekelahiran[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          persentasekelahiran.findMany.data = res.data.data ?? [];
          persentasekelahiran.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          persentasekelahiran.findMany.data = [];
          persentasekelahiran.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch berita paginated:", err);
        persentasekelahiran.findMany.data = [];
        persentasekelahiran.findMany.totalPages = 1;
      } finally {
        persentasekelahiran.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DataKematian_KelahiranGetPayload<{
      include: {
        kematian: true;
        kelahiran: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/persentasekelahiran/${id}`);
        if (res.ok) {
          const data = await res.json();
          persentasekelahiran.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch persentasekelahiran:", res.statusText);
          persentasekelahiran.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching persentasekelahiran:", error);
        persentasekelahiran.findUnique.data = null;
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
        kematianId: this.form.kematianId,
        kelahiranId: this.form.kelahiranId,
      };

      const cek = templatePersentaseKelahiran.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kesehatan/persentasekelahiran/${id}`, {
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
        await persentasekelahiran.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data persentase kelahiran");
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
        persentasekelahiran.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/persentasekelahiran/del/${id}`,
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
            result.message || "Persentase kelahiran berhasil dihapus"
          );
          await persentasekelahiran.findMany.load();
        } else {
          toast.error(
            result?.message || "Gagal menghapus persentase kelahiran"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus persentase kelahiran");
      } finally {
        persentasekelahiran.delete.loading = false;
      }
    },
  },
});

export default persentasekelahiran;
