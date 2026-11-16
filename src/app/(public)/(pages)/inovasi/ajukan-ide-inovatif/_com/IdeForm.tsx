'use client';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { EMPTY_IDE_FORM, firstInvalidField, IDE_FIELDS, toIdePayload, validateIde, type IdeField, type IdeForm as Form } from './ajukan-ide.logic';
import { submitIde } from './ajukan-ide.source';
import { AJUKAN_IDE_TEXT as T } from './ajukan-ide.text';
import { IdeFormView } from './IdeFormView';
import { IdeThanks } from './IdeThanks';

type Status = 'idle' | 'sending' | 'failed' | 'sent';

/** Setelah mencoba kirim, galat semua isian boleh tampil. */
const ALL_SHOWN = Object.fromEntries(IDE_FIELDS.map((field) => [field, true])) as Record<IdeField, boolean>;

/**
 * Formulir Ajukan Ide (kolom kanan). Isian terkontrol; galat tampil setelah isian disentuh atau setelah mencoba
 * kirim (fokus ke galat pertama). Kirim gagal → isian tetap + pesan; sukses → keadaan terima kasih di tempat.
 */
export function IdeForm() {
  const idPrefix = useId();
  const [form, setForm] = useState<Form>(EMPTY_IDE_FORM);
  const [touched, setTouched] = useState<Partial<Record<IdeField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const errors = validateIde(form, { required: T.required, tooLong: T.tooLong });
  // Fokus yang dipindah setelah render berikutnya: tombol kirim nonaktif selama mengirim (fokus jatuh ke body), jadi
  // setelah gagal fokus kembali ke tombol; setelah "Kirim ide lain" fokus ke isian pertama.
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [status]);

  if (status === 'sent') {
    return (
      <IdeThanks
        onAgain={() => {
          setForm(EMPTY_IDE_FORM);
          setTouched({});
          setAttempted(false);
          setStatus('idle');
          pendingFocus.current = `${idPrefix}-${IDE_FIELDS[0]}`;
        }}
      />
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    setAttempted(true);
    const invalid = firstInvalidField(errors);
    if (invalid) {
      document.getElementById(`${idPrefix}-${invalid}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await submitIde(toIdePayload(form));
      setStatus('sent');
    } catch (error) {
      // Hanya pesan galat (status/pesan API), tanpa isi formulir (nama/alamat warga).
      console.error('Gagal mengirim ide inovatif:', error);
      pendingFocus.current = `${idPrefix}-submit`;
      setStatus('failed');
    }
  };

  return (
    <IdeFormView
      idPrefix={idPrefix}
      form={form}
      errors={errors}
      shown={attempted ? ALL_SHOWN : touched}
      sending={status === 'sending'}
      failed={status === 'failed'}
      onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
      onBlur={(field) => setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))}
      onSubmit={onSubmit}
    />
  );
}
