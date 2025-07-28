import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// ========================================= TUJUAN PROGRAM ========================================= //

const templateTujuanProgramForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type TujuanProgramForm = Prisma.TujuanProgramGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateTujuanProgram = proxy({
  findById: {
    data: null as TujuanProgramForm | null,
    loading: false,
    initialize() {
      stateTujuanProgram.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as TujuanProgramForm;
    },
    async load(id: string) {
      try {
        stateTujuanProgram.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.programpendidikananak.tujuanprogram[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateTujuanProgram.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data tujuan program");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data tujuan program");
      } finally {
        stateTujuanProgram.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: TujuanProgramForm) {
      const cek = templateTujuanProgramForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateTujuanProgram.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.programpendidikananak.tujuanprogram[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data tujuan program berhasil diubah");
          await stateTujuanProgram.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data tujuan program");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data tujuan program");
      } finally {
        stateTujuanProgram.update.loading = false;
      }
    },
  },
});

// ========================================= PROGRAM UNGGULAN ========================================= //

const templateProgramUnggulanForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type ProgramUnggulanForm = Prisma.ProgramUnggulanGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const programUnggulanState = proxy({
  findById: {
    data: null as ProgramUnggulanForm | null,
    loading: false,
    initialize() {
      programUnggulanState.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as ProgramUnggulanForm;
    },
    async load(id: string) {
      try {
        programUnggulanState.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.programpendidikananak.programunggulan[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          programUnggulanState.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data program pendidikan anak");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengambil data program pendidikan anak"
        );
      } finally {
        programUnggulanState.findById.loading = false;
      }
    },
  },
  update: {
    loading: false,
    async save(data: ProgramUnggulanForm) {
      const cek = templateProgramUnggulanForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        programUnggulanState.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.programpendidikananak.programunggulan[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data program pendidikan anak berhasil diubah");
          await programUnggulanState.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data program pendidikan anak");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengubah data program pendidikan anak"
        );
      } finally {
        programUnggulanState.update.loading = false;
      }
    },
  },
});

const stateProgramPendidikanAnak = proxy({
  stateTujuanProgram,
  programUnggulanState,
});

export default stateProgramPendidikanAnak;
