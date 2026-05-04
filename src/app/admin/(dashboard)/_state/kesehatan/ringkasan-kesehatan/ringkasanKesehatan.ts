/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

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
  findUnique: {
    data: null as Prisma.RingkasanKesehatanDesaGetPayload<{
      omit: { isActive: true };
    }> | null,
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "Ringkasan kesehatan berhasil disimpan");
          await ringkasanKesehatanState.findUnique.load();
          return true;
        }
        throw new Error(result.message || "Gagal menyimpan ringkasan kesehatan");
      } catch (error) {
        console.error("Error updating ringkasan kesehatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal menyimpan ringkasan kesehatan"
        );
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
