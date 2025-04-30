import Elysia from "elysia";
import InformasiUmum from "./data_kesehatan_warga/fasilitas_kesehatan/informasi_umum";
import LayananUnggulan from "./data_kesehatan_warga/fasilitas_kesehatan/layanan_unggulan";
import DokterDantenagamedis from "./data_kesehatan_warga/fasilitas_kesehatan/dokterDantenagamedis";
import FasilitasPendukung from "./data_kesehatan_warga/fasilitas_kesehatan/fasilitas_pendukung";
import TarifDanLayanan from "./data_kesehatan_warga/fasilitas_kesehatan/tarifDanlayanan";
import ProsedurPendaftaran from "./data_kesehatan_warga/fasilitas_kesehatan/prosedur_pendaftaran";
import InformasiJadwalKegiatan from "./data_kesehatan_warga/jadwal_kegiatan/informasi_kegiatan";
import DeskripsiJadwalKegiatan from "./data_kesehatan_warga/jadwal_kegiatan/deskripsi_kegiatan";
import LayananTersedia from "./data_kesehatan_warga/jadwal_kegiatan/layanan_yang_tersedia";
import SyaratKetentuan from "./data_kesehatan_warga/jadwal_kegiatan/syarat_dan_ketentuan";
import DokumenDiperlukan from "./data_kesehatan_warga/jadwal_kegiatan/dokumen_yang_diperlukan";
import PendaftaranJadwal from "./data_kesehatan_warga/jadwal_kegiatan/pendaftaran";

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
.use(InformasiJadwalKegiatan)
.use(DeskripsiJadwalKegiatan)
.use(LayananTersedia)
.use(SyaratKetentuan)
.use(DokumenDiperlukan)
.use(PendaftaranJadwal)
export default Kesehatan;
