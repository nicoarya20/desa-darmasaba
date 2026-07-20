import { proxy } from "valtio";

const dashboard = proxy({
  kpi: { data: null as any, loading: false },
  summary: { data: null as any, loading: false },
  topProduk: { data: [] as any[], loading: false },
  detail: { data: [] as any[], loading: false },
  mode: "month" as "week" | "month",
  async loadAll(
    periode = "",
    mode?: "week" | "month",
    kategoriId = "",
    umkmId = ""
  ) {
    const now = new Date();
    const p =
      periode ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const m = mode ?? dashboard.mode;
    const modeParam = m === "week" ? "&mode=week" : "";
    const detailFilter = [
      kategoriId ? `&kategoriId=${kategoriId}` : "",
      umkmId ? `&umkmId=${umkmId}` : "",
    ].join("");
    dashboard.kpi.loading = true;
    dashboard.summary.loading = true;
    dashboard.topProduk.loading = true;
    dashboard.detail.loading = true;
    try {
      const [kpi, sum, top, det] = await Promise.all([
        fetch(
          `/api/ekonomi/umkm/dashboard/kpi?periode=${p}${modeParam}`
        ).then((r) => r.json()),
        fetch(
          `/api/ekonomi/umkm/dashboard/ringkasan-penjualan?periode=${p}${modeParam}`
        ).then((r) => r.json()),
        fetch(
          `/api/ekonomi/umkm/dashboard/top-produk?periode=${p}${modeParam}`
        ).then((r) => r.json()),
        fetch(
          `/api/ekonomi/umkm/dashboard/detail-penjualan?periode=${p}${modeParam}${detailFilter}`
        ).then((r) => r.json()),
      ]);
      if (kpi.success) dashboard.kpi.data = kpi.data;
      if (sum.success) dashboard.summary.data = sum.data;
      if (top.success) dashboard.topProduk.data = top.data;
      if (det.success) dashboard.detail.data = det.data;
      dashboard.mode = m;
    } catch (e) {
      console.error(e);
    } finally {
      dashboard.kpi.loading = false;
      dashboard.summary.loading = false;
      dashboard.topProduk.loading = false;
      dashboard.detail.loading = false;
    }
  },
});

export default dashboard;
