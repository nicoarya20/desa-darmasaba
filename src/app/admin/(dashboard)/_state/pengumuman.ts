/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch"
import { Prisma } from "@prisma/client"
import { toast } from "react-toastify"
import { proxy } from "valtio"
import { z } from "zod"

const templateFormPengumuman = z.object({
    judul: z.string().min(3, "Judul minimal 3 karakter"),
    deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
    content: z.string().min(3, "Content minimal 3 karakter"),
    categoryPengumumanId: z.string().nonempty(),
})

const category = proxy ({
    findMany: {
        data: null as
          | null
          | Prisma.CategoryPengumumanGetPayload<{ omit: { isActive: true } }>[],
          async load() {
            const res = await ApiFetch.api.desa.pengumuman.category["find-many"].get();
            if (res.status === 200) {
                category.findMany.data = res.data?.data as any ?? [];
            }
          }
    }
})

type PengumumanForm = Prisma.PengumumanGetPayload<{
    select: {
        judul: true;
        deskripsi: true;
        content: true;
        categoryPengumumanId: true;
    }
}>
const pengumuman = proxy({
create: {
    form: {} as PengumumanForm,
    loading: false,
    async create() {
       const cek = templateFormPengumuman.safeParse(pengumuman.create.form);
       if (!cek.success) {
        const err = `[${cek.error.issues
        .map((v) => `${v.path.join(".")}`)
        .join("\n")}] required`;
        return toast.error(err);
       }
       try {
        pengumuman.create.loading = true;
        const res = await ApiFetch.api.desa.pengumuman["create"].post(pengumuman.create.form)
        if (res.status === 200) {
            pengumuman.findMany.load();
            return toast.success("success create");
        }
        console.log(res)
        return toast.error("failed create");
       } catch (error) {
        console.log((error as Error).message);
       } finally{
        pengumuman.create.loading = false;
       }
    }
},
findMany: {
    data: null as
    | Prisma.PengumumanGetPayload<{omit: {isActive: true}}>[]
    | null,
    async load () {
        const res = await ApiFetch.api.desa.pengumuman["find-many"].get();
        console.log(res)
        if (res.status === 200) {
            pengumuman.findMany.data = res.data?.data ?? [];
        }
    }
}
})

const stateDesaPengumuman = proxy({
    category,
    pengumuman
})
export default stateDesaPengumuman