import Elysia from "elysia";
import JenisProgramYangDiselenggarakan from "./jenis-program-yang-diselenggarakan";
import TujuanPendidikanNonFormal from "./tujuan-program";
import TempatKegiatan from "./tempat-kegiatan";

const PendidikanNonFormal = new Elysia({
    prefix: "/pendidikannonformal",
    tags: ["Pendidikan/Pendidikan Non Formal"]
})
.use(JenisProgramYangDiselenggarakan)
.use(TujuanPendidikanNonFormal)
.use(TempatKegiatan)

export default PendidikanNonFormal
