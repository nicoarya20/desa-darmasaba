import Elysia from "elysia";
import PasarDesa from "./pasar-desa";
import LowonganKerja from "./lowongan-kerja";
import ProgramKemiskinan from "./program-kemiskinan";
import KategoriProduk from "./pasar-desa/kategori-produk";
import GrafikUsiaKerjaYangMenganggur from "./usia-kerja-yang-menganggur";
import GrafikMenganggurBerdasarkanPendidikan from "./usia-kerja-yang-menganggur/pengangguran-berdasrkan-pendidikan";
import JumlahPendudukMiskin from "./jumlah-penduduk-miskin";
import SektorUnggulanDesa from "./sektor-unggulan-desa";
import DemografiPekerjaan from "./demografi-pekerjaan";
import JumlahPengangguran from "./jumlah-pengangguran";
import PendapatanAsliDesa from "./pendapatan-asli-desa";
import StrukturOrganisasi from "./struktur-bumdes";

const Ekonomi = new Elysia({
  prefix: "/ekonomi",
  tags: ["Ekonomi"],
})
.use(PasarDesa)
.use(KategoriProduk)
.use(LowonganKerja)
.use(ProgramKemiskinan)
.use(StrukturOrganisasi)
.use(GrafikUsiaKerjaYangMenganggur)
.use(GrafikMenganggurBerdasarkanPendidikan)
.use(JumlahPendudukMiskin)
.use(SektorUnggulanDesa)
.use(DemografiPekerjaan)
.use(JumlahPengangguran)
.use(PendapatanAsliDesa)

export default Ekonomi