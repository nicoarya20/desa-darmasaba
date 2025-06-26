import Elysia from "elysia";
import DoctorSign from "./data_kesehatan_warga/artikel_kesehatan/doctor_sign";
import FirstAid from "./data_kesehatan_warga/artikel_kesehatan/first_aid";
import Introduction from "./data_kesehatan_warga/artikel_kesehatan/introduction";
import MythVsFact from "./data_kesehatan_warga/artikel_kesehatan/myth_vs_fact";
import Prevention from "./data_kesehatan_warga/artikel_kesehatan/prevention";
import Syptom from "./data_kesehatan_warga/artikel_kesehatan/syptom";
import GrafikKepuasan from "./data_kesehatan_warga/grafik_kepuasan";
import PersentaseKelahiranKematian from "./data_kesehatan_warga/persentase_kelahiran_kematian";
import InfoWabahPenyakit from "./info-wabah-penyakit";
import KontakDarurat from "./kontak-darurat";
import PenangananDarurat from "./penanganan-darurat";
import Posyandu from "./posyandu";
import ProgramKesehatan from "./program-kesehatan";
import Puskesmas from "./puskesmas";
import FasilitasKesehatan from "./data_kesehatan_warga/fasilitas_kesehatan";
import JadwalKegiatan from "./data_kesehatan_warga/jadwal_kegiatan";


const Kesehatan = new Elysia({
  prefix: "/api/kesehatan",
  tags: ["Kesehatan"],
})
.use(PersentaseKelahiranKematian)
.use(GrafikKepuasan)
.use(Introduction)
.use(Syptom)
.use(Prevention)
.use(FirstAid)
.use(MythVsFact)
.use(DoctorSign)
.use(Posyandu)
.use(Puskesmas)
.use(ProgramKesehatan)
.use(PenangananDarurat)
.use(KontakDarurat)
.use(InfoWabahPenyakit)
.use(FasilitasKesehatan)
.use(JadwalKegiatan)
export default Kesehatan;
