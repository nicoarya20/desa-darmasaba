import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

type StatsData = {
  ibuHamilAktif: number;
  balitaTerdaftar: number;
  alertStunting: number;
  imunisasiLengkapPct: number;
  pemeriksaanRutinPct: number;
  giziBaikPct: number;
  targetStuntingPct: number;
};

const intPct = z
  .number({ invalid_type_error: "Harus berupa angka" })
  .int({ message: "Harus bilangan bulat" })
  .min(0, { message: "Minimal 0" })
  .max(100, { message: "Maksimal 100" });

type BanjarOption = { id: string; name: string };

const ringkasanKesehatanState = proxy({
  banjarId: "" as string,

  findBanjar: {
    data: [] as BanjarOption[],
    loading: false,
    async load() {
      try {
        ringkasanKesehatanState.findBanjar.loading = true;
        const res = await fetch(`/api/kesehatan/banjar/find-many`);
        if (res.ok) {
          const result = await res.json();
          ringkasanKesehatanState.findBanjar.data = result?.data ?? [];
        }
      } catch (error) {
        console.error("Error fetching banjar:", error);
      } finally {
        ringkasanKesehatanState.findBanjar.loading = false;
      }
    },
  },

  findStats: {
    data: null as StatsData | null,
    loading: false,
    async load() {
      try {
        ringkasanKesehatanState.findStats.loading = true;
        const banjarId = ringkasanKesehatanState.banjarId;
        const params = banjarId ? `?banjarId=${encodeURIComponent(banjarId)}` : "";
        const res = await fetch(`/api/kesehatan/ringkasankesehatan/stats${params}`);
        if (res.ok) {
          const result = await res.json();
          ringkasanKesehatanState.findStats.data = result?.data ?? null;
          if (result?.data) {
            ringkasanKesehatanState.update.form.targetStuntingPct =
              result.data.targetStuntingPct;
          }
        } else {
          ringkasanKesehatanState.findStats.data = null;
        }
      } catch (error) {
        console.error("Error fetching ringkasan stats:", error);
        ringkasanKesehatanState.findStats.data = null;
      } finally {
        ringkasanKesehatanState.findStats.loading = false;
      }
    },
  },

  update: {
    form: { targetStuntingPct: 0 },
    loading: false,
    async submitTarget() {
      const pct = ringkasanKesehatanState.update.form.targetStuntingPct;
      const cek = intPct.safeParse(pct);
      if (!cek.success) {
        toast.error("Target stunting harus 0-100");
        return false;
      }
      try {
        ringkasanKesehatanState.update.loading = true;
        const response = await fetch(`/api/kesehatan/ringkasankesehatan/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetStuntingPct: pct }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Target stunting berhasil disimpan");
          await ringkasanKesehatanState.findStats.load();
          return true;
        }
        toast.error(result.message || "Gagal menyimpan");
        return false;
      } catch (error) {
        console.error("Error saving target stunting:", error);
        toast.error("Gagal menyimpan target stunting");
        return false;
      } finally {
        ringkasanKesehatanState.update.loading = false;
      }
    },
  },
});

export default ringkasanKesehatanState;
