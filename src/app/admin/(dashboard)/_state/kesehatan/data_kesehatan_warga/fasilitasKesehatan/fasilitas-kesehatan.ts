/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, "Nama harus diisi"),

  informasiUmum: z.object({
    fasilitas: z.string().min(1),
    alamat: z.string().min(1),
    jamOperasional: z.string().min(1),
  }),

  layananUnggulan: z.object({
    content: z.string().min(1),
  }),

  dokterdanTenagaMedis: z.array(z.string()).min(1, "Minimal pilih 1 dokter"),

  fasilitasPendukung: z.object({
    content: z.string().min(1),
  }),

  prosedurPendaftaran: z.object({
    content: z.string().min(1),
  }),

  tarifDanLayanan: z.array(z.string()).min(1, "Minimal pilih 1 tarif"),
});

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
  dokterdanTenagaMedis: [] as string[],
  tarifDanLayanan: [] as string[],
  fasilitasPendukung: {
    content: "",
  },
  prosedurPendaftaran: {
    content: "",
  },
};

type DokterItem = {
  id: string;
  name: string;
  specialist: string;
  jadwal: string;
  jadwalLibur: string;
  jamBukaOperasional: string;
  jamTutupOperasional: string;
  jamBukaLibur: string;
  jamTutupLibur: string;
};

type TarifItem = {
  id: string;
  layanan: string;
  tarif: string;
};

const fasilitasKesehatan = proxy({
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
          await fasilitasKesehatan.findMany.load();
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
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      fasilitasKesehatan.findMany.loading = true;
      fasilitasKesehatan.findMany.page = page;
      fasilitasKesehatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan["fasilitas-kesehatan"][
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          fasilitasKesehatan.findMany.data = res.data.data ?? [];
          fasilitasKesehatan.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          fasilitasKesehatan.findMany.data = [];
          fasilitasKesehatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch fasilitas kesehatan paginated:", err);
        fasilitasKesehatan.findMany.data = [];
        fasilitasKesehatan.findMany.totalPages = 1;
      } finally {
        fasilitasKesehatan.findMany.loading = false;
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
        fasilitasKesehatan.findUnique.data = data.data ?? null;
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
      this.id = data.id;
      this.form = {
        name: data.name,
        informasiUmum: {
          fasilitas: data.informasiumum.fasilitas,
          alamat: data.informasiumum.alamat,
          jamOperasional: data.informasiumum.jamOperasional,
        },
        fasilitasPendukung: {
          content: data.fasilitaspendukung.content,
        },
        prosedurPendaftaran: {
          content: data.prosedurpendaftaran.content,
        },
        layananUnggulan: {
          content: data.layananunggulan.content,
        },
        dokterdanTenagaMedis:
          data.dokterdantenagamedis?.map((v: DokterItem) => v.id) ?? [],
        tarifDanLayanan:
          data.tarifdanlayanan?.map((v: TarifItem) => v.id) ?? [],
      };
    },
    async submit() {
      const cek = templateForm.safeParse(fasilitasKesehatan.edit.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        fasilitasKesehatan.edit.loading = true;
        const payload = {
          name: fasilitasKesehatan.edit.form.name,
          informasiUmum: {
            fasilitas: fasilitasKesehatan.edit.form.informasiUmum.fasilitas,
            alamat: fasilitasKesehatan.edit.form.informasiUmum.alamat,
            jamOperasional:
              fasilitasKesehatan.edit.form.informasiUmum.jamOperasional,
          },
          layananUnggulan: {
            content: fasilitasKesehatan.edit.form.layananUnggulan.content,
          },
          dokterdanTenagaMedis:
            fasilitasKesehatan.edit.form.dokterdanTenagaMedis,
          fasilitasPendukung: {
            content: fasilitasKesehatan.edit.form.fasilitasPendukung.content,
          },
          prosedurPendaftaran: {
            content: fasilitasKesehatan.edit.form.prosedurPendaftaran.content,
          },
          tarifDanLayanan: fasilitasKesehatan.edit.form.tarifDanLayanan,
        };

        const res = await fetch(
          `/api/kesehatan/fasilitas-kesehatan/${fasilitasKesehatan.edit.id}`,
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
        await fasilitasKesehatan.findMany.load();
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Terjadi kesalahan saat update"
        );
        return false;
      } finally {
        fasilitasKesehatan.edit.loading = false;
      }
    },
    resetForm() {
      fasilitasKesehatan.edit.id = "";
      fasilitasKesehatan.edit.form = { ...defaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      try {
        fasilitasKesehatan.delete.loading = true;
        const res = await fetch(
          `/api/kesehatan/fasilitas-kesehatan/del/${id}`,
          {
            method: "DELETE",
          }
        );

        const result = await res.json();
        if (res.ok && result.success) {
          toast.success("Fasilitas kesehatan berhasil dihapus");
          await fasilitasKesehatan.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus");
        }
      } catch {
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        fasilitasKesehatan.delete.loading = false;
      }
    },
  },
});

export default fasilitasKesehatan;
