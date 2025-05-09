import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikUmur = z.object({
    remaja: z.string().min(2, "Data remaja harus diisi"),
    dewasa: z.string().min(2, "Data dewasa harus diisi"),
    orangtua: z.string().min(2, "Data orangtua harus diisi"),
    lansia: z.string().min(2, "Data lansia harus diisi"),
});

type GrafikUmur = Prisma.GrafikBerdasarkanUmurGetPayload<{
    select: {
        remaja: true;
        dewasa: true;
        orangtua: true;
        lansia: true;
    };
}>;

const defaultForm: GrafikUmur = {
    remaja: "",
    dewasa: "",
    orangtua: "",
    lansia: "",
};

const grafikBerdasarkanUmur = proxy({
    create: {
        form: defaultForm,
        loading: false,
        async create() {
            const cek = templateGrafikUmur.safeParse(
                grafikBerdasarkanUmur.create.form
            );
            if (!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                grafikBerdasarkanUmur.create.loading = true;
                const res = await ApiFetch.api.ppid.grafikberdasarkanumur[
                    "create"
                ].post(grafikBerdasarkanUmur.create.form);
                if (res.status === 200) {
                    grafikBerdasarkanUmur.create.form = defaultForm;
                    grafikBerdasarkanUmur.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                grafikBerdasarkanUmur.create.loading = false;
            }
        },
    },
    findMany: {
        data: null as 
        | Prisma.GrafikBerdasarkanUmurGetPayload<{
            omit: { isActive: true };
        }>[]
        | null,
        loading: false,
        async load() {
            const res = await ApiFetch.api.ppid.grafikberdasarkanumur[
                "find-many"
            ].get();
            if (res.status === 200) {
                grafikBerdasarkanUmur.findMany.data = res.data?.data ?? [];
            }
        },
    },
})

const stateGrafikBerdasarkanUmur = proxy({
    grafikBerdasarkanUmur,
})

export default stateGrafikBerdasarkanUmur;