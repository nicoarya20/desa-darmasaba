/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePosisiOrganisasi = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  deskripsi: z.string().optional(),
  hierarki: z.number().int().positive("Hierarki harus angka positif"),
});

const posisiOrganisasiDefaultForm = {
  nama: "",
  deskripsi: "",
  hierarki: 0,
};

const posisiOrganisasi = proxy({
  create: {
    form: { ...posisiOrganisasiDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePosisiOrganisasi.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ppid.strukturppid.posisiorganisasi[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan posisi organisasi");
          posisiOrganisasi.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan posisi");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Terjadi kesalahan saat menambahkan posisi");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...posisiOrganisasiDefaultForm };
    },
  },

  findUnique: {
    data: null as Prisma.StrukturOrganisasiPPIDGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/strukturppid/posisiorganisasi/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          posisiOrganisasi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch posisiOrganisasi:", res.statusText);
          posisiOrganisasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching posisiOrganisasi:", error);
        posisiOrganisasi.findUnique.data = null;
      }
    },
  },

  edit: {
    id: "",
    form: { ...posisiOrganisasiDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ppid/strukturppid/posisiorganisasi/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            nama: data.nama,
            deskripsi: data.deskripsi,
            hierarki: data.hierarki,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading posisi organisasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templatePosisiOrganisasi.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        this.loading = true;
        const response = await fetch(
          `/api/ppid/strukturppid/posisiorganisasi/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              deskripsi: this.form.deskripsi,
              hierarki: this.form.hierarki,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update posisi organisasi");
          await posisiOrganisasi.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate posisi organisasi"
          );
        }
      } catch (error) {
        console.error("Error updating posisi organisasi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate posisi organisasi"
        );
        return false;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.id = "";
      this.form = { ...posisiOrganisasiDefaultForm };
    },
  },

  findMany: {
    data: [] as Array<{
      id: string;
      nama: string;
      deskripsi: string | null;
      hierarki: number;
    }>,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit?: number, search = "") => {
      const appliedLimit = limit ?? 10;
      posisiOrganisasi.findMany.page = page;
      posisiOrganisasi.findMany.search = search;

      try {
        const query: any = { page, limit: appliedLimit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.posisiorganisasi[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          posisiOrganisasi.findMany.data = res.data.data ?? [];
          posisiOrganisasi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          posisiOrganisasi.findMany.data = [];
          posisiOrganisasi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch posisi organisasi paginated:", err);
        posisiOrganisasi.findMany.data = [];
        posisiOrganisasi.findMany.totalPages = 1;
      } finally {
        posisiOrganisasi.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: [] as Array<{
      id: string;
      nama: string;
      deskripsi: string | null;
      hierarki: number;
    }>,
    loading: false,
    search: "",
    load: async (search = "") => {
      posisiOrganisasi.findManyAll.loading = true;
      posisiOrganisasi.findManyAll.search = search;
      try {
        const query: any = { search };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.posisiorganisasi[
          "find-many-all"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          posisiOrganisasi.findManyAll.data = res.data.data || [];
        } else {
          console.error("Failed to load posisiOrganisasi:", res.data?.message);
          posisiOrganisasi.findManyAll.data = [];
        }
      } catch (error) {
        console.error("Error loading posisiOrganisasi:", error);
        posisiOrganisasi.findManyAll.data = [];
      } finally {
        posisiOrganisasi.findManyAll.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        posisiOrganisasi.delete.loading = true;

        // Eden delete — avoids 400 parse-body error on empty-body DELETE in Elysia
        const res = await (
          ApiFetch.api.ppid.strukturppid.posisiorganisasi as any
        )["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Posisi organisasi berhasil dihapus");
          await posisiOrganisasi.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal menghapus posisi organisasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus posisi organisasi");
      } finally {
        posisiOrganisasi.delete.loading = false;
      }
    },
  },
});

export default posisiOrganisasi;
