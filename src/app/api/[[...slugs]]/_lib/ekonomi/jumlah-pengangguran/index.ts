import Elysia from "elysia";
import DetailDataPengangguran from "./detail-data-pengangguran";
import RingkasanDataPengangguran from "./ringkasan-data-pengangguran";
import SedangMencariKerja from "./sedang-mencari-kerja";

const JumlahPengangguran = new Elysia({
    prefix: "/jumlahpengangguran",
})
.use(DetailDataPengangguran)
.use(RingkasanDataPengangguran)
.use(SedangMencariKerja)

export default JumlahPengangguran;