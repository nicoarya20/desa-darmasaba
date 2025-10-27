import Elysia, { t } from "elysia";
import filosofiTriHitaKaranaFindUnique from "./findUnique";
import filosofiTriHitaKaranaUpdate from "./updt";

const FilosofiTriHitaKarana = new Elysia({
    prefix: "/filosofitrihitakarana",
    tags: ["Lingkungan/Konservasi Adat Bali/Filosofi Tri Hita Karana"]
})
    .get("/find-by-id", filosofiTriHitaKaranaFindUnique)
    .post("/update", filosofiTriHitaKaranaUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default FilosofiTriHitaKarana