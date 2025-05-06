import Elysia from "elysia";
import DaftarInformasiPublik from "./daftar_informasi_publik";
import GrafikHasilKepuasanMasyarakat from "./ikm/grafik_hasil_kepuasan_masyarakat";
import GrafikBerdasarkanJenisKelamin from "./ikm/grafik_berdasarkan_jenis_kelamin";
import GrafikBerdasarkanResponden from "./ikm/grafik_responden";
import GrafikBerdasarkanUmur from "./ikm/grafik_berdasarkan_umur";


const PPID = new Elysia({ prefix: "/api/ppid", tags: ["PPID"] })
.use(DaftarInformasiPublik)
.use(GrafikHasilKepuasanMasyarakat)
.use(GrafikBerdasarkanJenisKelamin)
.use(GrafikBerdasarkanResponden)
.use(GrafikBerdasarkanUmur)



export default PPID

