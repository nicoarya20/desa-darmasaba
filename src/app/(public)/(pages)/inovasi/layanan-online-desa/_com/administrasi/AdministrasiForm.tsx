import { PERMOHONAN_FIELD } from '@/app/(public)/(pages)/ppid/_com/permohonan.meta';
import { InovasiFormActions, InovasiFormCard } from '@/app/(public)/(pages)/inovasi/_com/InovasiFormCard';
import colors from '@/con/colors';
import { Button, Select, TextInput } from '@mantine/core';
import type { FormEvent } from 'react';
import type { AdministrasiErrors, AdministrasiField, AdministrasiValues } from './administrasi.logic';
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
};

/** Kartu formulir Administrasi Online: empat isian terkontrol, galat per isian, pesan kirim gagal (`role="alert"`). */
export function AdministrasiForm({ values, errors, status, jenis, onField, onSubmit }: Props) {
  const sending = status === 'sending';
  const options = jenis.status === 'ready' ? jenis.items.map((item) => ({ value: item.id, label: item.nama })) : [];
  const jenisPlaceholder =
    jenis.status === 'loading'
      ? T.jenisLayanan.loading
      : options.length === 0
        ? T.jenisLayanan.unavailable
        : T.jenisLayanan.placeholder;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <InovasiFormCard title={T.formTitle} lead={T.formLead}>
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <TextInput
          {...PERMOHONAN_FIELD}
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
          <Button type="submit" size={PERMOHONAN_FIELD.size} radius={PERMOHONAN_FIELD.radius} color={colors['blue-button']} loading={sending}>
            {T.submit}
          </Button>
        </InovasiFormActions>
      </form>
    </InovasiFormCard>
  );
}

/** Keadaan sukses di tempat formulir: terima kasih + tombol mengajukan lagi. */
export function AdministrasiSent({ jenisNama, onReset }: { jenisNama?: string; onReset: () => void }) {
  return (
    <InovasiFormCard title={T.sentTitle}>
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
