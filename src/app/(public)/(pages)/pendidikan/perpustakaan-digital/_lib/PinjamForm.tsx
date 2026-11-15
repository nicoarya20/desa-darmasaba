'use client';
import colors from '@/con/colors';
import { Button, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendarEvent, IconHome, IconPhone, IconUser } from '@tabler/icons-react';
import 'dayjs/locale/id';
import { MAX_DIGITS, sanitizePhoneDigits } from './notelp';
import { PINJAM_TEXT as T } from './peminjaman.text';
import {
  ALAMAT_MAX,
  AMBIL_MAKS_HARI,
  CATATAN_MAX,
  formatTanggal,
  LAMA_PINJAM_HARI,
  NAMA_MAX,
  tambahHari,
} from './peminjamanForm';
import s from './pinjam.module.css';
import type { usePeminjaman } from './use-peminjaman';

type Props = { form: ReturnType<typeof usePeminjaman>; onCancel: () => void };

const INPUT = { size: 'md', radius: 'md' } as const;

/** Isian pinjam (nama, telepon +62, alamat, tanggal ambil + batas kembali, catatan polos), catatan privasi, aksi. */
export function PinjamForm({ form, onCancel }: Props) {
  const { values, set, blur, errorOf, submit, status, hariIni } = form;
  const sending = status === 'sending';

  return (
    <form
      className={s.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <TextInput
        {...INPUT}
        label={T.nama}
        placeholder={T.namaPlaceholder}
        withAsterisk
        autoComplete="name"
        leftSection={<IconUser size={18} stroke={1.75} aria-hidden />}
        maxLength={NAMA_MAX}
        value={values.nama}
        error={errorOf('nama')}
        onChange={(e) => set('nama', e.currentTarget.value)}
        onBlur={() => blur('nama')}
      />
      <TextInput
        {...INPUT}
        label={T.telp}
        description={T.telpHint}
        placeholder={T.telpPlaceholder}
        withAsterisk
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={MAX_DIGITS}
        leftSection={
          <span className={s.prefix}>
            <IconPhone size={18} stroke={1.75} aria-hidden />
            +62
          </span>
        }
        leftSectionWidth={72}
        value={values.telp}
        error={errorOf('telp')}
        onChange={(e) => set('telp', sanitizePhoneDigits(e.currentTarget.value))}
        onBlur={() => blur('telp')}
      />
      <TextInput
        {...INPUT}
        label={T.alamat}
        placeholder={T.alamatPlaceholder}
        withAsterisk
        autoComplete="street-address"
        leftSection={<IconHome size={18} stroke={1.75} aria-hidden />}
        maxLength={ALAMAT_MAX}
        value={values.alamat}
        error={errorOf('alamat')}
        onChange={(e) => set('alamat', e.currentTarget.value)}
        onBlur={() => blur('alamat')}
      />
      <div>
        <DateInput
          {...INPUT}
          locale="id"
          label={T.tanggal}
          placeholder={T.tanggalPlaceholder}
          withAsterisk
          valueFormat="dddd, D MMMM YYYY"
          minDate={hariIni}
          maxDate={tambahHari(hariIni, AMBIL_MAKS_HARI)}
          leftSection={<IconCalendarEvent size={18} stroke={1.75} aria-hidden />}
          value={values.tanggalAmbil || null}
          error={errorOf('tanggalAmbil')}
          onChange={(value) => set('tanggalAmbil', value ?? '')}
          onBlur={() => blur('tanggalAmbil')}
        />
        {values.tanggalAmbil && !errorOf('tanggalAmbil') && (
          <p className={s.batas}>
            {T.batas(formatTanggal(tambahHari(values.tanggalAmbil, LAMA_PINJAM_HARI)), LAMA_PINJAM_HARI)}
          </p>
        )}
      </div>
      <Textarea
        {...INPUT}
        label={T.catatan}
        placeholder={T.catatanPlaceholder}
        autosize
        minRows={3}
        maxRows={6}
        maxLength={CATATAN_MAX}
        description={T.hitung(values.catatan.length, CATATAN_MAX)}
        inputWrapperOrder={['label', 'input', 'description', 'error']}
        value={values.catatan}
        error={errorOf('catatan')}
        onChange={(e) => set('catatan', e.currentTarget.value)}
        onBlur={() => blur('catatan')}
      />
      <p className={s.note}>{T.privasi}</p>
      {status === 'error' && (
        <p className={s.error} role="alert">
          {T.gagal}
        </p>
      )}
      <div className={s.actions}>
        <Button variant="default" radius="xl" size="md" onClick={onCancel} disabled={sending}>
          {T.batal}
        </Button>
        <Button type="submit" radius="xl" size="md" color={colors['blue-button']} loading={sending}>
          {T.kirim}
        </Button>
      </div>
    </form>
  );
}
