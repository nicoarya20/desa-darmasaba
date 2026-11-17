import Elysia from "elysia";
import DistribusiAgama from "./distribusi-agama";
import DistribusiUmur from "./distribusi-umur";
import DataBanjar from "./data-banjar";
import LaporanBulanan from "./laporan-bulanan";
import MigrasiPenduduk from "./migrasi-penduduk";
import DinamikaPenduduk from "./dinamika-penduduk";
import DashboardKependudukan from "./dashboard";

const Kependudukan = new Elysia({
    prefix: "/kependudukan",
    tags: ["Kependudukan"],
})
.use(DashboardKependudukan)
.use(DistribusiAgama)
.use(DistribusiUmur)
.use(DataBanjar)
.use(LaporanBulanan)
.use(MigrasiPenduduk)
.use(DinamikaPenduduk)

export default Kependudukan;
