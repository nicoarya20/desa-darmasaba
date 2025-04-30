import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/* Informasi Kegiatan */
const templateInformasiKegiatan = z.object({
  name: z.string().min(3, "Name minimal 3 karakter"),
  tanggal: z.string().min(3, "Tanggal minimal 3 karakter"),
  waktu: z.string().min(3, "Waktu minimal 3 karakter"),
  lokasi: z.string().min(3, "Lokasi minimal 3 karakter"),
});

type InformasiKegiatan = Prisma.InformasiJadwalKegiatanGetPayload<{
  select: {
    name: true;
    tanggal: true;
    waktu: true;
    lokasi: true;
  };
}>;

const informasiKegiatan = proxy({
  create: {
    form: {} as InformasiKegiatan,
    loading: false,
    async create() {
      const cek = templateInformasiKegiatan.safeParse(
        informasiKegiatan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        informasiKegiatan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.informasiJadwalKegiatan[
          "create"
        ].post(informasiKegiatan.create.form);
        if (res.status === 200) {
          informasiKegiatan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        informasiKegiatan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.InformasiJadwalKegiatanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.informasiJadwalKegiatan[
        "find-many"
      ].get();
      if (res.status === 200) {
        informasiKegiatan.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Deskripsi Kegiatan */
const templateDeskripsiKegiatan = z.object({
  deskripsi: z.string().min(3, "Content minimal 3 karakter"),
});

type DeskripsiKegiatan = Prisma.DeskripsiJadwalKegiatanGetPayload<{
  select: { deskripsi: true };
}>;

const deskripsiKegiatan = proxy({
  create: {
    form: {} as DeskripsiKegiatan,
    loading: false,
    async create() {
      const cek = templateDeskripsiKegiatan.safeParse(
        deskripsiKegiatan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        deskripsiKegiatan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.deskripsikegiatan[
          "create"
        ].post(deskripsiKegiatan.create.form);
        if (res.status === 200) {
          deskripsiKegiatan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        deskripsiKegiatan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DeskripsiJadwalKegiatanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.deskripsikegiatan[
        "find-many"
      ].get();
      if (res.status === 200) {
        deskripsiKegiatan.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Layanan Tersedia */
const templateLayananTersedia = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
});

type LayananTersedia = Prisma.LayananJadwalKegiatanGetPayload<{
  select: { content: true };
}>;

const layanantersedia = proxy({
  create: {
    form: {} as LayananTersedia,
    loading: false,
    async create() {
      const cek = templateLayananTersedia.safeParse(
        layanantersedia.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        layanantersedia.create.loading = true;
        const res = await ApiFetch.api.kesehatan.layanantersedia["create"].post(
          layanantersedia.create.form
        );
        if (res.status === 200) {
          layanantersedia.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        layanantersedia.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.LayananJadwalKegiatanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.layanantersedia[
        "find-many"
      ].get();
      if (res.status === 200) {
        layanantersedia.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Syarat dan Ketentuan */
const templateSyaratKetentuan = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
});

type SyaratKetentuan = Prisma.SyaratKetentuanJadwalKegiatanGetPayload<{
  select: { content: true };
}>;

const syaratketentuan = proxy({
  create: {
    form: {} as SyaratKetentuan,
    loading: false,
    async create() {
      const cek = templateSyaratKetentuan.safeParse(
       syaratketentuan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
       syaratketentuan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.syaratketentuan[
          "create"
        ].post(syaratketentuan.create.form);
        if (res.status === 200) {
         syaratketentuan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
       syaratketentuan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.SyaratKetentuanJadwalKegiatanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.syaratketentuan[
        "find-many"
      ].get();
      if (res.status === 200) {
        syaratketentuan.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Dokumen Yang Diperlukan */
const templateDokumenDiperlukan = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
});

type DokumenDiperlukan = Prisma.DokumenJadwalKegiatanGetPayload<{
  select: { content: true };
}>;

const dokumenjadwalkegiatan = proxy({
  create: {
    form: {} as DokumenDiperlukan,
    loading: false,
    async create() {
      const cek = templateDokumenDiperlukan.safeParse(
        dokumenjadwalkegiatan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        dokumenjadwalkegiatan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.dokumendiperlukan[
          "create"
        ].post(dokumenjadwalkegiatan.create.form);
        if (res.status === 200) {
          dokumenjadwalkegiatan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        dokumenjadwalkegiatan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DokumenJadwalKegiatanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.dokumendiperlukan[
        "find-many"
      ].get();
      if (res.status === 200) {
        dokumenjadwalkegiatan.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Pendaftaran */
const templatePendaftaran = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  tanggal: z.string().min(1),
  namaOrangtua: z.string().min(3, "Nama minimal 3 karakter"),
  nomor: z.string().min(9, "Nama minimal 9 karakter"),
  alamat: z.string().min(7, "Alamat minimal 7 karakter"),
  catatan: z.string().min(3, "Catatan minimal 3 karakter"),
})

type Pendaftaran = Prisma.PendaftaranJadwalKegiatanGetPayload<{
  select: {
    name: true;
    tanggal: true;
    namaOrangtua: true;
    nomor: true;
    alamat: true;
    catatan: true;
  }
}>

const pendaftaranjadwal = proxy({
  create: {
    form: {} as Pendaftaran,
    loading: false,
    async create() {
      const cek = templatePendaftaran.safeParse(pendaftaranjadwal.create.form);
      if(!cek.success) {
        const err = `[${cek.error.issues
        .map((v) => `${v.path.join(".")}`)
        .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pendaftaranjadwal.create.loading = true;
        const res = await ApiFetch.api.kesehatan.pendaftaranJadwalKegiatan["create"].post(
          pendaftaranjadwal.create.form);
          if (res.status === 200) {
            pendaftaranjadwal.findMany.load();
            return toast.success("success create")
          }
          return toast.error("failed create")
      } catch (error) {
        console.log((error as Error).message)
      } finally {
        pendaftaranjadwal.create.loading = false;
      }
    }
  },
  findMany: {
    data: null as
    | Prisma.PendaftaranJadwalKegiatanGetPayload<{omit: {isActive: true}}>[]
    | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.
      pendaftaranJadwalKegiatan["find-many"].get();
      if(res.status === 200) {
        pendaftaranjadwal.findMany.data = res.data?.data ?? [];
      }
    }
  }
})

const stateJadwalKegiatan = proxy({
  informasiKegiatan,
  deskripsiKegiatan,
  layanantersedia,
  syaratketentuan,
  dokumenjadwalkegiatan,
  pendaftaranjadwal
});
export default stateJadwalKegiatan;
