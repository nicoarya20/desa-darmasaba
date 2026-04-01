import Elysia from "elysia";
import DesaDigital from "./desa-digital";
import ProgramKreatif from "./program-kreatif";
import KolaborasiInovasi from "./kolaborasi-inovasi";
import InfoTekno from "./info-teknologi";
import AjukanIdeInovatif from "./ajukan-ide-inovatif";
import LayananOnlineDesa from "./layanan-online-desa";
import MitraKolaborasi from "./kolaborasi-inovasi/mitra-kolaborasi";

const Inovasi = new Elysia({
  prefix: "/inovasi",
  tags: ["Inovasi"],
})
  .use(DesaDigital)
  .use(ProgramKreatif)
  .use(KolaborasiInovasi) 
  .use(InfoTekno)
  .use(AjukanIdeInovatif)
  .use(LayananOnlineDesa)
  .use(MitraKolaborasi)
  
export default Inovasi;
