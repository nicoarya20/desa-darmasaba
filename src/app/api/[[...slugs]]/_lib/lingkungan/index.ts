import Elysia from "elysia";
import PengelolaanSampah from "./pengelolaan-sampah";
import ProgramPenghijauan from "./program-penghijauan";

const Lingkungan = new Elysia({
  prefix: "/api/lingkungan",
  tags: ["Lingkungan"],
})

.use(PengelolaanSampah)
.use(ProgramPenghijauan)

export default Lingkungan;
