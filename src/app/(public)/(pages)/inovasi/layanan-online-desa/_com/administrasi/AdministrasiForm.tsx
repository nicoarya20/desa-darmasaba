import { PERMOHONAN_FIELD } from '@/app/(public)/(pages)/ppid/_com/permohonan.meta';
import { InovasiFormActions, InovasiFormCard } from '@/app/(public)/(pages)/inovasi/_com/InovasiFormCard';
import { Button, Select, TextInput } from '@mantine/core';
import { useEffect, useId, useRef, type FormEvent, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import {
  firstInvalidAdministrasiField,
  validateAdministrasi,
  type AdministrasiErrors,
  type AdministrasiField,
  type AdministrasiValues,
} from './administrasi.logic';
import s from './administrasi.module.css';
import { ADMINISTRASI_TEXT as T } from './administrasi.text';
import type { AdministrasiStatus } from './use-administrasi-form';
import type { JenisLayananState } from './use-jenis-layanan';

type Props = {
  values: AdministrasiValues;
  errors: AdministrasiErrors;
  status: AdministrasiStatus;
  jenis: JenisLayananState;
  onField: (field: AdministrasiField, raw: string) => void;
  onSubmit: () => void;
  /** Isian pertama (Nama); halaman memfokusnya setelah "Ajukan layanan lain" memasang ulang formulir. */
  firstFieldRef: RefObject<HTMLInputElement | null>;
};

/**
 * Kartu formulir Administrasi Online: empat isian terkontrol, galat per isian, pesan kirim gagal (`role="alert"`).
 * Fokus: kirim dengan isian salah → isian salah pertama; kirim gagal → kembali ke tombol kirim.
 */
export function AdministrasiForm({ values, errors, status, jenis, onField, onSubmit, firstFieldRef }: Props) {
  const idPrefix = useId();
  const fieldId = (field: AdministrasiField) => `${idPrefix}-${field}`;
  const submitRef = useRef<HTMLButtonElement>(null);
  const sending = status === 'sending';
  const options = jenis.status === 'ready' ? jenis.items.map((item) => ({ value: item.id, label: item.nama })) : [];
  const jenisPlaceholder =
    jenis.status === 'loading'
      ? T.jenisLayanan.loading
      : options.length === 0
        ? T.jenisLayanan.unavailable
        : T.jenisLayanan.placeholder;

  // Selama mengirim tombol `loading` = `disabled`, jadi peramban melepas fokusnya ke <body>. Setelah gagal tombol aktif
  // lagi di render berikutnya; fokus dikembalikan ke sana (pesan role="alert" tetap dibacakan).
  useEffect(() => {
    if (status === 'failed') submitRef.current?.focus();
  }, [status]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Hook menyalakan galat secara sinkron sebelum await pertama; flushSync merendernya dulu agar isian yang difokus
    // sudah membawa aria-invalid + pesan galat (aria-describedby) saat dibacakan pembaca layar.
    flushSync(onSubmit);
    const invalid = firstInvalidAdministrasiField(validateAdministrasi(values));
    if (invalid) document.getElementById(fieldId(invalid))?.focus();
  };

  return (
    <InovasiFormCard title={T.formTitle} lead={T.formLead}>
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <TextInput
          {...PERMOHONAN_FIELD}
          id={fieldId('name')}
          ref={firstFieldRef}
          label={T.name.label}
          placeholder={T.name.placeholder}
          autoComplete="name"
          withAsterisk
          value={values.name}
          error={errors.name}
          onChange={(event) => onField('name', event.currentTarget.value)}
        />
        <TextInput
          {...PERMOHONAN_FIELD}
          id={fieldId('alamat')}
          label={T.alamat.label}
          placeholder={T.alamat.placeholder}
          autoComplete="street-address"
          withAsterisk
          value={values.alamat}
          error={errors.alamat}
          onChange={(event) => onField('alamat', event.currentTarget.value)}
        />
        <TextInput
          {...PERMOHONAN_FIELD}
          id={fieldId('nomorTelepon')}
          type="tel"
          inputMode="numeric"
          // Tanpa maxLength: batas 13 dihitung dari digit (normalizeAdministrasiField), bukan dari ketikan berstrip.
          label={T.nomorTelepon.label}
          placeholder={T.nomorTelepon.placeholder}
          autoComplete="tel"
          withAsterisk
          value={values.nomorTelepon}
          error={errors.nomorTelepon}
          onChange={(event) => onField('nomorTelepon', event.currentTarget.value)}
        />
        <Select
          {...PERMOHONAN_FIELD}
          id={fieldId('jenisLayananId')}
          label={T.jenisLayanan.label}
          placeholder={jenisPlaceholder}
          withAsterisk
          data={options}
          value={values.jenisLayananId || null}
          error={errors.jenisLayananId}
          disabled={options.length === 0}
          allowDeselect={false}
          onChange={(value) => onField('jenisLayananId', value ?? '')}
        />
        {status === 'failed' ? (
          <p className={s.alert} role="alert">
            {T.failed}
          </p>
        ) : null}
        <InovasiFormActions>
          <Button ref={submitRef} type="submit" size={PERMOHONAN_FIELD.size} radius={PERMOHONAN_FIELD.radius} color="var(--c-brand-fill)" loading={sending}>
            {T.submit}
          </Button>
        </InovasiFormActions>
      </form>
    </InovasiFormCard>
  );
}

/**
 * Keadaan sukses di tempat formulir: terima kasih + tombol mengajukan lagi. Formulir (dan tombol kirim yang terfokus)
 * di-unmount saat sukses, jadi fokus dipindah ke judul kartu (`focusTitle`) agar tidak jatuh ke <body>.
 */
export function AdministrasiSent({ jenisNama, onReset }: { jenisNama?: string; onReset: () => void }) {
  return (
    <InovasiFormCard title={T.sentTitle} focusTitle>
      <p className={s.sentLead} role="status">
        {T.sentLead(jenisNama)}
      </p>
      <InovasiFormActions>
        <Button variant="default" size={PERMOHONAN_FIELD.size} radius={PERMOHONAN_FIELD.radius} onClick={onReset}>
          {T.sentAgain}
        </Button>
      </InovasiFormActions>
    </InovasiFormCard>
  );
}
