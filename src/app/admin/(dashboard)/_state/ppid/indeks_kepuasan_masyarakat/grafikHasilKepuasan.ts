import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikHasilKepuasanMasyarakat = z.object({
  label: z.string().min(2, "Label harus diisi"),
  kepuasan: z.string().min(2, "Kepuasan harus diisi"),
});

type GrafikHasilKepuasanMasyarakat = Prisma.IndeksKepuasanMasyarakatGetPayload<{
  select: {
    label: true;
    kepuasan: true;
  };
}>;

const defaultForm: GrafikHasilKepuasanMasyarakat = {
  label: "",
  kepuasan: "",
};

const grafikHasilKepuasanMasyarakat = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikHasilKepuasanMasyarakat.safeParse(
        grafikHasilKepuasanMasyarakat.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikHasilKepuasanMasyarakat.create.loading = true;
        const res = await ApiFetch.api.ppid.grafikhasilkepuasamanmasyarakat["create"].post(
          grafikHasilKepuasanMasyarakat.create.form
        );
        if (res.status === 200) {
          grafikHasilKepuasanMasyarakat.create.form = {
            label: "",
            kepuasan: ""
          };
          grafikHasilKepuasanMasyarakat.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikHasilKepuasanMasyarakat.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
    | Prisma.IndeksKepuasanMasyarakatGetPayload<{ omit: { isActive: true } }>[]
    | null,
    async load() {
        const res = await ApiFetch.api.ppid.grafikhasilkepuasamanmasyarakat["find-many"].get();
        if (res.status === 200) {
            grafikHasilKepuasanMasyarakat.findMany.data = res.data?.data ?? [];
        }
    }
  }
});

const stateGrafikHasilKepuasanMasyarakat = proxy({
  grafikHasilKepuasanMasyarakat,
});

export default stateGrafikHasilKepuasanMasyarakat;
