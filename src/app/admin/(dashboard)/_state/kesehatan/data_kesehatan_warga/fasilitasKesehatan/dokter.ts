/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDokterForm = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  specialist: z.string().min(1, "Spesialis tidak boleh kosong"),
  jadwal: z.string().min(1, "Jadwal tidak boleh kosong"),
  jadwalLibur: z.string().min(1, "Jadwal libur tidak boleh kosong"),
  jamBukaOperasional: z
    .string()
    .min(1, "Jam buka operasional tidak boleh kosong"),
  jamTutupOperasional: z
    .string()
    .min(1, "Jam tutup operasional tidak boleh kosong"),
  jamBukaLibur: z.string().min(1, "Jam buka libur tidak boleh kosong"),
  jamTutupLibur: z.string().min(1, "Jam tutup libur tidak boleh kosong"),
});

const defaultDokterForm = {
  name: "",
  specialist: "",
  jadwal: "",
  jadwalLibur: "",
  jamBukaOperasional: "",
  jamTutupOperasional: "",
  jamBukaLibur: "",
  jamTutupLibur: "",
};

const dokter = proxy({
  create: {
    create: {
      form: defaultDokterForm,
      loading: false,
      async create() {
        const cek = templateDokterForm.safeParse(dokter.create.create.form);
        if (!cek.success) {
          const err = `[${cek.error.issues
            .map((v) => `${v.path.join(".")}`)
            .join("\n")}] required`;
          toast.error(err);
          return null;
        }
        try {
          dokter.create.create.loading = true;
          const res = await ApiFetch.api.kesehatan.doktertenagamedis[
            "create"
          ].post(dokter.create.create.form);

          if (res.status === 200) {
            const id = res.data?.data;
            if (id) {
              toast.success("Sukses menambahkan");
              dokter.create.create.form = { ...defaultDokterForm };
              dokter.findMany.load();
              return id;
            }
          }
          toast.error("failed create");
          return null;
        } catch (error) {
          console.log((error as Error).message);
          return null;
        } finally {
          dokter.create.create.loading = false;
        }
      },
    },
  },
  findMany: {
    data: null as
      | Prisma.DokterdanTenagaMedisGetPayload<{
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
      dokter.findMany.loading = true;
      dokter.findMany.page = page;
      dokter.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.doktertenagamedis[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          dokter.findMany.data = res.data.data ?? [];
          dokter.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          dokter.findMany.data = [];
          dokter.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch dokter tenaga medis paginated:", err);
        dokter.findMany.data = [];
        dokter.findMany.totalPages = 1;
      } finally {
        dokter.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DokterdanTenagaMedisGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/doktertenagamedis/${id}`);
        if (res.ok) {
          const data = await res.json();
          dokter.findUnique.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch dokter dan tenaga medis",
            res.statusText
          );
          dokter.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching dokter dan tenaga medis", error);
        dokter.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultDokterForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/kesehatan/doktertenagamedis/${id}`,
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
            name: data.name,
            specialist: data.specialist,
            jadwal: data.jadwal,
            jadwalLibur: data.jadwalLibur,
            jamBukaOperasional: data.jamBukaOperasional,
            jamTutupOperasional: data.jamTutupOperasional,
            jamBukaLibur: data.jamBukaLibur,
            jamTutupLibur: data.jamTutupLibur,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading dokter dan tenaga medis:", error);
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
        name: this.form.name,
        specialist: this.form.specialist,
        jadwal: this.form.jadwal,
        jadwalLibur: this.form.jadwalLibur,
        jamBukaOperasional: this.form.jamBukaOperasional,
        jamTutupOperasional: this.form.jamTutupOperasional,
        jamBukaLibur: this.form.jamBukaLibur,
        jamTutupLibur: this.form.jamTutupLibur,
      };

      const cek = templateDokterForm.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kesehatan/doktertenagamedis/${id}`, {
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
        await dokter.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data dokter dan tenaga medis");
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
        dokter.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/doktertenagamedis/del/${id}`,
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
            result.message || "Dokter dan tenaga medis berhasil dihapus"
          );
          await dokter.findMany.load();
        } else {
          toast.error(
            result?.message || "Gagal menghapus dokter dan tenaga medis"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus dokter dan tenaga medis"
        );
      } finally {
        dokter.delete.loading = false;
      }
    },
  },
});

export default dokter;
