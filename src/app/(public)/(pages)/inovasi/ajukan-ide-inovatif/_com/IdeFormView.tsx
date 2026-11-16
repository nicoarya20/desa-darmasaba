import colors from '@/con/colors';
import { Button, Textarea, TextInput } from '@mantine/core';
import type { FormEvent } from 'react';
import { PERMOHONAN_FIELD } from '../../../ppid/_com/permohonan.meta';
import { InovasiFormActions, InovasiFormCard } from '../../_com/InovasiFormCard';
import { IDE_FIELD_MAX, IDE_FIELDS, type IdeErrors, type IdeField, type IdeForm } from './ajukan-ide.logic';
import { AJUKAN_IDE_FIELDS as F, AJUKAN_IDE_TEXT as T } from './ajukan-ide.text';
import s from './ajukan-ide.module.css';

export type IdeFormViewProps = {
  /** Awalan id isian (`${idPrefix}-${field}`) dan tombol (`${idPrefix}-submit`), dipakai untuk memindah fokus. */
  idPrefix: string;
  form: IdeForm;
  errors: IdeErrors;
  /** Isian yang galatnya boleh tampil (sudah disentuh, atau semua setelah mencoba kirim). */
  shown: Partial<Record<IdeField, boolean>>;
  sending: boolean;
  failed: boolean;
  onChange: (field: IdeField, value: string) => void;
  onBlur: (field: IdeField) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

/** Markup formulir Ajukan Ide tanpa state (diekspor untuk test): 6 isian terkontrol + pesan gagal + tombol kirim. */
export function IdeFormView({ idPrefix, form, errors, shown, sending, failed, onChange, onBlur, onSubmit }: IdeFormViewProps) {
  return (
    <InovasiFormCard title={T.formTitle} lead={T.formLead}>
      <form className={s.form} noValidate onSubmit={onSubmit}>
        {IDE_FIELDS.map((field) => {
          const text = F[field];
          const common = {
            ...PERMOHONAN_FIELD,
            id: `${idPrefix}-${field}`,
            name: field,
            label: text.label,
            placeholder: text.placeholder,
            value: form[field],
            maxLength: IDE_FIELD_MAX[field],
            required: true,
            withAsterisk: false,
            error: shown[field] ? errors[field] : undefined,
            onBlur: () => onBlur(field),
          };
          return text.multiline ? (
            <Textarea
              key={field}
              {...common}
              description={T.count(form[field].length, IDE_FIELD_MAX[field])}
              inputWrapperOrder={['label', 'input', 'description', 'error']}
              autosize
              minRows={4}
              maxRows={12}
              onChange={(event) => onChange(field, event.currentTarget.value)}
            />
          ) : (
            <TextInput key={field} {...common} onChange={(event) => onChange(field, event.currentTarget.value)} />
          );
        })}
        {failed ? (
          <p className={s.formError} role="alert">
            {T.error}
          </p>
        ) : null}
        <InovasiFormActions>
          <Button id={`${idPrefix}-submit`} type="submit" size="md" radius="md" color={colors['blue-button']} loading={sending}>
            {T.submit}
          </Button>
        </InovasiFormActions>
      </form>
    </InovasiFormCard>
  );
}
