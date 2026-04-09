/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, "Name minimal 1 karakter"),
  tanggal: z.string().min(1, "Tanggal minimal 1 karakter"),
  namaOrangtua: z.string().min(1, "Nama Orangtua minimal 1 karakter"),
  nomor: z.string().min(1, "Nomor minimal 1 karakter"),
  alamat: z.string().min(1, "Alamat minimal 1 karakter"),
  catatan: z.string().min(1, "Catatan minimal 1 karakter"),
});

const defaultForm = {
  name: "",
  tanggal: "",
  namaOrangtua: "",
  nomor: "",
  alamat: "",
  catatan: "",
};

const pendaftaranJadwalKegiatanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const cek = templateForm.safeParse(this.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        this.loading = true;
        const payload = { ...this.form };

        const res = await (ApiFetch.api.kesehatan as any)[
          "pendaftaran-jadwal-kegiatan"
        ].create.post(payload);

        if (res.status === 200) {
          toast.success("Berhasil menambahkan jadwal kegiatan");
          this.resetForm();
          await pendaftaranJadwalKegiatanState.findMany.load();
          return res.data;
        }
      } catch (err: any) {
        const msg = err?.message || "Terjadi kesalahan saat mengirim data";
        toast.error(msg);
        console.error("SUBMIT ERROR:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.PendaftaranJadwalKegiatanGetPayload<{
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
      pendaftaranJadwalKegiatanState.findMany.loading = true; // ✅ Akses langsung via nama path
      pendaftaranJadwalKegiatanState.findMany.page = page;
      pendaftaranJadwalKegiatanState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan["pendaftaran-jadwal-kegiatan"][
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          pendaftaranJadwalKegiatanState.findMany.data = res.data.data ?? [];
          pendaftaranJadwalKegiatanState.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          pendaftaranJadwalKegiatanState.findMany.data = [];
          pendaftaranJadwalKegiatanState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error(
          "Gagal fetch pendaftaran jadwal kegiatan paginated:",
          err
        );
        pendaftaranJadwalKegiatanState.findMany.data = [];
        pendaftaranJadwalKegiatanState.findMany.totalPages = 1;
      } finally {
        pendaftaranJadwalKegiatanState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PendaftaranJadwalKegiatanGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/kesehatan/pendaftaran-jadwal-kegiatan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pendaftaranJadwalKegiatanState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pendaftaranJadwalKegiatanState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        pendaftaranJadwalKegiatanState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pendaftaranJadwalKegiatanState.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/pendaftaran-jadwal-kegiatan/del/${id}`,
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
            result.message || "Pendaftaran jadwal kegiatan berhasil dihapus"
          );
          await pendaftaranJadwalKegiatanState.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus pendaftaran jadwal kegiatan"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus pendaftaran jadwal kegiatan"
        );
      } finally {
        pendaftaranJadwalKegiatanState.delete.loading = false;
      }
    },
  },
   edit: {
      id: "",
      form: { ...defaultForm },
      loading: false,
  
      async load(id: string) {
        if (!id) {
          toast.warn("ID tidak valid");
          return null;
        }
  
        try {
          const response = await fetch(`/api/kesehatan/pendaftaran-jadwal-kegiatan/${id}`, {
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
              name: data.name,
              tanggal: data.tanggal,
              namaOrangtua: data.namaOrangtua,
              nomor: data.nomor,
              alamat: data.alamat,
              catatan: data.catatan,
            };
            return data; // Return the loaded data
          } else {
            throw new Error(result?.message || "Gagal memuat data");
          }
        } catch (error) {
          console.error("Error loading pendaftaran jadwal kegiatan:", error);
          toast.error(
            error instanceof Error ? error.message : "Gagal memuat data"
          );
          return null;
        }
      },
  
      async update() {
        const cek = templateForm.safeParse(pendaftaranJadwalKegiatanState.edit.form);
        if (!cek.success) {
          const err = `[${cek.error.issues
            .map((v) => `${v.path.join(".")}`)
            .join("\n")}] required`;
          toast.error(err);
          return false;
        }
  
        try {
          pendaftaranJadwalKegiatanState.edit.loading = true;
  
          const response = await fetch(
            `/api/kesehatan/pendaftaran-jadwal-kegiatan/${this.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: this.form.name,
                tanggal: this.form.tanggal,
                namaOrangtua: this.form.namaOrangtua,
                nomor: this.form.nomor,
                alamat: this.form.alamat,
                catatan: this.form.catatan,
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
            toast.success("Berhasil update pendaftaran jadwal kegiatan");
            await pendaftaranJadwalKegiatanState.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(result.message || "Gagal update pendaftaran jadwal kegiatan");
          }
        } catch (error) {
          console.error("Error updating pendaftaran jadwal kegiatan:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat update pendaftaran jadwal kegiatan"
          );
          return false;
        } finally {
          pendaftaranJadwalKegiatanState.edit.loading = false;
        }
      },
      reset() {
        pendaftaranJadwalKegiatanState.edit.id = "";
        pendaftaranJadwalKegiatanState.edit.form = { ...defaultForm };
      },
    },
});

export default pendaftaranJadwalKegiatanState;
