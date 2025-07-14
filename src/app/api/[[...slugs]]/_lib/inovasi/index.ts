import Elysia from "elysia";
import DesaDigital from "./desa-digital";
import ProgramKreatif from "./program-kreatif";
import KolaborasiInovasi from "./kolaborasi-inovasi";

const Inovasi = new Elysia({
  prefix: "/api/inovasi",
  tags: ["Inovasi"],
})
  .use(DesaDigital)
  .use(ProgramKreatif)
  .use(KolaborasiInovasi)

export default Inovasi;
