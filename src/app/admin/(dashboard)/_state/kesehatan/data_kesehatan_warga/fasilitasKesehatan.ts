/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

//fasilitas kesehatan aja
// Validasi form
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

  // NOW ARRAY OF STRING (ID)
  dokterdanTenagaMedis: z.array(z.string()).min(1, "Minimal pilih 1 dokter"),

  fasilitasPendukung: z.object({
    content: z.string().min(1),
  }),

  prosedurPendaftaran: z.object({
    content: z.string().min(1),
  }),

  // NOW ARRAY OF STRING (ID)
  tarifDanLayanan: z.array(z.string()).min(1, "Minimal pilih 1 tarif"),
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

  dokterdanTenagaMedis: [] as string[], // ← array kosong
  tarifDanLayanan: [] as string[], // ← array kosong

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
      fasilitasKesehatanState.fasilitasKesehatan.findMany.loading = true; // ✅ Akses langsung via nama path
      fasilitasKesehatanState.fasilitasKesehatan.findMany.page = page;
      fasilitasKesehatanState.fasilitasKesehatan.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan["fasilitas-kesehatan"][
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          fasilitasKesehatanState.fasilitasKesehatan.findMany.data =
            res.data.data ?? [];
          fasilitasKesehatanState.fasilitasKesehatan.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          fasilitasKesehatanState.fasilitasKesehatan.findMany.data = [];
          fasilitasKesehatanState.fasilitasKesehatan.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch fasilitas kesehatan paginated:", err);
        fasilitasKesehatanState.fasilitasKesehatan.findMany.data = [];
        fasilitasKesehatanState.fasilitasKesehatan.findMany.totalPages = 1;
      } finally {
        fasilitasKesehatanState.fasilitasKesehatan.findMany.loading = false;
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
        // map relasi -> array of IDs
        layananUnggulan: {
          content: data.layananunggulan.content,
        },
        dokterdanTenagaMedis: data.dokterdantenagamedis?.map((v: DokterItem) => v.id) ?? [],
        tarifDanLayanan: data.tarifdanlayanan?.map((v: TarifItem) => v.id) ?? [],
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

//dokter & tenaga medis
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
      dokter.findMany.loading = true; // ✅ Akses langsung via nama path
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
        const response = await fetch(`/api/kesehatan/doktertenagamedis/${id}`, {
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
            specialist: data.specialist,
            jadwal: data.jadwal,
            jadwalLibur: data.jadwalLibur,
            jamBukaOperasional: data.jamBukaOperasional,
            jamTutupOperasional: data.jamTutupOperasional,
            jamBukaLibur: data.jamBukaLibur,
            jamTutupLibur: data.jamTutupLibur,
          };
          return data; // Return the loaded data
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
          await dokter.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus dokter dan tenaga medis"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus dokter dan tenaga medis");
      } finally {
        dokter.delete.loading = false;
      }
    },
  },
});

const templateTarifForm = z.object({
  tarif: z.string().min(1, "Tarif tidak boleh kosong"),
  layanan: z.string().min(1, "Layanan tidak boleh kosong"),
});

const defaultTarifForm = {
  tarif: "",
  layanan: "",
};

const tarif = proxy({
  create: {
    form: defaultTarifForm,
    loading: false,
    async create() {
      const cek = templateTarifForm.safeParse(tarif.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        tarif.create.loading = true;
        const res = await ApiFetch.api.kesehatan.tarifdanlayanan["create"].post(
          tarif.create.form
        );

        if (res.status === 200) {
          const id = res.data?.data;
          if (id) {
            toast.success("Sukses menambahkan");
            tarif.create.form = { ...defaultTarifForm };
            tarif.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        tarif.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.TarifDanLayananGetPayload<{
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
      tarif.findMany.loading = true; // ✅ Akses langsung via nama path
      tarif.findMany.page = page;
      tarif.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan.tarifdanlayanan[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          tarif.findMany.data = res.data.data ?? [];
          tarif.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          tarif.findMany.data = [];
          tarif.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch tarif dan layanan paginated:", err);
        tarif.findMany.data = [];
        tarif.findMany.totalPages = 1;
      } finally {
        tarif.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.TarifDanLayananGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/tarifdanlayanan/${id}`);
        if (res.ok) {
          const data = await res.json();
          tarif.findUnique.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch tarif dan layanan",
            res.statusText
          );
          tarif.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching tarif dan layanan", error);
        tarif.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultTarifForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/kesehatan/tarifdanlayanan/${id}`, {
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
            tarif: data.tarif,
            layanan: data.layanan
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading tarif dan layanan:", error);
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
        tarif: this.form.tarif,
        layanan: this.form.layanan
      };

      const cek = templateTarifForm.safeParse(formData);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v: any) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }

      try {
        this.loading = true;
        const res = await fetch(`/api/kesehatan/tarifdanlayanan/${id}`, {
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
        await tarif.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Gagal update data tarif dan layanan");
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
        tarif.delete.loading = true;

        const response = await fetch(
          `/api/kesehatan/tarifdanlayanan/del/${id}`,
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
            result.message || "tarif dan layanan berhasil dihapus"
          );
          await tarif.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus tarif dan layanan"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus tarif dan layanan");
      } finally {
        tarif.delete.loading = false;
      }
    },
  },
});

const fasilitasKesehatanState = proxy({
  fasilitasKesehatan,
  dokter,
  tarif
});

export default fasilitasKesehatanState;
