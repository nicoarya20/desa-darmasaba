import Elysia, { t } from "elysia";
import bentukKonservasiBerdasarkanAdatFindUnique from "./findUnique";
import bentukKonservasiBerdasarkanAdatUpdate from "./updt";

const BentukKonservasiBerdasarkanAdat = new Elysia({
    prefix: "/bentukkonservasiberdasarkanadat",
    tags: ["Lingkungan/Konservasi Adat Bali/Bentuk Konservasi Berdasarkan Adat"]
})
    .get("/find-by-id", bentukKonservasiBerdasarkanAdatFindUnique)
    .post("/update", bentukKonservasiBerdasarkanAdatUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default BentukKonservasiBerdasarkanAdat