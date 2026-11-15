import { useState } from 'react';
import {
  BEASISWA_FIELDS, EMPTY_BEASISWA_FORM, beasiswaFieldError, beasiswaFormErrors, toBeasiswaPayload,
  type BeasiswaField, type BeasiswaForm,
} from '../../_lib/beasiswaForm';
import { kirimPendaftaran } from '../beasiswa.source';

type Touched = Partial<Record<BeasiswaField, boolean>>;

/**
 * Status formulir pendaftaran (state lokal halaman, bukan state admin). Galat field tampil setelah field
 * disentuh atau setelah mencoba kirim; galat kiriman (`serverError`) tampil di dalam modal dan isian tetap utuh.
 */
export function useBeasiswaForm() {
  const [form, setForm] = useState<BeasiswaForm>(EMPTY_BEASISWA_FORM);
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setField = (field: BeasiswaField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
  };
  const blur = (field: BeasiswaField) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field: BeasiswaField) => (touched[field] ? beasiswaFieldError(field, form) : null);

  /** Validasi lalu kirim; `true` bila tersimpan (formulir dikosongkan). */
  const submit = async (): Promise<boolean> => {
    setTouched(Object.fromEntries(BEASISWA_FIELDS.map((f) => [f, true])));
    if (Object.keys(beasiswaFormErrors(form)).length > 0 || submitting) return false;
    setSubmitting(true);
    setServerError(null);
    const result = await kirimPendaftaran(toBeasiswaPayload(form));
    setSubmitting(false);
    if (!result.ok) {
      setServerError(result.message);
      return false;
    }
    setForm(EMPTY_BEASISWA_FORM);
    setTouched({});
    return true;
  };

  return { form, setField, blur, errorOf, submitting, serverError, submit };
}

export type BeasiswaFormApi = ReturnType<typeof useBeasiswaForm>;
