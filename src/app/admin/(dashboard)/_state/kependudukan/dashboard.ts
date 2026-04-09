import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";

const kependudukanDashboard = proxy({
  summary: {
    data: null as any,
    loading: false,
    async load() {
      kependudukanDashboard.summary.loading = true;
      try {
        const res = await ApiFetch.api.kependudukan.dashboard.summary.get();
        if (res.status === 200 && res.data?.success) {
          kependudukanDashboard.summary.data = res.data.data;
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
