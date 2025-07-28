import Elysia from "elysia";
import TujuanProgram from "./tujuan-program";
import LokasiDanJadwal from "./lokasi-dan-jadwal";
import FasilitasYangDisediakan from "./fasilitas-yang-disediakan";

const BimbinganBelajarDesa = new Elysia({
    prefix: "/bimbinganbelajardesa",
    tags: ["Pendidikan/Bimbingan Belajar Desa"]
})
.use(TujuanProgram)
.use(LokasiDanJadwal)
.use(FasilitasYangDisediakan)

export default BimbinganBelajarDesa