/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateBeasiswaPendaftar = z.object({
  namaLengkap: z.string().min(1, "Nama harus diisi"),
  nis: z.string().min(1, "NIS harus diisi"),
  kelas: z.string().min(1, "Kelas harus diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin harus diisi"),
  alamatDomisili: z.string().min(1, "Alamat domisili harus diisi"),
  tempatLahir: z.string().min(1, "Tempat lahir harus diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi"),
  namaOrtu: z.string().min(1, "Nama ortu harus diisi"),
  nik: z.string().min(1, "NIK harus diisi"),
  pekerjaanOrtu: z.string().min(1, "Pekerjaan ortu harus diisi"),
  penghasilan: z.string().min(1, "Penghasilan ortu harus diisi"),
  noHp: z.string().min(1, "No HP harus diisi"),
});

const defaultBeasiswaPendaftar = {
  namaLengkap: "",
  nis: "",
  kelas: "",
  jenisKelamin: "",
  alamatDomisili: "",
  tempatLahir: "",
  tanggalLahir: "",
  namaOrtu: "",
  nik: "",
  pekerjaanOrtu: "",
  penghasilan: "",
  noHp: "",
};

const beasiswaPendaftar = proxy({
  create: {
    form: { ...defaultBeasiswaPendaftar },
    loading: false,
    async create() {
      const cek = templateBeasiswaPendaftar.safeParse(
        beasiswaPendaftar.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        beasiswaPendaftar.create.loading = true;
        const res = await ApiFetch.api.pendidikan.beasiswa.beasiswapendaftar[
          "create"
        ].post(beasiswaPendaftar.create.form);
        if (res.status === 200) {
          beasiswaPendaftar.findMany.load();
          toast.success(
            "Data Berhasil Dibuat, Silahkan Menunggu Konfirmasi dari Admin di WhatsApp"
          );
          return true;
        }
        // Pesan server (mis. 409 "NIK sudah dipakai")
        toast.error(
          getServerMessage(res) || "Gagal menambahkan pendaftar beasiswa"
        );
        return false;
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan pendaftar beasiswa");
        return false;
      } finally {
        beasiswaPendaftar.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.BeasiswaPendaftarGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      beasiswaPendaftar.findMany.loading = true;
      beasiswaPendaftar.findMany.page = page;
      beasiswaPendaftar.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.pendidikan.beasiswa.beasiswapendaftar[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          beasiswaPendaftar.findMany.data = res.data.data ?? [];
          beasiswaPendaftar.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          beasiswaPendaftar.findMany.data = [];
          beasiswaPendaftar.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch beasiswa pendaftar paginated:", err);
        beasiswaPendaftar.findMany.data = [];
        beasiswaPendaftar.findMany.totalPages = 1;
      } finally {
        beasiswaPendaftar.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.BeasiswaPendaftarGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/beasiswa/beasiswapendaftar/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          beasiswaPendaftar.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          beasiswaPendaftar.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        beasiswaPendaftar.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        beasiswaPendaftar.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/beasiswa/beasiswapendaftar/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Beasiswa berhasil dihapus");
          await beasiswaPendaftar.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus beasiswa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus beasiswa");
      } finally {
        beasiswaPendaftar.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultBeasiswaPendaftar },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/beasiswa/beasiswapendaftar/${id}`,
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
            namaLengkap: data.namaLengkap,
            nis: data.nis,
            kelas: data.kelas,
            jenisKelamin: data.jenisKelamin,
            alamatDomisili: data.alamatDomisili,
            tempatLahir: data.tempatLahir,
            tanggalLahir: data.tanggalLahir,
            namaOrtu: data.namaOrtu,
            nik: data.nik,
            pekerjaanOrtu: data.pekerjaanOrtu,
            penghasilan: data.penghasilan,
            noHp: data.noHp,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading beasiswa pendaftar:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateBeasiswaPendaftar.safeParse(
        beasiswaPendaftar.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        beasiswaPendaftar.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/beasiswa/beasiswapendaftar/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              namaLengkap: this.form.namaLengkap,
              nis: this.form.nis,
              kelas: this.form.kelas,
              jenisKelamin: this.form.jenisKelamin,
              alamatDomisili: this.form.alamatDomisili,
              tempatLahir: this.form.tempatLahir,
              tanggalLahir: this.form.tanggalLahir,
              namaOrtu: this.form.namaOrtu,
              nik: this.form.nik,
              pekerjaanOrtu: this.form.pekerjaanOrtu,
              penghasilan: this.form.penghasilan,
              noHp: this.form.noHp,
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
          toast.success("Berhasil update beasiswa pendaftar");
          await beasiswaPendaftar.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update beasiswa pendaftar");
        }
      } catch (error) {
        console.error("Error updating beasiswa pendaftar:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update beasiswa pendaftar"
        );
        return false;
      } finally {
        beasiswaPendaftar.update.loading = false;
      }
    },
    reset() {
      beasiswaPendaftar.update.id = "";
      beasiswaPendaftar.update.form = { ...defaultBeasiswaPendaftar };
    },
  },
});

export default beasiswaPendaftar;
