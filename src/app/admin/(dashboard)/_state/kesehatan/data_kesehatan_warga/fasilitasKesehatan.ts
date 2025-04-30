import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/* Informasi Umum */
const templateInformasiUmum = z.object({
  fasilitas: z.string().min(3, "Fasilitas minimal 3 karakter"),
  alamat: z.string().min(3, "Alamat minimal 3 karakter"),
  jamOperasional: z.string().min(3, "Jam Operasional minimal 3 karakter"),
});

type InfromasiUmum = Prisma.InformasiUmumGetPayload<{
  select: {
    fasilitas: true;
    alamat: true;
    jamOperasional: true;
  };
}>;

const informasiumum = proxy({
  create: {
    form: {} as InfromasiUmum,
    loading: false,
    async create() {
      const cek = templateInformasiUmum.safeParse(informasiumum.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        informasiumum.create.loading = true;
        const res = await ApiFetch.api.kesehatan.informasiumum["create"].post(
          informasiumum.create.form
        );
        if (res.status === 200) {
            informasiumum.findMany.load();
            return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        informasiumum.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.InformasiUmumGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.
      informasiumum["find-many"].get();
      if (res.status === 200) {
        informasiumum.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Layanan Unggulan */
const templateLayananUnggulanForm = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
});

type LayananUnggulan = Prisma.LayananUnggulanGetPayload<{
  select: {
    content: true;
  };
}>;

const layananunggulan = proxy({
  create: {
    form: {} as LayananUnggulan,
    loading: false,
    async create() {
      const cek = templateLayananUnggulanForm.safeParse(layananunggulan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        layananunggulan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.layananunggulan["create"].post(
          layananunggulan.create.form
        );
        if (res.status === 200) {
          layananunggulan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        layananunggulan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.LayananUnggulanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.
      layananunggulan["find-many"].get();
      if (res.status === 200) {
        layananunggulan.findMany.data = res.data?.data ?? [];
      }
    },
  },
})
/* ======================================================================= */  

/* Dokter dan Tenaga Medis */
const templateDokterdanTenagaMedis = z.object({
  name: z.string().min(3, "Name minimal 3 karakter"),
  specialist: z.string().min(3, "Specialist minimal 3 karakter"),
  jadwal: z.string().min(3, "Jadwal minimal 3 karakter"),
})

type DokterdanTenagaMedis = Prisma.DokterdanTenagaMedisGetPayload<{
  select: {
    name: true;
    specialist: true;
    jadwal: true;
  };
}>;

const dokterdantenagamedis = proxy({
  create: {
    form: {} as DokterdanTenagaMedis,
    loading: false,
    async create() {
      const cek = templateDokterdanTenagaMedis.safeParse(dokterdantenagamedis.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        dokterdantenagamedis.create.loading = true;
        const res = await ApiFetch.api.kesehatan.dokterdantenagamedis["create"].post(dokterdantenagamedis.create.form);
        if (res.status === 200) {
          dokterdantenagamedis.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        dokterdantenagamedis.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DokterdanTenagaMedisGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.dokterdantenagamedis["find-many"].get();
      if (res.status === 200) {
        dokterdantenagamedis.findMany.data = res.data?.data ?? [];
      }
    },
  },
})
/* ======================================================================= */  

/* Fasilitas Pendukung */
const templateFasilitasPendukung = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
})

type FasilitasPendukung = Prisma.FasilitasPendukungGetPayload<{
  select: {
    content: true;
  };
}>;

const fasilitaspendukung = proxy({
  create: {
    form: {} as FasilitasPendukung,
    loading: false,
    async create() {
      const cek = templateFasilitasPendukung.safeParse(fasilitaspendukung.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        fasilitaspendukung.create.loading = true;
        const res = await ApiFetch.api.kesehatan.fasilitaspendukung["create"].post(fasilitaspendukung.create.form);
        if (res.status === 200) {
          fasilitaspendukung.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        fasilitaspendukung.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.FasilitasPendukungGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.
      fasilitaspendukung["find-many"].get();
      if (res.status === 200) {
        fasilitaspendukung.findMany.data = res.data?.data ?? [];
      }
    },
  },
})
/* ======================================================================= */  

/* Tarif dan Layanan */
const templateTarifDanLayanan = z.object({
  layanan: z.string().min(3, "Layanan minimal 3 karakter"),
  tarif: z.string().min(3, "Tarif minimal 3 karakter"),
})

const tarifdanlayanan = proxy({
  create: {
    form: {} as Prisma.TarifDanLayananGetPayload<{ select: { layanan: true; tarif: true } }>,
    loading: false,
    async create() {
      const cek = templateTarifDanLayanan.safeParse(tarifdanlayanan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        tarifdanlayanan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.tarifdanlayanan["create"].post(tarifdanlayanan.create.form);
        if (res.status === 200) {
          tarifdanlayanan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        tarifdanlayanan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.TarifDanLayananGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.
      tarifdanlayanan["find-many"].get();
      if (res.status === 200) {
        tarifdanlayanan.findMany.data = res.data?.data ?? [];
      }
    },
  },
})
/* ======================================================================= */  

/* Prosedur Pendaftaran */
const templateProsedurPendaftaran = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
})

const prosedurpendaftaran = proxy({
  create: {
    form: {} as Prisma.ProsedurPendaftaranGetPayload<{ select: { content: true } }>,
    loading: false,
    async create() {
      const cek = templateProsedurPendaftaran.safeParse(prosedurpendaftaran.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        prosedurpendaftaran.create.loading = true;
        const res = await ApiFetch.api.kesehatan.prosedurpendaftaran["create"].post(prosedurpendaftaran.create.form);
        if (res.status === 200) {
          prosedurpendaftaran.findMany.load();
          return toast.success("success create"); 
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        prosedurpendaftaran.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.ProsedurPendaftaranGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.
      prosedurpendaftaran["find-many"].get();
      if (res.status === 200) {
        prosedurpendaftaran.findMany.data = res.data?.data ?? [];
      }
    },
  },
})

const stateFasilitasKesehatan = proxy({
  informasiumum,
  layananunggulan,
  dokterdantenagamedis,
  fasilitaspendukung,
  tarifdanlayanan,
  prosedurpendaftaran
})

export default stateFasilitasKesehatan
