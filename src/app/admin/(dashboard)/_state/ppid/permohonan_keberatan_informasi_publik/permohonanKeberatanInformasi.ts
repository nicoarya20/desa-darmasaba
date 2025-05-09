import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().min(3, "Email minimal 3 karakter"),
    notelp: z.string().min(3, "Nomor Telepon minimal 3 karakter"),
    alasan: z.string().min(3, "Alasan minimal 3 karakter"),
})

type PermohonanKeberatanInformasiForm = Prisma.FormulirPermohonanKeberatanGetPayload<{
    select: {
        name: true;
        email: true;
        notelp: true;
        alasan: true;
    };
}>;

const permohonanKeberatanInformasiForm = proxy({
    create: {
        form: {} as PermohonanKeberatanInformasiForm,
        loading: false,
        async create(){
            const cek = templateForm.safeParse(permohonanKeberatanInformasiForm.create.form);
            if(!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                permohonanKeberatanInformasiForm.create.loading = true;
                const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik["create"].post(permohonanKeberatanInformasiForm.create.form);
                if (res.status === 200) {
                    permohonanKeberatanInformasiForm.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                permohonanKeberatanInformasiForm.create.loading = false;
            }
        },
    },
    findMany: {
        data: null as
        | Prisma.FormulirPermohonanKeberatanGetPayload<{omit: {isActive: true}}>[]
        | null,
        async load() {
            const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik["find-many"].get();
            if (res.status === 200) {
                permohonanKeberatanInformasiForm.findMany.data = res.data?.data ?? [];
            }
        }
    }
});

const statePermohonanKeberatan = proxy({
    permohonanKeberatanInformasiForm,
})

export default statePermohonanKeberatan;

