'use client';
import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';
import colors from '@/con/colors';
import { PPIDTextEditor } from '@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor';
import { Button, Input, Modal, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons-react';
import 'dayjs/locale/id';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { pickerToForm, pickerValue, validateLaporanForm, type LaporanFormErrors } from './laporan.logic';
import s from './laporan-form.module.css';
import { LAPORAN_FORM_TEXT as T } from './laporan.text';

type Props = {
  opened: boolean;
  onClose: () => void;
  /** Dipanggil setelah laporan terkirim (daftar dimuat ulang). */
  onSubmitted: () => void;
};

/** Isian dikosongkan setelah terkirim — sama dengan halaman lama (tanggal ikut kosong, bukan "sekarang"). */
const EMPTY_FORM = { judul: '', lokasi: '', tanggalWaktu: '', kronologi: '' };

/**
 * Modal "Tambah Laporan Publik". Field, state (`laporanPublikState.create.form`), dan kiriman
 * (`create.create()` → `POST /api/keamanan/laporanpublik/create`) sama dengan halaman lama; yang baru hanya
 * tampilan, validasi klien sebelum kirim, dan modal tetap terbuka bila kiriman gagal.
 */
export function LaporanForm({ opened, onClose, onSubmitted }: Props) {
  const state = useProxy(laporanPublikState);
  const form = state.create.form;
  const [errors, setErrors] = useState<LaporanFormErrors>({});

  const clearError = (key: keyof LaporanFormErrors) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async () => {
    const found = validateLaporanForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      await state.create.create();
    } catch {
      // create() sudah menampilkan toast galat + console.error lalu melempar ulang; di sini cukup biarkan
      // modal terbuka dengan isian utuh supaya pelapor bisa mencoba lagi.
      return;
    }
    state.create.form = { ...EMPTY_FORM };
    onSubmitted();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={T.title}
      size="lg"
      radius={18}
      padding="xl"
      classNames={{ title: s.modalTitle, header: s.modalHeader }}
    >
      <div className={s.form}>
        <p className={s.note}>{T.note}</p>
        <TextInput
          size="md"
          radius="md"
          label={T.judul}
          placeholder={T.judulPlaceholder}
          withAsterisk
          value={form.judul}
          error={errors.judul}
          onChange={(e) => {
            state.create.form.judul = e.target.value;
            clearError('judul');
          }}
        />
        <TextInput
          size="md"
          radius="md"
          label={T.lokasi}
          placeholder={T.lokasiPlaceholder}
          withAsterisk
          value={form.lokasi}
          error={errors.lokasi}
          onChange={(e) => {
            state.create.form.lokasi = e.target.value;
            clearError('lokasi');
          }}
        />
        <DateTimePicker
          size="md"
          radius="md"
          locale="id"
          label={T.tanggal}
          placeholder={T.tanggalPlaceholder}
          valueFormat="dddd, D MMMM YYYY, HH.mm"
          maxDate={new Date()}
          leftSection={<IconCalendarEvent size={18} stroke={1.75} aria-hidden />}
          withAsterisk
          value={pickerValue(form.tanggalWaktu)}
          error={errors.tanggalWaktu}
          onChange={(val) => {
            state.create.form.tanggalWaktu = pickerToForm(val);
            clearError('tanggalWaktu');
          }}
        />
        <Input.Wrapper label={T.kronologi} description={T.kronologiHint} size="md" className={s.editor}>
          <PPIDTextEditor
            toolbar="basic"
            showSubmit={false}
            initialContent={form.kronologi}
            onChange={(html) => {
              state.create.form.kronologi = html;
            }}
          />
        </Input.Wrapper>
        <div className={s.actions}>
          <Button variant="default" radius="xl" size="md" onClick={onClose}>
            {T.cancel}
          </Button>
          <Button radius="xl" size="md" color={colors['blue-button']} loading={state.create.loading} onClick={submit}>
            {T.submit}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
