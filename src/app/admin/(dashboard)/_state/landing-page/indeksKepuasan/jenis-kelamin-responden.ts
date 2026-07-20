/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateJenisKelaminResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultFormJenisKelaminResponden = {
  name: "",
};

const jenisKelaminResponden = proxy({
  create: {
    form: { ...defaultFormJenisKelaminResponden },
    loading: false,
    async create() {
      const cek = templateJenisKelaminResponden.safeParse(
        jenisKelaminResponden.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }
      jenisKelaminResponden.create.loading = true;
      try {
        jenisKelaminResponden.create.loading = true;
        const res = await ApiFetch.api.landingpage.jeniskelaminresponden[
          "create"
        ].post(jenisKelaminResponden.create.form);
        if (res.status === 200) {
          toast.success("Jenis kelamin responden berhasil ditambahkan");
          await jenisKelaminResponden.findMany.load();
        } else {
          toast.error(
            getServerMessage(res) ?? "Gagal tambah jenis kelamin responden"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan jenis kelamin responden"
        );
      } finally {
        jenisKelaminResponden.create.loading = false;
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
      jenisKelaminResponden.findMany.loading = true;
      jenisKelaminResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.landingpage.jeniskelaminresponden[
          "findMany"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          jenisKelaminResponden.findMany.data = res.data.data || [];
          jenisKelaminResponden.findMany.total = res.data.total || 0;
          jenisKelaminResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load jenis kelamin responden:",
            res.data?.message
          );
          jenisKelaminResponden.findMany.data = [];
          jenisKelaminResponden.findMany.total = 0;
          jenisKelaminResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading jenis kelamin responden:", error);
        jenisKelaminResponden.findMany.data = [];
        jenisKelaminResponden.findMany.total = 0;
        jenisKelaminResponden.findMany.totalPages = 1;
      } finally {
        jenisKelaminResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JenisKelaminRespondenGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/jeniskelaminresponden/${id}`);
        if (res.ok) {
          const data = await res.json();
          jenisKelaminResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          jenisKelaminResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading jenis kelamin responden:", error);
        jenisKelaminResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormJenisKelaminResponden },
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
      const cek = templateJenisKelaminResponden.safeParse(this.form);
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
          `/api/landingpage/jeniskelaminresponden/${id}`,
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
        await jenisKelaminResponden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data jenis kelamin responden");
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
        jenisKelaminResponden.delete.loading = true;

        // Eden delete — avoids 400 parse-body error & handles non-JSON response
        const res = await (ApiFetch.api.landingpage as any).jeniskelaminresponden[
          "del"
        ][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "jenis kelamin responden berhasil dihapus"
          );
          await jenisKelaminResponden.findMany.load();
        } else {
          // Eden puts non-2xx body in res.error.value, not res.data
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus jenis kelamin responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus jenis kelamin responden");
      } finally {
        jenisKelaminResponden.delete.loading = false;
      }
    },
  },
});

export default jenisKelaminResponden;
