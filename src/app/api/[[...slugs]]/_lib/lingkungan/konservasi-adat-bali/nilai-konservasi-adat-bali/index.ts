import Elysia, { t } from "elysia";
import nilaiKonservasiAdatBaliFindUnique from "./findUnique";
import nilaiKonservasiAdatBaliUpdate from "./updt";

const NilaiKonservasiAdatBali = new Elysia({
    prefix: "/nilaikonservasiadatbali",
    tags: ["Lingkungan/Konservasi Adat Bali/Nilai Konservasi Adat Bali"]
})
    .get("/find-by-id", nilaiKonservasiAdatBaliFindUnique)
    .post("/update", nilaiKonservasiAdatBaliUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default NilaiKonservasiAdatBali