import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePersentase = z.object({
  tahun: z.string().min(4, "Tahun harus diisi"),
  kematianKasar: z.string().min(2, "Kematian kasar harus diisi"),
  kelahiranKasar: z.string().min(2, "Kelahiran kasar harus diisi"),
  kematianBayi: z.string().min(2, "Kematian bayi harus diisi"),
});

type Persentase = Prisma.DataKematian_KelahiranGetPayload<{
  select: {
    tahun: true;
    kematianKasar: true;
    kelahiranKasar: true;
    kematianBayi: true;
  };
}>;

const defaultForm: Persentase = {
  tahun: "",
  kematianKasar: "",
  kelahiranKasar: "",
  kematianBayi: "",
};

const persentasekelahiran = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templatePersentase.safeParse(persentasekelahiran.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        persentasekelahiran.create.loading = true;
        const res = await ApiFetch.api.kesehatan.persentasekelahiran[
          "create"
        ].post(persentasekelahiran.create.form);
        if (res.status === 200) {
          persentasekelahiran.create.form = {
            tahun: "",
            kematianKasar: "",
            kelahiranKasar: "",
            kematianBayi: "",
          };
          persentasekelahiran.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        persentasekelahiran.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DataKematian_KelahiranGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.persentasekelahiran[
        "find-many"
      ].get();
      if (res.status === 200) {
        persentasekelahiran.findMany.data = res.data?.data ?? [];
      }
    },
  },
});

const statePersentase = proxy({
  persentasekelahiran,
});

export default statePersentase;
