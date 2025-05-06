import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDaftarInformasi = z.object({
    jenisInformasi: z.string().min(3, "Jenis Informasi minimal 3 karakter"),
    deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
    tanggal: z.string().min(3, "Tanggal minimal 3 karakter"),
})

type DaftarInformasi = Prisma.DaftarInformasiPublikGetPayload<{
    select: {
        jenisInformasi: true;
        deskripsi: true;
        tanggal: true;
    };
}>;

const daftarInformasi = proxy({
    create: {
        form: {} as DaftarInformasi,
        loading: false,
        async create() {
            const cek = templateDaftarInformasi.safeParse(daftarInformasi.create.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                daftarInformasi.create.loading = true;
                const res = await ApiFetch.api.ppid.daftarinformasipublik["create"].post(daftarInformasi.create.form);
                if (res.status === 200) {
                    daftarInformasi.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                daftarInformasi.create.loading = false;
            }
        },
    },
    findMany: {
        data: null as
        | Prisma.DaftarInformasiPublikGetPayload<{ omit: { isActive: true } }>[]
        | null,
        async load() {
            const res = await ApiFetch.api.ppid.daftarinformasipublik["find-many"].get();
            if (res.status === 200) {
                daftarInformasi.findMany.data = res.data?.data ?? [];
            }
        }
    }
    });

    const stateDaftarInformasiPublik = proxy({
        daftarInformasi
    })

    export default stateDaftarInformasiPublik;