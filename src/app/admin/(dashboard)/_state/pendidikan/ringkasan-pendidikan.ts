import { proxy } from "valtio";

type PerJenjang = { nama: string; jumlahSiswa: number };

type StatsPendidikan = {
  perJenjang: PerJenjang[];
  jumlahLembaga: number;
  jumlahPengajar: number;
};

const ringkasanPendidikanState = proxy({
  findStats: {
    data: null as StatsPendidikan | null,
    loading: false,
    async load() {
      try {
        ringkasanPendidikanState.findStats.loading = true;
        const res = await fetch(`/api/pendidikan/ringkasan/stats`);
        if (res.ok) {
          const result = await res.json();
          ringkasanPendidikanState.findStats.data = result?.data ?? null;
        } else {
          ringkasanPendidikanState.findStats.data = null;
        }
      } catch (error) {
        console.error("Error fetching ringkasan pendidikan:", error);
        ringkasanPendidikanState.findStats.data = null;
      } finally {
        ringkasanPendidikanState.findStats.loading = false;
      }
    },
  },
});

export default ringkasanPendidikanState;
