import { Prisma } from "@prisma/client";
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

const intCount = z
  .number({ invalid_type_error: "Harus berupa angka" })
  .int({ message: "Harus bilangan bulat" })
  .min(0, { message: "Minimal 0" });

const templateForm = z.object({
  ibuHamilAkh: intCount,
  balitaTerdaftar: intCount,
  alertStunting: intCount,
  imunisasiLengkapPct: intPct,
  pemeriksaanRutinPct: intPct,
  giziBaikPct: intPct,
  targetStuntingPct: intPct,
});

const defaultForm = {
  ibuHamilAkh: 0,
  balitaTerdaftar: 0,
  alertStunting: 0,
  imunisasiLengkapPct: 0,
  pemeriksaanRutinPct: 0,
  giziBaikPct: 0,
  targetStuntingPct: 0,
};

const ringkasanKesehatanState = proxy({
  // Derived stats aggregated from IbuHamil + Balita tables
  findStats: {
    data: null as StatsData | null,
    loading: false,
    async load() {
      try {
        ringkasanKesehatanState.findStats.loading = true;
        const res = await fetch(`/api/kesehatan/ringkasankesehatan/stats`);
        if (res.ok) {
          const result = await res.json();
          ringkasanKesehatanState.findStats.data = result?.data ?? null;
          if (result?.data) {
            ringkasanKesehatanState.update.form.targetStuntingPct = result.data.targetStuntingPct;
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

  // Kept for backward-compat — now only used internally for targetStuntingPct config
  findUnique: {
    data: null as Prisma.RingkasanKesehatanDesaGetPayload<object> | null,
    loading: false,
    async load() {
      try {
        ringkasanKesehatanState.findUnique.loading = true;
        const res = await fetch(`/api/kesehatan/ringkasankesehatan/find`);
        if (res.ok) {
          const result = await res.json();
          ringkasanKesehatanState.findUnique.data = result?.data ?? null;
          if (result?.data) {
            ringkasanKesehatanState.update.form = {
              ibuHamilAkh: result.data.ibuHamilAkh,
              balitaTerdaftar: result.data.balitaTerdaftar,
              alertStunting: result.data.alertStunting,
              imunisasiLengkapPct: result.data.imunisasiLengkapPct,
              pemeriksaanRutinPct: result.data.pemeriksaanRutinPct,
              giziBaikPct: result.data.giziBaikPct,
              targetStuntingPct: result.data.targetStuntingPct,
            };
          }
        } else {
          ringkasanKesehatanState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching ringkasan kesehatan:", error);
        ringkasanKesehatanState.findUnique.data = null;
      } finally {
        ringkasanKesehatanState.findUnique.loading = false;
      }
    },
  },

  update: {
    form: { ...defaultForm },
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
          body: JSON.stringify(ringkasanKesehatanState.update.form),
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
    // Kept for backward-compat (full update)
    async submit() {
      const cek = templateForm.safeParse(ringkasanKesehatanState.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] invalid`;
        toast.error(err);
        return false;
      }
      try {
        ringkasanKesehatanState.update.loading = true;
        const response = await fetch(`/api/kesehatan/ringkasankesehatan/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ringkasanKesehatanState.update.form),
        });
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "Berhasil disimpan");
          await ringkasanKesehatanState.findUnique.load();
          return true;
        }
        throw new Error(result.message || "Gagal menyimpan");
      } catch (error) {
        console.error("Error updating ringkasan kesehatan:", error);
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan");
        return false;
      } finally {
        ringkasanKesehatanState.update.loading = false;
      }
    },
    reset() {
      ringkasanKesehatanState.update.form = { ...defaultForm };
    },
  },
});

export default ringkasanKesehatanState;
