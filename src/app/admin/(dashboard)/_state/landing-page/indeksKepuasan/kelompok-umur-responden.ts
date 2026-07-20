/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKelompokUmurResponden = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultFormKelompokUmurResponden = {
  name: "",
};

const kelompokUmurResponden = proxy({
  create: {
    form: { ...defaultFormKelompokUmurResponden },
    loading: false,
    async create() {
      const cek = templateKelompokUmurResponden.safeParse(
        kelompokUmurResponden.create.form
      );
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }
      kelompokUmurResponden.create.loading = true;
      try {
        kelompokUmurResponden.create.loading = true;
        const res = await ApiFetch.api.landingpage.umurresponden["create"].post(
          kelompokUmurResponden.create.form
        );
        if (res.status === 200) {
          toast.success("Kelompok umur responden berhasil ditambahkan");
          await kelompokUmurResponden.findMany.load();
        } else {
          toast.error(
            getServerMessage(res) ?? "Gagal tambah kelompok umur responden"
          );
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error(
          "Terjadi kesalahan saat menambahkan kelompok umur responden"
        );
      } finally {
        kelompokUmurResponden.create.loading = false;
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
      kelompokUmurResponden.findMany.loading = true;
      kelompokUmurResponden.findMany.page = page;
      try {
        const res = await ApiFetch.api.landingpage.umurresponden[
          "findMany"
        ].get({
          query: { page, limit },
        });

        if (res.status === 200 && res.data?.success) {
          kelompokUmurResponden.findMany.data = res.data.data || [];
          kelompokUmurResponden.findMany.total = res.data.total || 0;
          kelompokUmurResponden.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load kelompok umur responden:",
            res.data?.message
          );
          kelompokUmurResponden.findMany.data = [];
          kelompokUmurResponden.findMany.total = 0;
          kelompokUmurResponden.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading kelompok umur responden:", error);
        kelompokUmurResponden.findMany.data = [];
        kelompokUmurResponden.findMany.total = 0;
        kelompokUmurResponden.findMany.totalPages = 1;
      } finally {
        kelompokUmurResponden.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.UmurRespondenGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/umurresponden/${id}`);
        if (res.ok) {
          const data = await res.json();
          kelompokUmurResponden.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kelompokUmurResponden.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading kelompok umur responden:", error);
        kelompokUmurResponden.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormKelompokUmurResponden },
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
      const cek = templateKelompokUmurResponden.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(`/api/landingpage/umurresponden/${id}`, {
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
        await kelompokUmurResponden.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data kelompok umur responden");
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
        kelompokUmurResponden.delete.loading = true;

        // Eden delete — avoids 400 parse-body error & handles non-JSON response
        const res = await (ApiFetch.api.landingpage as any).umurresponden["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "kelompok umur responden berhasil dihapus"
          );
          await kelompokUmurResponden.findMany.load();
        } else {
          // Eden puts non-2xx body in res.error.value, not res.data
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kelompok umur responden");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kelompok umur responden");
      } finally {
        kelompokUmurResponden.delete.loading = false;
      }
    },
  },
});

export default kelompokUmurResponden;
