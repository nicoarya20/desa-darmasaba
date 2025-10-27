/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1).max(50),
  deskripsi: z.string().min(1).max(5000),
  alamat: z.string().min(1).max(5000),
  namaIde: z.string().min(1).max(5000),
  masalah: z.string().min(1).max(5000),
  benefit: z.string().min(1).max(5000),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  alamat: "",
  namaIde: "",
  masalah: "",
  benefit: "",
};

const ajukanIdeInovatifState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(ajukanIdeInovatifState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        ajukanIdeInovatifState.create.loading = true;
        const res = await ApiFetch.api.inovasi.ajukanideinovatif["create"].post(
          ajukanIdeInovatifState.create.form
        );
        if (res.status === 200) {
          ajukanIdeInovatifState.findMany.load();
          return toast.success("Ajukan Ide Inovatif berhasil di kirim");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        ajukanIdeInovatifState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.AjukanIdeInovatifGetPayload<{
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
      ajukanIdeInovatifState.findMany.loading = true; // ✅ Akses langsung via nama path
      ajukanIdeInovatifState.findMany.page = page;
      ajukanIdeInovatifState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res =
          await ApiFetch.api.inovasi.ajukanideinovatif[
            "find-many"
          ].get({ query });

        if (res.status === 200 && res.data?.success) {
          ajukanIdeInovatifState.findMany.data = res.data.data ?? [];
          ajukanIdeInovatifState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          ajukanIdeInovatifState.findMany.data = [];
          ajukanIdeInovatifState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch ajukan ide inovatif paginated:", err);
        ajukanIdeInovatifState.findMany.data = [];
        ajukanIdeInovatifState.findMany.totalPages = 1;
      } finally {
        ajukanIdeInovatifState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.AjukanIdeInovatifGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/inovasi/ajukanideinovatif/${id}`);
        if (res.ok) {
          const data = await res.json();
          ajukanIdeInovatifState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          ajukanIdeInovatifState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading ajukan ide inovatif:", error);
        ajukanIdeInovatifState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        ajukanIdeInovatifState.delete.loading = true;
        const response = await fetch(
          `/api/inovasi/ajukanideinovatif/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();

        if (response.ok) {
          toast.success(
            result.message || "Ajukan Ide Inovatif berhasil dihapus"
          );
          await ajukanIdeInovatifState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus ajukan ide inovatif");
        }
      } catch (error) {
        console.log((error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus ajukan ide inovatif");
      } finally {
        ajukanIdeInovatifState.delete.loading = false;
      }
    },
  },
});
export default ajukanIdeInovatifState;
