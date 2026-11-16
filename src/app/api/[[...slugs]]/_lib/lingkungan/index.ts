import Elysia from "elysia";
import PengelolaanSampah from "./pengelolaan-sampah";
import ProgramPenghijauan from "./program-penghijauan";
import DataLingkunganDesa from "./data-lingkungan-desa";
import EdukasiLingkungan from "./edukasi-lingkungan";
import KonservasiAdatBali from "./konservasi-adat-bali";
import KeteranganBankSampahTerdekat from "./pengelolaan-sampah/keterangan-bank-sampah";

const Lingkungan = new Elysia({
  prefix: "/lingkungan",
  tags: ["Lingkungan"],
})

.use(PengelolaanSampah)
.use(ProgramPenghijauan)
.use(DataLingkunganDesa)
.use(EdukasiLingkungan)
.use(KonservasiAdatBali)
.use(KeteranganBankSampahTerdekat);


export default Lingkungan;
