import Elysia from "elysia";
import InformasiUmum from "./data_kesehatan_warga/fasilitas_kesehatan/informasi_umum";
import LayananUnggulan from "./data_kesehatan_warga/fasilitas_kesehatan/layanan_unggulan";
import DokterDantenagamedis from "./data_kesehatan_warga/fasilitas_kesehatan/dokterDantenagamedis";
import FasilitasPendukung from "./data_kesehatan_warga/fasilitas_kesehatan/fasilitas_pendukung";
import TarifDanLayanan from "./data_kesehatan_warga/fasilitas_kesehatan/tarifDanlayanan";
import ProsedurPendaftaran from "./data_kesehatan_warga/fasilitas_kesehatan/prosedur_pendaftaran";

const Kesehatan = new Elysia({
  prefix: "/api/kesehatan",
  tags: ["Kesehatan"],
})
.use(InformasiUmum)
.use(LayananUnggulan)
.use(DokterDantenagamedis)
.use(FasilitasPendukung)
.use(TarifDanLayanan)
.use(ProsedurPendaftaran)

export default Kesehatan;
