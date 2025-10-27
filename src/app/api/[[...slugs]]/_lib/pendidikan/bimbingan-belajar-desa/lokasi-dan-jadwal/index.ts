import Elysia, { t } from "elysia";
import lokasiDanJadwalFindUnique from "./findUnique";
import lokasiDanJadwalUpdate from "./updt";

const LokasiDanJadwal = new Elysia({
    prefix: "/lokasidanjadwal",
    tags: ["Pendidikan/Bimbingan Belajar Desa/Lokasi dan Jadwal"]
})
    .get("/find-by-id", lokasiDanJadwalFindUnique)
    .post("/update", lokasiDanJadwalUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default LokasiDanJadwal