import Elysia from "elysia";
import PengelolaanSampah from "./pengelolaan-sampah";
import ProgramPenghijauan from "./program-penghijauan";
import DataLingkunganDesa from "./data-lingkungan-desa";
import EdukasiLingkungan from "./edukasi-lingkungan";
import KonservasiAdatBali from "./konservasi-adat-bali";

const Lingkungan = new Elysia({
  prefix: "/api/lingkungan",
  tags: ["Lingkungan"],
})

.use(PengelolaanSampah)
.use(ProgramPenghijauan)
.use(DataLingkunganDesa)
.use(EdukasiLingkungan)
.use(KonservasiAdatBali)


export default Lingkungan;
