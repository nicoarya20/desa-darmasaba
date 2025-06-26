/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// Validasi form
const templateForm = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  informasiUmum: z.object({
    fasilitas: z.string().min(1, "Fasilitas harus diisi"),
    alamat: z.string().min(1, "Alamat harus diisi"),
    jamOperasional: z.string().min(1, "Jam operasional harus diisi"),
  }),
  layananUnggulan: z.object({
    content: z.string().min(1, "Layanan unggulan harus diisi"),
  }),
  dokterdanTenagaMedis: z.object({
    name: z.string().min(1, "Nama dokter harus diisi"),
    specialist: z.string().min(1, "Spesialis harus diisi"),
    jadwal: z.string().min(1, "Jadwal harus diisi"),
  }),
  fasilitasPendukung: z.object({
    content: z.string().min(1, "Fasilitas pendukung harus diisi"),
  }),
  prosedurPendaftaran: z.object({
    content: z.string().min(1, "Prosedur pendaftaran harus diisi"),
  }),
  tarifDanLayanan: z.object({
    layanan: z.string().min(1, "Layanan harus diisi"),
    tarif: z.string().min(1, "Tarif harus diisi"),
  }),
});

// Default form kosong
const defaultForm = {
  name: "",
  informasiUmum: {
    fasilitas: "",
    alamat: "",
    jamOperasional: "",
  },
  layananUnggulan: {
    content: "",
  },
  dokterdanTenagaMedis: {
    name: "",
    specialist: "",
    jadwal: "",
  },
  fasilitasPendukung: {
    content: "",
  },
  prosedurPendaftaran: {
    content: "",
  },
  tarifDanLayanan: {
    layanan: "",
    tarif: "",
  },
};

const fasilitasKesehatanState = proxy({
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
          "fasilitas-kesehatan"
        ].create.post(payload);

        if (res.status === 200) {
          toast.success("Berhasil menambahkan fasilitas kesehatan");
          this.resetForm();
          await fasilitasKesehatanState.findMany.load();
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
      | Prisma.FasilitasKesehatanGetPayload<{
          include: {
            informasiumum: true;
            layananunggulan: true;
            dokterdantenagamedis: true;
            fasilitaspendukung: true;
            prosedurpendaftaran: true;
            tarifdanlayanan: true;
          };
        }>[]
      | null,
    loading: false,
    async load() {
      try {
        this.loading = true;
        const res = await (ApiFetch.api.kesehatan as any)[
          "fasilitas-kesehatan"
        ]["find-many"].get();

        if (res.status === 200) {
          this.data = res.data?.data ?? [];
        } else {
          toast.error("Gagal memuat data fasilitas kesehatan");
        }

        return res;
      } catch (err) {
        toast.error("Terjadi error saat load data");
        console.error("LOAD ERROR:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.FasilitasKesehatanGetPayload<{
      include: {
        informasiumum: true;
        layananunggulan: true;
        dokterdantenagamedis: true;
        fasilitaspendukung: true;
        prosedurpendaftaran: true;
        tarifdanlayanan: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/fasilitas-kesehatan/${id}`);
      if (res.ok) {
        const data = await res.json();
        fasilitasKesehatanState.findUnique.data = data.data ?? null;
      } else {
        toast.error("Gagal load data fasilitas kesehatan");
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/fasilitas-kesehatan/${id}`);
      if (!res.ok) {
        toast.error("Gagal load data fasilitas kesehatan");
        return;
      }

      const result = await res.json();
      const data = result.data;

      fasilitasKesehatanState.edit.id = data.id;
      fasilitasKesehatanState.edit.form = {
        name: data.name,
        informasiUmum: {
          fasilitas: data.informasiumum.fasilitas,
          alamat: data.informasiumum.alamat,
          jamOperasional: data.informasiumum.jamOperasional,
        },
        layananUnggulan: {
          content: data.layananunggulan.content,
        },
        dokterdanTenagaMedis: {
          name: data.dokterdantenagamedis.name,
          specialist: data.dokterdantenagamedis.specialist,
          jadwal: data.dokterdantenagamedis.jadwal,
        },
        fasilitasPendukung: {
          content: data.fasilitaspendukung.content,
        },
        prosedurPendaftaran: {
          content: data.prosedurpendaftaran.content,
        },
        tarifDanLayanan: {
          layanan: data.tarifdanlayanan.layanan,
          tarif: data.tarifdanlayanan.tarif,
        },
      };
    },
    async submit() {
      const cek = templateForm.safeParse(fasilitasKesehatanState.edit.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        fasilitasKesehatanState.edit.loading = true;
        const payload = {
          name: fasilitasKesehatanState.edit.form.name,
          informasiUmum: {
            fasilitas:
              fasilitasKesehatanState.edit.form.informasiUmum.fasilitas,
            alamat: fasilitasKesehatanState.edit.form.informasiUmum.alamat,
            jamOperasional:
              fasilitasKesehatanState.edit.form.informasiUmum.jamOperasional,
          },
          layananUnggulan: {
            content: fasilitasKesehatanState.edit.form.layananUnggulan.content,
          },
          dokterdanTenagaMedis: {
            name: fasilitasKesehatanState.edit.form.dokterdanTenagaMedis.name,
            specialist:
              fasilitasKesehatanState.edit.form.dokterdanTenagaMedis.specialist,
            jadwal:
              fasilitasKesehatanState.edit.form.dokterdanTenagaMedis.jadwal,
          },
          fasilitasPendukung: {
            content:
              fasilitasKesehatanState.edit.form.fasilitasPendukung.content,
          },
          prosedurPendaftaran: {
            content:
              fasilitasKesehatanState.edit.form.prosedurPendaftaran.content,
          },
          tarifDanLayanan: {
            layanan: fasilitasKesehatanState.edit.form.tarifDanLayanan.layanan,
            tarif: fasilitasKesehatanState.edit.form.tarifDanLayanan.tarif,
          },
        };

        const res = await fetch(
          `/api/kesehatan/fasilitas-kesehatan/${fasilitasKesehatanState.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Update gagal");
        }

        toast.success("Berhasil update fasilitas kesehatan");
        await fasilitasKesehatanState.findMany.load();
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Terjadi kesalahan saat update"
        );
        return false;
      } finally {
        fasilitasKesehatanState.edit.loading = false;
      }
    },
    resetForm() {
      fasilitasKesehatanState.edit.id = "";
      fasilitasKesehatanState.edit.form = { ...defaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string){
      try {
        fasilitasKesehatanState.delete.loading = true;
        const res = await fetch(`/api/kesehatan/fasilitas-kesehatan/del/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();
        if (res.ok && result.success) {
          toast.success("Fasilitas kesehatan berhasil dihapus");
          await fasilitasKesehatanState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus");
        }
      } catch {
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        fasilitasKesehatanState.delete.loading = false;
      }
    }
  },
});

export default fasilitasKesehatanState;
