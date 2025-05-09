import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikJenisKelamin = z.object({
  laki: z.string().min(2, "Data laki-laki harus diisi"),
  perempuan: z.string().min(2, "Data perempuan harus diisi"),
});

type GrafikJenisKelamin = Prisma.GrafikBerdasarkanJenisKelaminGetPayload<{
  select: {
    laki: true;
    perempuan: true;
  };
}>;

const defaultForm: GrafikJenisKelamin = {
  laki: "",
  perempuan: "",
};

const grafikBerdasarkanJenisKelamin = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikJenisKelamin.safeParse(
        grafikBerdasarkanJenisKelamin.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanJenisKelamin.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikberdasarkanjeniskelamin[
          "create"
        ].post(grafikBerdasarkanJenisKelamin.create.form);
        if (res.status === 200) {
          grafikBerdasarkanJenisKelamin.create.form = defaultForm;
          grafikBerdasarkanJenisKelamin.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikBerdasarkanJenisKelamin.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikBerdasarkanJenisKelaminGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    loading: false,
    async load() {
      const res = await ApiFetch.api.ppid.grafikberdasarkanjeniskelamin[
        "find-many"
      ].get();
      if (res.status === 200) {
        grafikBerdasarkanJenisKelamin.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

const stateGrafikBerdasarkanJenisKelamin = proxy({
  grafikBerdasarkanJenisKelamin,
});
export default stateGrafikBerdasarkanJenisKelamin;
