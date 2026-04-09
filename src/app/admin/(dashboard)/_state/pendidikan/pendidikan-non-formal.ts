import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// ========================================= TUJUAN PENDIDIKAN NON FORMAL ========================================= //

const templateTujuanPendidikanNonFormalForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type TujuanPendidikanNonFormalForm =
  Prisma.TujuanPendidikanNonFormalGetPayload<{
    select: {
      id: true;
      judul: true;
      deskripsi: true;
    };
  }>;

const stateTujuanPendidikanNonFormal = proxy({
  findById: {
    data: null as TujuanPendidikanNonFormalForm | null,
    loading: false,
    initialize() {
      stateTujuanPendidikanNonFormal.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as TujuanPendidikanNonFormalForm;
    },
    async load(id: string) {
      try {
        stateTujuanPendidikanNonFormal.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.pendidikannonformal.tujuanpendidikannonformal[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateTujuanPendidikanNonFormal.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data tujuan pendidikan non formal");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengambil data tujuan pendidikan non formal"
        );
      } finally {
        stateTujuanPendidikanNonFormal.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: TujuanPendidikanNonFormalForm) {
      const cek = templateTujuanPendidikanNonFormalForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateTujuanPendidikanNonFormal.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.pendidikannonformal.tujuanpendidikannonformal[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data tujuan pendidikan non formal berhasil diubah");
          await stateTujuanPendidikanNonFormal.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data tujuan pendidikan non formal");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengubah data tujuan pendidikan non formal"
        );
      } finally {
        stateTujuanPendidikanNonFormal.update.loading = false;
      }
    },
  },
});

// ========================================= TEMPAT KEGIATAN ========================================= //

const templateTempatKegiatanForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type TempatKegiatanForm = Prisma.TempatKegiatanGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateTempatKegiatan = proxy({
  findById: {
    data: null as TempatKegiatanForm | null,
    loading: false,
    initialize() {
      stateTempatKegiatan.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as TempatKegiatanForm;
    },
    async load(id: string) {
      try {
        stateTempatKegiatan.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.pendidikannonformal.tempatkegiatan[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateTempatKegiatan.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data tempat kegiatan");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data tempat kegiatan");
      } finally {
        stateTempatKegiatan.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: TempatKegiatanForm) {
      const cek = templateTempatKegiatanForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateTempatKegiatan.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.pendidikannonformal.tempatkegiatan[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data tempat kegiatan berhasil diubah");
          await stateTempatKegiatan.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data tempat kegiatan");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data tempat kegiatan");
      } finally {
        stateTempatKegiatan.update.loading = false;
      }
    },
  },
});

// ========================================= JENIS PROGRAM YANG DISELENGGARAKAN ========================================= //

const templateJenisProgramForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type JenisProgramForm = Prisma.JenisProgramYangDiselenggarakanGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateJenisProgram = proxy({
  findById: {
    data: null as JenisProgramForm | null,
    loading: false,
    initialize() {
      stateJenisProgram.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as JenisProgramForm;
    },
    async load(id: string) {
      try {
        stateJenisProgram.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.pendidikannonformal.jenisprogramyangdiselenggarakan[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateJenisProgram.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data jenis program");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data jenis program");
      } finally {
        stateJenisProgram.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: JenisProgramForm) {
      const cek = templateJenisProgramForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateJenisProgram.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.pendidikannonformal.jenisprogramyangdiselenggarakan[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data jenis program berhasil diubah");
          await stateJenisProgram.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data jenis program");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data jenis program");
      } finally {
        stateJenisProgram.update.loading = false;
      }
    },
  },
});

const pendidikanNonFormalState = proxy({
  stateTujuanPendidikanNonFormal,
  stateTempatKegiatan,
  stateJenisProgram,
});

export default pendidikanNonFormalState;
