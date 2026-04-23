import Elysia from "elysia";
import umkmDashboardKpi from "./kpi";
import umkmDashboardRingSummary from "./ringSummary";
import umkmDashboardTopProduk from "./topProduk";
import umkmDashboardDetailPenjualan from "./detailPenjualan";

const UmkmDashboard = new Elysia({
  prefix: "/umkm/dashboard",
  tags: ["Ekonomi/UMKM Dashboard"],
})
  .get("/kpi", umkmDashboardKpi)
  .get("/ringkasan-penjualan", umkmDashboardRingSummary)
  .get("/top-produk", umkmDashboardTopProduk)
  .get("/detail-penjualan", umkmDashboardDetailPenjualan);

export default UmkmDashboard;
