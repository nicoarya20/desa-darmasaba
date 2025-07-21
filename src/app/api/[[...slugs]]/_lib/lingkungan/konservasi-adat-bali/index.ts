import Elysia from "elysia";
import BentukKonservasiBerdasarkanAdat from "./bentuk-konservasi-berdasarkan-adat";
import FilosofiTriHitaKarana from "./filosofi-tri-hita-karana";
import NilaiKonservasiAdatBali from "./nilai-konservasi-adat-bali";

const KonservasiAdatBali = new Elysia({
    prefix: "/konservasiadatbali",
    tags: ["Lingkungan/Konservasi Adat Bali"]
})

.use(BentukKonservasiBerdasarkanAdat)
.use(FilosofiTriHitaKarana)
.use(NilaiKonservasiAdatBali)

export default KonservasiAdatBali
