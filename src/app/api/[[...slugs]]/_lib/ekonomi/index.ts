import Elysia from "elysia";
import LowonganKerja from "./lowongan-kerja";
import ProgramKemiskinan from "./program-kemiskinan";
import GrafikUsiaKerjaYangMenganggur from "./usia-kerja-yang-menganggur";
import GrafikMenganggurBerdasarkanPendidikan from "./usia-kerja-yang-menganggur/pengangguran-berdasrkan-pendidikan";
import JumlahPendudukMiskin from "./jumlah-penduduk-miskin";
import SektorUnggulanDesa from "./sektor-unggulan-desa";
import DemografiPekerjaan from "./demografi-pekerjaan";
import JumlahPengangguran from "./jumlah-pengangguran";
import PendapatanAsliDesa from "./pendapatan-asli-desa";
import StrukturOrganisasi from "./struktur-bumdes";
import Umkm from "./umkm";
import ProdukUmkm from "./umkm/produk";
import PenjualanProduk from "./umkm/penjualan";
import UmkmDashboard from "./umkm/dashboard";
import KategoriProduk from "./umkm/kategori-produk";

const Ekonomi = new Elysia({
  prefix: "/ekonomi",
  tags: ["Ekonomi"],
})
.use(LowonganKerja)
.use(ProgramKemiskinan)
.use(StrukturOrganisasi)
.use(Umkm)
.use(ProdukUmkm)
.use(PenjualanProduk)
.use(UmkmDashboard)
.use(GrafikUsiaKerjaYangMenganggur)
.use(GrafikMenganggurBerdasarkanPendidikan)
.use(JumlahPendudukMiskin)
.use(SektorUnggulanDesa)
.use(DemografiPekerjaan)
.use(JumlahPengangguran)
.use(PendapatanAsliDesa)
.use(KategoriProduk)

export default Ekonomi