import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";

interface DashboardSummary {
  tahun: number;
  summary: {
    totalPenduduk: number;
    totalKK: number;
    totalKelahiran: number;
    totalKemiskinan: number;
  };
  dinamika: {
    kelahiran: number;
    kematian: number;
    pindahMasuk: number;
    pindahKeluar: number;
  };
  agama: unknown[];
  umur: unknown[];
  banjar: unknown[];
}

const kependudukanDashboard = proxy({
  summary: {
    data: null as DashboardSummary | null,
    loading: false,
    async load() {
      kependudukanDashboard.summary.loading = true;
      try {
        const res = await ApiFetch.api.kependudukan.dashboard.summary.get();
        if (res.status === 200 && res.data?.success) {
          kependudukanDashboard.summary.data = res.data.data as unknown as DashboardSummary;
        } else {
          kependudukanDashboard.summary.data = null;
        }
      } catch (err) {
        console.error("Gagal fetch dashboard summary:", err);
        kependudukanDashboard.summary.data = null;
      } finally {
        kependudukanDashboard.summary.loading = false;
      }
    },
  },
});

export default kependudukanDashboard;
