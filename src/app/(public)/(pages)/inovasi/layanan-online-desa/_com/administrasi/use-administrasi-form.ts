import { useState } from "react";
import {
  EMPTY_ADMINISTRASI,
  hasAdministrasiErrors,
  normalizeAdministrasiField,
  toAdministrasiPayload,
  validateAdministrasi,
  type AdministrasiErrors,
  type AdministrasiField,
  type AdministrasiValues,
} from "./administrasi.logic";
import { submitAdministrasi } from "./administrasi.source";

export type AdministrasiStatus = "idle" | "sending" | "sent" | "failed";

export type AdministrasiForm = {
  values: AdministrasiValues;
  errors: AdministrasiErrors;
  status: AdministrasiStatus;
  setField: (field: AdministrasiField, raw: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
};

/**
 * Formulir terkontrol Administrasi Online. Galat isian tampil setelah percobaan kirim pertama (lalu ikut berubah saat
 * diketik); kirim gagal → isian tetap + status "failed"; sukses → status "sent" (isian disimpan untuk pesan terima kasih).
 */
export function useAdministrasiForm(): AdministrasiForm {
  const [values, setValues] = useState<AdministrasiValues>(EMPTY_ADMINISTRASI);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<AdministrasiStatus>("idle");

  const setField = (field: AdministrasiField, raw: string) =>
    setValues((prev) => ({ ...prev, [field]: normalizeAdministrasiField(field, raw) }));

  const submit = async () => {
    if (status === "sending") return;
    if (hasAdministrasiErrors(validateAdministrasi(values))) {
      setShowErrors(true);
      return;
    }
    setStatus("sending");
    try {
      await submitAdministrasi(toAdministrasiPayload(values));
      setStatus("sent");
    } catch (error) {
      console.error("Gagal mengirim pengajuan administrasi online:", error);
      setStatus("failed");
    }
  };

  const reset = () => {
    setValues(EMPTY_ADMINISTRASI);
    setShowErrors(false);
    setStatus("idle");
  };

  return { values, errors: showErrors ? validateAdministrasi(values) : {}, status, setField, submit, reset };
}
