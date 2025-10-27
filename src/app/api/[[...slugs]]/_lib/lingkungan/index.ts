import Elysia from "elysia";
import PengelolaanSampah from "./pengelolaan-sampah";
import ProgramPenghijauan from "./program-penghijauan";
import DataLingkunganDesa from "./data-lingkungan-desa";
import EdukasiLingkungan from "./edukasi-lingkungan";
import KonservasiAdatBali from "./konservasi-adat-bali";
import KegiatanDesa from "./gotong-royong";
import KategoriKegiatan from "./gotong-royong/kategori-kegiatan";
import KeteranganBankSampahTerdekat from "./pengelolaan-sampah/keterangan-bank-sampah";

const Lingkungan = new Elysia({
  prefix: "/api/lingkungan",
  tags: ["Lingkungan"],
})

.use(PengelolaanSampah)
.use(ProgramPenghijauan)
.use(DataLingkunganDesa)
.use(EdukasiLingkungan)
.use(KonservasiAdatBali)
.use(KegiatanDesa)
.use(KategoriKegiatan)
.use(KeteranganBankSampahTerdekat);


export default Lingkungan;
