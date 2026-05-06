import { toast } from "react-toastify";
import { proxy } from "valtio";

type StatsBeasiswa = {
  jumlahPenerima: number;
  danaTersalurkan: string;
  tahunAjaran: string;
};

type BeasiswaConfig = {
  id: string;
  tahunAjaran: string;
  danaTersalurkan: string;
};

const ringkasanBeasiswaState = proxy({
  findStats: {
    data: null as StatsBeasiswa | null,
    loading: false,
    async load() {
      try {
        ringkasanBeasiswaState.findStats.loading = true;
        const res = await fetch(`/api/pendidikan/beasiswa/ringkasan/stats`);
        if (res.ok) {
          const result = await res.json();
          ringkasanBeasiswaState.findStats.data = result?.data ?? null;
        } else {
          ringkasanBeasiswaState.findStats.data = null;
        }
      } catch (error) {
        console.error("Error fetching ringkasan beasiswa:", error);
        ringkasanBeasiswaState.findStats.data = null;
      } finally {
        ringkasanBeasiswaState.findStats.loading = false;
      }
    },
  },

  beasiswaConfig: {
    data: null as BeasiswaConfig | null,
    loading: false,
    async find() {
      try {
        ringkasanBeasiswaState.beasiswaConfig.loading = true;
        const res = await fetch(`/api/pendidikan/beasiswa/beasiswaconfig/find`);
        if (res.ok) {
          const result = await res.json();
          ringkasanBeasiswaState.beasiswaConfig.data = result?.data ?? null;
        } else {
          ringkasanBeasiswaState.beasiswaConfig.data = null;
        }
      } catch (error) {
        console.error("Error fetching beasiswa config:", error);
        ringkasanBeasiswaState.beasiswaConfig.data = null;
      } finally {
        ringkasanBeasiswaState.beasiswaConfig.loading = false;
      }
    },

    update: {
      loading: false,
      async submit(tahunAjaran: string, danaTersalurkan: string) {
        try {
          ringkasanBeasiswaState.beasiswaConfig.update.loading = true;
          const res = await fetch(`/api/pendidikan/beasiswa/beasiswaconfig/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tahunAjaran, danaTersalurkan }),
          });
          const result = await res.json();
          if (result.success) {
            toast.success("Konfigurasi beasiswa berhasil disimpan");
            await ringkasanBeasiswaState.beasiswaConfig.find();
            await ringkasanBeasiswaState.findStats.load();
            return true;
          }
          toast.error(result.message || "Gagal menyimpan konfigurasi");
          return false;
        } catch (error) {
          console.error("Error updating beasiswa config:", error);
          toast.error("Gagal menyimpan konfigurasi beasiswa");
          return false;
        } finally {
          ringkasanBeasiswaState.beasiswaConfig.update.loading = false;
        }
      },
    },
  },
});

export default ringkasanBeasiswaState;
