import Elysia from "elysia";
import DesaDigital from "./desa-digital";
import ProgramKreatif from "./program-kreatif";
import KolaborasiInovasi from "./kolaborasi-inovasi";
import InfoTekno from "./info-teknologi";
import AjukanIdeInovatif from "./ajukan-ide-inovatif";
import LayananOnlineDesa from "./layanan-online-desa";

const Inovasi = new Elysia({
  prefix: "/api/inovasi",
  tags: ["Inovasi"],
})
  .use(DesaDigital)
  .use(ProgramKreatif)
  .use(KolaborasiInovasi) 
  .use(InfoTekno)
  .use(AjukanIdeInovatif)
  .use(LayananOnlineDesa)

export default Inovasi;
