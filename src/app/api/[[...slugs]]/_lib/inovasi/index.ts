import Elysia from "elysia";
import DesaDigital from "./desa-digital";
import ProgramKreatif from "./program-kreatif";

const Inovasi = new Elysia({
  prefix: "/api/inovasi",
  tags: ["Inovasi"],
})
  .use(DesaDigital)
  .use(ProgramKreatif)

export default Inovasi;
