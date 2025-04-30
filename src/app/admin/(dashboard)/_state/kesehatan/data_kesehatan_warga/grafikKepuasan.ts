import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikKepuasan = z.object({
  label: z.string().min(2, "Label harus diisi"),
  jumlah: z.string().min(2, "Jumlah harus diisi"),
});

type GrafikKepuasan = Prisma.GrafikKepuasanGetPayload<{
  select: {
    label: true;
    jumlah: true;
  };
}>;

const defaultForm: GrafikKepuasan = {
  label: "",
  jumlah: ""
};

const grafikkepuasan = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikKepuasan.safeParse(grafikkepuasan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        grafikkepuasan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.grafikkepuasan["create"].post(
          grafikkepuasan.create.form
        );
        if (res.status === 200) {
          grafikkepuasan.create.form = {
            label: "",
            jumlah: ""
          };
          grafikkepuasan.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        grafikkepuasan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikKepuasanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.grafikkepuasan[
        "find-many"
      ].get();
      if (res.status === 200) {
        grafikkepuasan.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

const stategrafikKepuasan = proxy({
  grafikkepuasan,
});

export default stategrafikKepuasan;
