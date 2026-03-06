import Elysia from "elysia";
import DaftarInformasiPublik from "./daftar_informasi_publik";
import GrafikBerdasarkanJenisKelamin from "./ikm/grafik_berdasarkan_jenis_kelamin";
import GrafikBerdasarkanResponden from "./ikm/grafik_responden";
import GrafikBerdasarkanUmur from "./ikm/grafik_berdasarkan_umur";
import PermohonanInformasiPublik from "./permohonan_informasi_publik";
import PermohonanKeberatanInformasiPublik from "./permohonan_keberatan_informasi_publik";
import ProfilePPID from "./profile_ppid";
import VisiMisiPPID from "./visi_misi_ppid/visi_misi_ppid";
import DasarHukumPPID from "./dasar_hukum";
import StrukturPPID from "./struktur_ppid";
import GrafikHasilKepuasanMasyarakat from "./ikm/grafik_hasil_kepuasan_masyarakat";




const PPID = new Elysia({ prefix: "/api/ppid", tags: ["PPID"] })
.use(ProfilePPID)
.use(DaftarInformasiPublik)
.use(GrafikHasilKepuasanMasyarakat)
.use(GrafikBerdasarkanJenisKelamin)
.use(GrafikBerdasarkanResponden)
.use(GrafikBerdasarkanUmur)
.use(PermohonanInformasiPublik)
.use(PermohonanKeberatanInformasiPublik)
.use(VisiMisiPPID)
.use(DasarHukumPPID)
.use(StrukturPPID)





export default PPID

