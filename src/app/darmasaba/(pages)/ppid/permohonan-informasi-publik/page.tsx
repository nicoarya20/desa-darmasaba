'use client'
import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import colors from '@/con/colors';
import { Button, Checkbox, TextInput } from '@mantine/core';
import { IconSend2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { PermohonanFormCard, PermohonanLayout } from '../_com/PermohonanLayout';
import { PermohonanSteps } from '../_com/PermohonanSteps';
import { PpidPage } from '../_com/PpidPage';
import { PERMOHONAN_FIELD, type PermohonanStep } from '../_com/permohonan.meta';
import s from '../_com/permohonan.module.css';
import JenisInformasiSelector from './jenis_infromasi/jenisInformasiSelector';
import MemperolehInformasi from './memperoleh_informasi/memperolehInfromasi';
import MemperolehSalinan from './salinan_informasi/salinanInformasi';

const TEXT = {
  title: 'Permohonan Informasi Publik',
  lead: 'Ajukan permohonan informasi publik kepada PPID Desa Darmasaba dengan mengisi formulir di bawah ini.',
  stepsTitle: 'Tata Cara Permohonan',
  formTitle: 'Formulir Permohonan Informasi',
} as const;

const steps: PermohonanStep[] = [
  {
    title: 'Ajukan Permohonan',
    desc: 'Pemohon mengajukan permohonan informasi kepada badan publik secara langsung atau melalui surat elektronik.',
  },
  {
    title: 'Isi Formulir',
    desc: 'Lengkapi formulir dengan identitas (nama, alamat, telepon, email), jenis, format, serta cara memperoleh informasi, dan lampirkan fotokopi identitas.',
  },
  {
    title: 'Proses oleh PPID',
    desc: 'PPID akan memproses permohonan sesuai ketentuan yang berlaku.',
  },
  {
    title: 'Penyampaian Informasi',
    desc: 'Petugas PPID memberikan informasi sesuai permohonan kepada pemohon.',
  },
];

function Page() {
  const permohonanInformasiPublikState = useProxy(statePermohonanInformasi, { sync: true });
  const router = useRouter();
  // Pernyataan persetujuan wajib dicentang sebelum kirim.
  const [setuju, setSetuju] = useState(false);

  // Tandai field yang sudah disentuh (blur) agar pesan error tidak langsung
  // merah saat halaman pertama kali dibuka.
  const [touched, setTouched] = useState({
    name: false,
    nik: false,
    notelp: false,
    alamat: false,
    email: false,
  });

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if form is valid.
  // Catatan: form.x?.trim() !== '' bernilai true saat field masih undefined
  // (belum disentuh) → tombol kirim aktif walau form kosong. Pakai truthy check.
  const isFormValid = () => {
    const form = permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form;
    const nikDigits = (form.nik || '').replace(/\D/g, '');
    const notelpDigits = (form.notelp || '').replace(/\D/g, '');
    return (
      !!form.name?.trim() &&
      nikDigits.length === 16 &&
      notelpDigits.length >= 10 &&
      !!form.alamat?.trim() &&
      !!form.email?.trim() &&
      isValidEmail(form.email || '') &&
      !!form.jenisInformasiDimintaId &&
      !!form.caraMemperolehInformasiId &&
      !!form.caraMemperolehSalinanInformasiId &&
      setuju
    );
  };

  // Pesan error per field (hanya tampil setelah field disentuh).
  const form = permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form;
  const nikDigits = (form.nik || '').replace(/\D/g, '');
  const notelpDigits = (form.notelp || '').replace(/\D/g, '');

  const nameError =
    touched.name && (form.name || '').trim().length < 3
      ? 'Nama lengkap wajib diisi (min. 3 karakter)'
      : null;

  const nikError = touched.nik
    ? nikDigits.length === 0
      ? 'NIK wajib diisi'
      : nikDigits.length !== 16
        ? 'NIK harus 16 digit'
        : null
    : null;

  const notelpError = touched.notelp
    ? notelpDigits.length === 0
      ? 'Nomor telepon wajib diisi'
      : notelpDigits.length < 10
        ? 'Nomor telepon minimal 10 digit'
        : null
    : null;

  const alamatError =
    touched.alamat && !form.alamat?.trim()
      ? 'Alamat lengkap wajib diisi'
      : null;

  const emailError = touched.email
    ? !form.email?.trim()
      ? 'Alamat email wajib diisi'
      : !isValidEmail(form.email)
        ? 'Format email tidak valid'
        : null
    : null;

  const submitForms = async () => {
    const { create } = permohonanInformasiPublikState.statepermohonanInformasiPublik;
    const hasil = await create.create();
    if (hasil) {
      // Reset proxy form (NIK/notelp controlled) + checkbox agar tidak menyisakan
      // data lama saat pengguna kembali ke halaman ini.
      create.form = {} as typeof create.form;
      setSetuju(false);
      setTouched({
        name: false,
        nik: false,
        notelp: false,
        alamat: false,
        email: false,
      });
      router.push('/darmasaba/permohonan/berhasil');
    }
  };

  return (
    <PpidPage title={TEXT.title} lead={TEXT.lead}>
      <PermohonanLayout aside={<PermohonanSteps title={TEXT.stepsTitle} steps={steps} />}>
        <PermohonanFormCard title={TEXT.formTitle}>
          <TextInput
            {...PERMOHONAN_FIELD}
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap Anda"
            withAsterisk
            error={nameError}
            value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.name || ''}
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.name =
                val.target.value.replace(/[0-9]/g, '');
            }}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />

          <TextInput
            {...PERMOHONAN_FIELD}
            label="Nomor Induk Kependudukan (NIK)"
            placeholder="Masukkan NIK"
            withAsterisk
            inputMode="numeric"
            maxLength={16}
            error={nikError}
            value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.nik || ''}
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.nik =
                val.target.value.replace(/\D/g, '').slice(0, 16);
            }}
            onBlur={() => setTouched((t) => ({ ...t, nik: true }))}
          />

          <TextInput
            {...PERMOHONAN_FIELD}
            label="Nomor Telepon"
            placeholder="Masukkan nomor telepon aktif"
            withAsterisk
            inputMode="numeric"
            maxLength={13}
            error={notelpError}
            value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.notelp || ''}
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.notelp =
                val.target.value.replace(/\D/g, '').slice(0, 13);
            }}
            onBlur={() => setTouched((t) => ({ ...t, notelp: true }))}
          />

          <TextInput
            {...PERMOHONAN_FIELD}
            label="Alamat Lengkap"
            placeholder="Masukkan alamat sesuai identitas"
            withAsterisk
            error={alamatError}
            value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.alamat || ''}
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.alamat =
                val.target.value;
            }}
            onBlur={() => setTouched((t) => ({ ...t, alamat: true }))}
          />

          <TextInput
            {...PERMOHONAN_FIELD}
            label="Alamat Email"
            placeholder="Masukkan alamat email aktif"
            type="email"
            withAsterisk
            error={emailError}
            value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.email || ''}
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.email =
                val.target.value;
            }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />

          <JenisInformasiSelector
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.jenisInformasiDimintaId =
                val.id;
            }}
          />

          <MemperolehInformasi
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.caraMemperolehInformasiId =
                val.id;
            }}
          />

          <MemperolehSalinan
            onChange={(val) => {
              permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.caraMemperolehSalinanInformasiId =
                val.id;
            }}
          />

          <Checkbox
            size="sm"
            color={colors['blue-button']}
            checked={setuju}
            onChange={(e) => setSetuju(e.currentTarget.checked)}
            label="Saya menyatakan bahwa data yang saya berikan benar adanya dan informasi yang diminta akan digunakan sesuai ketentuan."
          />

          <div className={s.actions}>
            <Button
              size="md"
              radius="xl"
              bg={colors['blue-button']}
              leftSection={<IconSend2 size={20} color={colors['white-1']} />}
              onClick={submitForms}
              disabled={!isFormValid()}
            >
              Kirim Permohonan
            </Button>
          </div>
        </PermohonanFormCard>
      </PermohonanLayout>
    </PpidPage>
  );
}

export default Page;
