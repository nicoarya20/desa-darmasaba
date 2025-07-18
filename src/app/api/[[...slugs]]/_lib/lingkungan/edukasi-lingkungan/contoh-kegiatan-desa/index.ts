import Elysia, { t } from "elysia";
import contohKegiatanDesaFindUnique from "./findUnique";
import contohKegiatanDesaUpdate from "./updt";

const ContohKegiatanDesa = new Elysia({
    prefix: "/contohkegiatandesa",
    tags: ["Lingkungan/Edukasi Lingkungan/Contoh Kegiatan Desa"]
})
    .get("/find-by-id", contohKegiatanDesaFindUnique)
    .post("/update", contohKegiatanDesaUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default ContohKegiatanDesa