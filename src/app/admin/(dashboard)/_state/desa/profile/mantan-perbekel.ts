/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const mantanPerbekelForm = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  daerah: z.string().min(3, "Daerah minimal 3 karakter"),
  periode: z.string().min(3, "Periode minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const mantanPerbekelDefaultForm = {
  nama: "",
  daerah: "",
  periode: "",
  imageId: "",
};

const mantanPerbekel = proxy({
  create: {
    form: { ...mantanPerbekelDefaultForm },
    loading: false,
    async create() {
      const cek = mantanPerbekelForm.safeParse(mantanPerbekel.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        return toast.error(err);
      }
      try {
        mantanPerbekel.create.loading = true;
        const res = await ApiFetch.api.desa.mantanperbekel["create"].post(
          mantanPerbekel.create.form
        );
        if (res.status === 200) {
          mantanPerbekel.findMany.load();
          return toast.success("Foto berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan foto");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        mantanPerbekel.create.loading = false;
      }
    },
    resetForm() {
      mantanPerbekel.create.form = { ...mantanPerbekelDefaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.PerbekelDariMasaKeMasaGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      mantanPerbekel.findMany.loading = true;
      mantanPerbekel.findMany.page = page;
      mantanPerbekel.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.desa.mantanperbekel["findMany"].get({ query });

        if (res.status === 200 && res.data?.success) {
          mantanPerbekel.findMany.data = res.data.data ?? [];
          mantanPerbekel.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          mantanPerbekel.findMany.data = [];
          mantanPerbekel.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch mantan perbekel paginated:", err);
        mantanPerbekel.findMany.data = [];
        mantanPerbekel.findMany.totalPages = 1;
      } finally {
        mantanPerbekel.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PerbekelDariMasaKeMasaGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/mantanperbekel/${id}`);
        if (res.ok) {
          const data = await res.json();
          mantanPerbekel.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch mantan perbekel:", res.statusText);
          mantanPerbekel.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching mantan perbekel:", error);
        mantanPerbekel.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        mantanPerbekel.delete.loading = true;
        const res = await (ApiFetch.api.desa.mantanperbekel as any)["del"][id].delete();
        if (!res.error) {
          toast.success("Mantan perbekel berhasil dihapus");
          await mantanPerbekel.findMany.load();
        } else {
          toast.error("Gagal menghapus mantan perbekel");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus mantan perbekel");
      } finally {
        mantanPerbekel.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...mantanPerbekelDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/desa/mantanperbekel/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            nama: data.nama,
            daerah: data.daerah,
            periode: data.periode,
            imageId: data.imageId || "",
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading foto:", error);
        toast.error(error instanceof Error ? error.message : "Gagal memuat data");
        return null;
      }
    },
    async update() {
      const cek = mantanPerbekelForm.safeParse(mantanPerbekel.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => `${v.path.join(".")}`).join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        mantanPerbekel.update.loading = true;
        const response = await fetch(`/api/desa/mantanperbekel/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: this.form.nama,
            daerah: this.form.daerah,
            periode: this.form.periode,
            imageId: this.form.imageId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "Mantan perbekel berhasil diupdate");
          await mantanPerbekel.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate mantan perbekel");
        }
      } catch (error) {
        console.error("Error updating mantan perbekel:", error);
        toast.error(error instanceof Error ? error.message : "Gagal mengupdate mantan perbekel");
        return false;
      } finally {
        mantanPerbekel.update.loading = false;
      }
    },
    reset() {
      mantanPerbekel.update.id = "";
      mantanPerbekel.update.form = { ...mantanPerbekelDefaultForm };
    },
  },
});

export default mantanPerbekel;
