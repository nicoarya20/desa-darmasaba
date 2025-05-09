import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikResponden = z.object({
  sangatbaik: z.string().min(1, "Data sangat baik harus diisi"),
  baik: z.string().min(1, "Data baik harus diisi"),
  kurangbaik: z.string().min(1, "Data kurang baik harus diisi"),
  tidakbaik: z.string().min(1, "Data tidak baik harus diisi"),
});

type GrafikResponden = Prisma.GrafikBerdasarkanRespondenGetPayload<{
  select: {
    sangatbaik: true;
    baik: true;
    kurangbaik: true;
    tidakbaik: true;
  };
}>;

const defaultForm: GrafikResponden = {
  sangatbaik: "",
  baik: "",
  kurangbaik: "",
  tidakbaik: "",
};

const grafikBerdasarkanResponden = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikResponden.safeParse(
        grafikBerdasarkanResponden.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikBerdasarkanResponden.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikberdasarkanresponden[
          "create"
        ].post(grafikBerdasarkanResponden.create.form);
        if (res.status === 200) {
          grafikBerdasarkanResponden.create.form = defaultForm;
          grafikBerdasarkanResponden.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikBerdasarkanResponden.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikBerdasarkanRespondenGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    loading: false,
    async load() {
      const res = await ApiFetch.api.ppid.grafikberdasarkanresponden[
        "find-many"
      ].get();
      if (res.status === 200) {
        grafikBerdasarkanResponden.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

const stateGrafikResponden = proxy({
  grafikBerdasarkanResponden,
});

export default stateGrafikResponden;