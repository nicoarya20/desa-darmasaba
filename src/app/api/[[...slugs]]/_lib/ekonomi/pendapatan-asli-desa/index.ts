import Elysia from "elysia";
import PendapatanAsli from "./pendapatan";
import Belanja from "./belanja";
import Pembiayaan from "./pembiayaan";
import APBDesa from "./apbDesa";

const PendapatanAsliDesa = new Elysia({
    prefix: "/pendapatanaslidesa",
    tags: ["Ekonomi/Pendapatan Asli Desa"],
})
.use(PendapatanAsli)
.use(Belanja)
.use(Pembiayaan)
.use(APBDesa)
export default PendapatanAsliDesa;