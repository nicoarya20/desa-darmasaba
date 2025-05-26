import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/* Sejarah */
const templateFormSejarahForm = z.object({
    sejarah: z.string().min(3, "Sejarah minimal 3 karakter"),
})

type SejarahForm = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        sejarah: true;
    }
}>

const Sejarah = proxy({
    findById: {
        data: null as SejarahForm | null,
        loading: false,
        initialize() {
            Sejarah.findById.data = {
                id: "",
                sejarah: "",
            } as SejarahForm;
        },
        async load(id: string) {
            try {
                Sejarah.findById.loading = true;
                const res = await ApiFetch.api.desa.profile["find-by-id"].get({
                    query: { id },
                });
                if (res.status === 200) {
                    Sejarah.findById.data = {
                        id: id,
                        sejarah: res.data?.data?.sejarah ?? ""
                    };
                } else {
                    toast.error("Gagal mengambil data sejarah");
                }
            } catch (error) {
                console.error((error as Error).message);
                toast.error("Terjadi kesalahan saat mengambil data sejarah");
            } finally {
                Sejarah.findById.loading = false;
            }
        }
    },
    update: {
        loading: false,
        async save(data: SejarahForm) {
            const cek = templateFormSejarahForm.safeParse(data);
            if (!cek.success) {
                const errors = cek.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
                toast.error(`Form tidak valid: ${errors}`);
                return;
            }
            try {
                Sejarah.update.loading = true;
                const res = await ApiFetch.api.desa.profile.sejarah["update"].post(data);
                if (res.status === 200) {
                    toast.success("Berhasil update sejarah");
                    await Sejarah.findById.load(data.id);
                } else {
                    toast.error("Gagal update sejarah");
                }
            } catch (error) {
                console.error((error as Error).message);
                toast.error("Terjadi kesalahan saat update sejarah");
            } finally {
                Sejarah.update.loading = false;
            }
        }
    }
})

/* Visi Misi Desa */
const templateFormVisiForm = z.object({
    visi: z.string().min(3, "Visi minimal 3 karakter"),
    misi: z.string().min(3, "Misi minimal 3 karakter")
})

type VisiMisiDesaForm = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        visi: true;
        misi: true;
    }
}>

const VisiMisiDesa = proxy({
    findById: {
        data: null as VisiMisiDesaForm | null,
        loading: false,
        initialize() {
            VisiMisiDesa.findById.data = {
                id: "",
                visi: "",
                misi: ""
            } as VisiMisiDesaForm;
        },
        async load(id: string) {
            try {
                VisiMisiDesa.findById.loading = true;
                const res = await ApiFetch.api.desa.profile["find-by-id"].get({
                    query: { id },
                });
                if (res.status === 200) {
                    VisiMisiDesa.findById.data = {
                        id: id,
                        visi: res.data?.data?.visi ?? "",
                        misi: res.data?.data?.misi ?? ""
                    };
                } else {
                    toast.error("Gagal mengambil data visi misi");
                }
            } catch (error) {
                console.error((error as Error).message);
                toast.error("Terjadi kesalahan saat mengambil data visi misi");
            } finally {
                VisiMisiDesa.findById.loading = false;
            }
        }
    },
    update: {
        loading: false,
        async save(data: VisiMisiDesaForm) {
            const cek = templateFormVisiForm.safeParse(data);
            if (!cek.success) {
                const errors = cek.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
                toast.error(`Form tidak valid: ${errors}`);
                return;
            }
            try {
                VisiMisiDesa.update.loading = true;
                const res = await ApiFetch.api.desa.profile.visimisiDesa["update"].post(data);
                if (res.status === 200) {
                    toast.success("Berhasil update visi misi");
                    await VisiMisiDesa.findById.load(data.id);
                } else {
                    toast.error("Gagal update visi");
                }
            } catch (error) {
                console.error((error as Error).message);
                toast.error("Terjadi kesalahan saat update visi misi");
            } finally {
                VisiMisiDesa.update.loading = false;
            }
        }
    }
})
/* Lambang Desa */
const templateFormLambangDesaForm = z.object({
    lambang: z.string().min(3, "Lambang minimal 3 karakter"),
})

type LambangDesaForm = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        lambang: true;
    }
}>

const LambangDesa = proxy({
    findById: {
        data: null as LambangDesaForm | null,
        loading: false,
        initialize() {
            LambangDesa.findById.data = {
                id: "",
                lambang: "",
            } as LambangDesaForm;
        },
        async load(id: string) {
            try {
                LambangDesa.findById.loading = true;
                const res = await ApiFetch.api.desa.profile["find-by-id"].get({
                    query: { id },
                });
                if (res.status === 200) {
                    LambangDesa.findById.data = {
                        id: id,
                        lambang: res.data?.data?.lambang ?? ""
                    };
                } else {
                    toast.error("Gagal mengambil data lambang desa");
                }
            } catch (error) {
                console.error((error as Error).message);
                toast.error("Terjadi kesalahan saat mengambil data lambang desa");
            } finally {
                LambangDesa.findById.loading = false;
            }
        }
    },
    update: {
        loading: false,
        async save(data: LambangDesaForm) {
            const cek = templateFormLambangDesaForm.safeParse(data);
            if (!cek.success) {
                const errors = cek.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
                toast.error(`Form tidak valid: ${errors}`);
                return;
            }
            try {
                LambangDesa.update.loading = true;
                const res = await ApiFetch.api.desa.profile.lambangDesa["update"].post(data);
                if (res.status === 200) {
                    toast.success("Berhasil update lambang desa");
                    await LambangDesa.findById.load(data.id);
                } else {
                    toast.error("Gagal update lambang desa");
                }
            } catch (error) {
                console.error((error as Error).message);
                toast.error("Terjadi kesalahan saat update lambang desa");
            } finally {
                LambangDesa.update.loading = false;
            }
        }
    }
});

const stateProfileDesa = {
    Sejarah,
    VisiMisiDesa,
    LambangDesa,
};


export default stateProfileDesa;
