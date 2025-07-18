import Elysia from "elysia";
import PengelolaanSampah from "./pengelolaan-sampah";
import ProgramPenghijauan from "./program-penghijauan";
import DataLingkunganDesa from "./data-lingkungan-desa";

const Lingkungan = new Elysia({
  prefix: "/api/lingkungan",
  tags: ["Lingkungan"],
})

.use(PengelolaanSampah)
.use(ProgramPenghijauan)
.use(DataLingkunganDesa)

export default Lingkungan;
