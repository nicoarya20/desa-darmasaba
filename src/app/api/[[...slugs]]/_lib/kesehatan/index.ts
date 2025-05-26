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
import PersentaseKelahiranKematian from "./data_kesehatan_warga/persentase_kelahiran_kematian";
import GrafikKepuasan from "./data_kesehatan_warga/grafik_kepuasan";
import Introduction from "./data_kesehatan_warga/artikel_kesehatan/introduction";
import Syptom from "./data_kesehatan_warga/artikel_kesehatan/syptom";
import Prevention from "./data_kesehatan_warga/artikel_kesehatan/prevention";
import FirstAid from "./data_kesehatan_warga/artikel_kesehatan/first_aid";
import MythVsFact from "./data_kesehatan_warga/artikel_kesehatan/myth_vs_fact";
import DoctorSign from "./data_kesehatan_warga/artikel_kesehatan/doctor_sign";


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
.use(PersentaseKelahiranKematian)
.use(GrafikKepuasan)
.use(Introduction)
.use(Syptom)
.use(Prevention)
.use(FirstAid)
.use(MythVsFact)
.use(DoctorSign)
export default Kesehatan;
