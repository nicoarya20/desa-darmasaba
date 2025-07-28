import Elysia from "elysia";
import InfoSekolahPAUD from "./info-sekolah-paud";
import ProgramPendidikanAnak from "./program-pendidikan-anak";
import BimbinganBelajarDesa from "./bimbingan-belajar-desa";

const Pendidikan = new Elysia({
    prefix: "/api/pendidikan",
    tags: ["Pendidikan"]
})

.use(InfoSekolahPAUD)
.use(ProgramPendidikanAnak)
.use(BimbinganBelajarDesa)

export default Pendidikan;