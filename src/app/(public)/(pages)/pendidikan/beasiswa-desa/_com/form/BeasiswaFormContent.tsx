import { Button, Select, TextInput } from '@mantine/core';
import type { FormEvent } from 'react';
import { toDateInputValue } from '../../_lib/beasiswaForm';
import { ORTU_ROWS, SISWA_ROWS, type FormRow, type TextFieldDef } from './beasiswa-form.meta';
import s from './beasiswa-form.module.css';
import { BEASISWA_FORM_TEXT as T } from './beasiswa-form.text';
import type { BeasiswaFormApi } from './use-beasiswa-form';

type Props = { api: BeasiswaFormApi; onCancel: () => void; onSubmit: () => void; brandColor: string };

const FIELD = { size: 'md', radius: 'md', withAsterisk: true } as const;

/** Isi modal pendaftaran: catatan privasi, dua kelompok isian, galat kiriman, tombol. Tanpa efek (mudah dites). */
export function BeasiswaFormContent({ api, onCancel, onSubmit, brandColor }: Props) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      <p className={s.note}>{T.privacy}</p>
      <FieldGroup legend={T.siswa} rows={SISWA_ROWS} api={api} />
      <FieldGroup legend={T.ortu} rows={ORTU_ROWS} api={api} />
      {api.serverError && (
        <p className={s.alert} role="alert">
          {api.serverError}
        </p>
      )}
      <div className={s.actions}>
        <Button type="button" variant="default" radius="xl" size="md" onClick={onCancel}>
          {T.cancel}
        </Button>
        <Button type="submit" radius="xl" size="md" color={brandColor} loading={api.submitting}>
          {T.submit}
        </Button>
      </div>
    </form>
  );
}

function FieldGroup({ legend, rows, api }: { legend: string; rows: readonly FormRow[]; api: BeasiswaFormApi }) {
  return (
    <fieldset className={s.group}>
      <legend className={s.legend}>{legend}</legend>
      {rows.map((row, i) => (
        <div key={i} className={row.length > 1 ? s.pair : undefined}>
          {row.map((field) => (
            <Field key={typeof field === 'string' ? field : field.name} field={field} api={api} />
          ))}
        </div>
      ))}
    </fieldset>
  );
}

function Field({ field, api }: { field: FormRow[number]; api: BeasiswaFormApi }) {
  if (field === 'jenisKelamin') {
    return (
      <Select
        {...FIELD}
        label={T.jenisKelamin}
        placeholder={T.jenisKelaminPlaceholder}
        data={T.jenisKelaminOptions}
        value={api.form.jenisKelamin || null}
        error={api.errorOf('jenisKelamin')}
        onChange={(value) => api.setField('jenisKelamin', value ?? '')}
        onBlur={() => api.blur('jenisKelamin')}
        allowDeselect={false}
      />
    );
  }
  if (field === 'tanggalLahir') {
    return (
      <TextInput
        {...FIELD}
        type="date"
        label={T.tanggalLahir}
        max={toDateInputValue(new Date())}
        value={api.form.tanggalLahir}
        error={api.errorOf('tanggalLahir')}
        onChange={(e) => api.setField('tanggalLahir', e.currentTarget.value)}
        onBlur={() => api.blur('tanggalLahir')}
      />
    );
  }
  return <TextField def={field} api={api} />;
}

function TextField({ def, api }: { def: TextFieldDef; api: BeasiswaFormApi }) {
  return (
    <TextInput
      {...FIELD}
      label={def.label}
      description={def.description}
      placeholder={def.placeholder}
      maxLength={def.maxLength}
      inputMode={def.inputMode}
      autoComplete={def.autoComplete}
      value={api.form[def.name]}
      error={api.errorOf(def.name)}
      onChange={(e) => {
        const raw = e.currentTarget.value;
        api.setField(def.name, def.sanitize ? def.sanitize(raw) : raw);
      }}
      onBlur={() => api.blur(def.name)}
    />
  );
}
