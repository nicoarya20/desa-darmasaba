import Elysia from "elysia";
import InovasiTeknologiDesa from "./inovasi-teknologi-desa";
import ProgramKreatif from "./program-kreatif";
import KolaborasiInovasi from "./kolaborasi-inovasi";
import AjukanIdeInovatif from "./ajukan-ide-inovatif";
import LayananOnlineDesa from "./layanan-online-desa";
import MitraKolaborasi from "./kolaborasi-inovasi/mitra-kolaborasi";

const Inovasi = new Elysia({
  prefix: "/inovasi",
  tags: ["Inovasi"],
})
  .use(InovasiTeknologiDesa)
  .use(ProgramKreatif)
  .use(KolaborasiInovasi) 
  .use(AjukanIdeInovatif)
  .use(LayananOnlineDesa)
  .use(MitraKolaborasi)
  
export default Inovasi;
