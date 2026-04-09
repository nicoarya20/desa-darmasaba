/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  icon: z.string().min(1, "Icon minimal 1 karakter"),
  statistik: z.object({
    tahun: z.string().min(1, "Tahun minimal 1 karakter"),
    jumlah: z.string().min(1, "Jumlah minimal 1 karakter"),
  }),
});

const defaultForm = {
  nama: "",
  deskripsi: "",
  icon: "",
  statistik: {
    tahun: "",
    jumlah: "",
  },
};

const programKemiskinanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(programKemiskinanState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        programKemiskinanState.create.loading = true;
        const res = await ApiFetch.api.ekonomi.programkemiskinan["create"].post(
          programKemiskinanState.create.form
        );
        if (res.status === 200) {
          programKemiskinanState.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        programKemiskinanState.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.ProgramKemiskinanGetPayload<{
      include: {
        statistik: true;
      };
    }>[],
    loading: false,
    page: 1,
    totalPages: 1,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      programKemiskinanState.findMany.loading = true; // ✅ Akses langsung via nama path
      programKemiskinanState.findMany.page = page;
      programKemiskinanState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ekonomi.programkemiskinan[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          programKemiskinanState.findMany.data = res.data.data ?? [];
          programKemiskinanState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          programKemiskinanState.findMany.data = [];
          programKemiskinanState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch program kemiskinan paginated:", err);
        programKemiskinanState.findMany.data = [];
        programKemiskinanState.findMany.totalPages = 1;
      } finally {
        programKemiskinanState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramKemiskinanGetPayload<{
      include: {
        statistik: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/programkemiskinan/${id}`);
        if (res.ok) {
          const data = await res.json();
          programKemiskinanState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          programKemiskinanState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        programKemiskinanState.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/ekonomi/programkemiskinan/${id}`, {
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
            nama: data.nama,
            deskripsi: data.deskripsi,
            icon: data.icon,
            statistik: {
              tahun: data.statistik.tahun,
              jumlah: data.statistik.jumlah,
            },
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading program kemiskinan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(programKemiskinanState.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        programKemiskinanState.update.loading = true;

        const response = await fetch(
          `/api/ekonomi/programkemiskinan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              deskripsi: this.form.deskripsi,
              icon: this.form.icon,
              statistik: {
                tahun: this.form.statistik.tahun,
                jumlah: this.form.statistik.jumlah,
              },
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
          toast.success("Berhasil update program kemiskinan");
          await programKemiskinanState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update program kemiskinan");
        }
      } catch (error) {
        console.error("Error updating program kemiskinan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update program kemiskinan"
        );
        return false;
      } finally {
        programKemiskinanState.update.loading = false;
      }
    },
    reset() {
      programKemiskinanState.update.id = "";
      programKemiskinanState.update.form = { ...defaultForm };
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        programKemiskinanState.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/programkemiskinan/del/${id}`,
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
            result.message || "Program kemiskinan berhasil dihapus"
          );
          await programKemiskinanState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus program kemiskinan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus program kemiskinan");
      } finally {
        programKemiskinanState.delete.loading = false;
      }
    },
  },
});

export default programKemiskinanState;
