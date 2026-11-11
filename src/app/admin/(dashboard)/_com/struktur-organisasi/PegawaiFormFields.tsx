'use client'
import { Select, Switch, Textarea, TextInput } from '@mantine/core';
import { FotoPegawaiInput } from './FotoPegawaiInput';
import { pegawaiFormErrors, type PegawaiFormValues, type SelectOption, type SetField } from './struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

/** Panjang maksimal nomor telepon (digit saja). */
const MAX_TELEPON = 15;

type Props = {
  values: PegawaiFormValues;
  onChange: SetField<PegawaiFormValues>;
  /** Pilihan jabatan (dari daftar jabatan). */
  posisiOptions: SelectOption[];
  foto: { preview: string | null; onPick: (file: File) => void; onRemove: () => void };
  /** Tampilkan saklar status aktif (form edit). */
  withStatus?: boolean;
};

/**
 * Field form pegawai struktur organisasi. Hanya Nama Lengkap + Jabatan bertanda wajib; email & tanggal masuk
 * hanya divalidasi bila diisi (pesan tampil setelah field diisi, bukan saat form masih kosong).
 */
export function PegawaiFormFields({ values, onChange, posisiOptions, foto, withStatus }: Props) {
  const errors = pegawaiFormErrors(values);
  return (
    <>
      <TextInput
        required
        label={T.pegawai.namaLengkap}
        placeholder={T.pegawai.namaPlaceholder}
        value={values.namaLengkap}
        onChange={(e) => onChange('namaLengkap', e.currentTarget.value)}
      />
      <Select
        required
        searchable
        label={T.pegawai.jabatan}
        placeholder={T.pegawai.jabatanPlaceholder}
        data={posisiOptions}
        value={values.posisiId || null}
        onChange={(value) => onChange('posisiId', value ?? '')}
        nothingFoundMessage={T.posisi.kosong}
      />
      <TextInput
        label={T.pegawai.gelarAkademik}
        placeholder={T.pegawai.gelarPlaceholder}
        value={values.gelarAkademik}
        onChange={(e) => onChange('gelarAkademik', e.currentTarget.value)}
      />
      <FotoPegawaiInput {...foto} />
      <TextInput
        type="date"
        label={T.pegawai.tanggalMasuk}
        value={values.tanggalMasuk}
        error={values.tanggalMasuk ? errors.tanggalMasuk : undefined}
        onChange={(e) => onChange('tanggalMasuk', e.currentTarget.value)}
      />
      <TextInput
        type="email"
        label={T.pegawai.email}
        placeholder={T.pegawai.emailPlaceholder}
        value={values.email}
        error={values.email ? errors.email : undefined}
        onChange={(e) => onChange('email', e.currentTarget.value)}
      />
      <TextInput
        inputMode="tel"
        label={T.pegawai.telepon}
        placeholder={T.pegawai.teleponPlaceholder}
        value={values.telepon}
        onChange={(e) => onChange('telepon', e.currentTarget.value.replace(/\D/g, '').slice(0, MAX_TELEPON))}
      />
      <Textarea
        autosize
        minRows={2}
        label={T.pegawai.alamat}
        placeholder={T.pegawai.alamatPlaceholder}
        value={values.alamat}
        onChange={(e) => onChange('alamat', e.currentTarget.value)}
      />
      {withStatus ? (
        <Switch
          label={T.aktif}
          checked={values.isActive}
          onChange={(e) => onChange('isActive', e.currentTarget.checked)}
        />
      ) : null}
    </>
  );
}
