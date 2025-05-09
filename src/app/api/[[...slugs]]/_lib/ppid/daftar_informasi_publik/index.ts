import Elysia, { t } from "elysia";
import daftarInformasiPublikCreate from "./create";
import daftarInformasiPublikFindMany from "./find-many";

const DaftarInformasiPublik = new Elysia({
    prefix: "/daftarinformasipublik",
    tags: ["PPID/Daftar Informasi Publik"]
})
    .get("/find-many", daftarInformasiPublikFindMany)
    .post("/create", daftarInformasiPublikCreate, {
        body: t.Object({
            jenisInformasi: t.String(),
            deskripsi: t.String(),
            tanggal: t.String(),
        }),
    })

export default DaftarInformasiPublik