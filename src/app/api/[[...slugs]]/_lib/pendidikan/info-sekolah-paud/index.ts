import Elysia from "elysia";
import JenjangPendidikan from "./jenjang-pendidikan";
import Pengajar from "./pengajar";
import Siswa from "./siswa";
import LembagaPendidikan from "./lembaga";

const InfoSekolahPAUD = new Elysia({
  prefix: "/infosekolahpaud",
  tags: ["Pendidikan/Info Sekolah PAUD"],
})

.use(JenjangPendidikan)
.use(Siswa)
.use(Pengajar)
.use(LembagaPendidikan)

export default InfoSekolahPAUD;
