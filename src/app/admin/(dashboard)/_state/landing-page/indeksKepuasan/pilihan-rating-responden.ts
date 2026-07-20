/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePilihanRatingResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultFormPilihanRatingResponden = {
  name: "",
};

const pilihanRatingResponden = proxy({
  create: {
    form: { ...defaultFormPilihanRatingResponden },
    loading: false,
    async create() {
      const cek = templatePilihanRatingResponden.safeParse(
        pilihanRatingResponden.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }
      pilihanRatingResponden.create.loading = true;
      try {
        pilihanRatingResponden.create.loading = true;
        const res = await ApiFetch.api.landingpage.pilihanratingresponden[
          "create"
        ].post(pilihanRatingResponden.create.form);
        if (res.status === 200) {
          toast.success("Pilihan rating responden berhasil ditambahkan");
          await pilihanRatingResponden.findMany.load();
        } else {
          toast.error(
            getServerMessage(res) ?? "Gagal tambah pilihan rating responden"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan jenis kelamin responden"
        );
      } finally {
        pilihanRatingResponden.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    load: async (page = 1, limit = 10) => {
      pilihanRatingResponden.findMany.loading = true;
      pilihanRatingResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.landingpage.pilihanratingresponden[
          "findMany"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          pilihanRatingResponden.findMany.data = res.data.data || [];
          pilihanRatingResponden.findMany.total = res.data.total || 0;
          pilihanRatingResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load pilihan rating responden:",
            res.data?.message
          );
          pilihanRatingResponden.findMany.data = [];
          pilihanRatingResponden.findMany.total = 0;
          pilihanRatingResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pilihan rating responden:", error);
        pilihanRatingResponden.findMany.data = [];
        pilihanRatingResponden.findMany.total = 0;
        pilihanRatingResponden.findMany.totalPages = 1;
      } finally {
        pilihanRatingResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PilihanRatingRespondenGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/pilihanratingresponden/${id}`);
        if (res.ok) {
          const data = await res.json();
          pilihanRatingResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pilihanRatingResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading pilihan rating responden:", error);
        pilihanRatingResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormPilihanRatingResponden },
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
      const cek = templatePilihanRatingResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/landingpage/pilihanratingresponden/${id}`,
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
        await pilihanRatingResponden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data pilihan rating responden");
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
        pilihanRatingResponden.delete.loading = true;

        // Eden delete — avoids 400 parse-body error & handles non-JSON response
        const res = await (ApiFetch.api.landingpage as any).pilihanratingresponden[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "pilihan rating responden berhasil dihapus"
          );
          await pilihanRatingResponden.findMany.load();
        } else {
          // Eden puts non-2xx body in res.error.value, not res.data
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus pilihan rating responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pilihan rating responden");
      } finally {
        pilihanRatingResponden.delete.loading = false;
      }
    },
  },
});

export default pilihanRatingResponden;
