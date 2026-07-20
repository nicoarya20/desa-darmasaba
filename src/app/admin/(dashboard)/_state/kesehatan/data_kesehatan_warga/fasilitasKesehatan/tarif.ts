/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateTarifForm = z.object({
  tarif: z.string().min(1, "Tarif tidak boleh kosong"),
  layanan: z.string().min(1, "Layanan tidak boleh kosong"),
});

const defaultTarifForm = {
  tarif: "",
  layanan: "",
};

const tarif = proxy({
  create: {
    form: defaultTarifForm,
    loading: false,
    async create() {
      const cek = templateTarifForm.safeParse(tarif.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        tarif.create.loading = true;
        const res = await ApiFetch.api.kesehatan.tarifdanlayanan[
          "create"
        ].post(tarif.create.form);

        if (res.status === 200) {
          const id = res.data?.data;
          if (id) {
            toast.success("Sukses menambahkan");
            tarif.create.form = { ...defaultTarifForm };
            tarif.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        tarif.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.TarifDanLayananGetPayload<{
          omit: {
            isActive: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      tarif.findMany.loading = true;
      tarif.findMany.page = page;
      tarif.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.tarifdanlayanan[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          tarif.findMany.data = res.data.data ?? [];
          tarif.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          tarif.findMany.data = [];
          tarif.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch tarif dan layanan paginated:", err);
        tarif.findMany.data = [];
        tarif.findMany.totalPages = 1;
      } finally {
        tarif.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.TarifDanLayananGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/tarifdanlayanan/${id}`);
        if (res.ok) {
          const data = await res.json();
          tarif.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch tarif dan layanan", res.statusText);
          tarif.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching tarif dan layanan", error);
        tarif.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultTarifForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/kesehatan/tarifdanlayanan/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            tarif: data.tarif,
            layanan: data.layanan,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading tarif dan layanan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      const formData = {
        tarif: this.form.tarif,
        layanan: this.form.layanan,
      };

      const cek = templateTarifForm.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v: any) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kesehatan/tarifdanlayanan/${id}`, {
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
        await tarif.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data tarif dan layanan");
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) {
        return toast.warn("ID tidak valid");
      }
      try {
        tarif.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/tarifdanlayanan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "tarif dan layanan berhasil dihapus");
          await tarif.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus tarif dan layanan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus tarif dan layanan");
      } finally {
        tarif.delete.loading = false;
      }
    },
  },
});

export default tarif;
