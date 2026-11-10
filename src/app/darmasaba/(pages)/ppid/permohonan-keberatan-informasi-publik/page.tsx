'use client'
import permohonanKeberatanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi';
import { PPIDTextEditor } from '@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor';
import colors from '@/con/colors';
import {
  ALASAN_KEBERATAN_MAX_LENGTH,
  richTextLength,
  validateAlasanKeberatanLength,
} from '@/lib/permohonan-keberatan';
import { Button, Input, Text, TextInput, Tooltip } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { PermohonanFormCard, PermohonanLayout } from '../_com/PermohonanLayout';
import { PermohonanSteps } from '../_com/PermohonanSteps';
import { PpidPage } from '../_com/PpidPage';
import { PERMOHONAN_FIELD, type PermohonanStep } from '../_com/permohonan.meta';
import s from '../_com/permohonan.module.css';

const TEXT = {
  title: 'Permohonan Keberatan Informasi Publik',
  lead: 'Jika Anda merasa permohonan informasi tidak ditanggapi dengan baik atau ditolak, Anda berhak mengajukan keberatan melalui formulir berikut.',
  stepsTitle: 'Alur Pengajuan Keberatan',
  formTitle: 'Formulir Keberatan',
  contactTitle: 'Kontak PPID',
} as const;

const steps: PermohonanStep[] = [
  {
    title: 'Isi Formulir',
    desc: 'Lengkapi formulir keberatan secara online dengan mudah.',
  },
  {
    title: 'Verifikasi Data',
    desc: 'Tim PPID akan memeriksa dan memverifikasi permohonan Anda.',
  },
  {
    title: 'Proses Keberatan',
    desc: 'Keberatan diproses maksimal dalam 30 hari kerja.',
  },
  {
    title: 'Hasil Dikirim',
    desc: 'Hasil keputusan dikirim melalui email atau WhatsApp.',
  },
];

// Nilai kontak dipertahankan apa adanya dari halaman lama (nomor WhatsApp masih placeholder — urusan data).
const contacts = [
  { label: 'Email', value: 'desadarmasaba@badungkab.go.id' },
  { label: 'WhatsApp', value: '081-xxx-xxx-xxx' },
];

function Page() {
  const stateKeberatan = useProxy(permohonanKeberatanInformasi, { sync: true });
  const router = useRouter();

  // Tandai field yang sudah pernah disentuh (blur) agar pesan error tidak
  // langsung merah saat halaman pertama kali dibuka.
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    notelp: false,
    alasan: false,
  });

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Pesan error per field (hanya tampil setelah field disentuh).
  const form = stateKeberatan.create.form;
  const notelpDigits = (form.notelp || '').replace(/\D/g, '');

  const nameError =
    touched.name && (form.name || '').trim().length < 3
      ? 'Nama lengkap wajib diisi (min. 3 karakter)'
      : null;

  const emailError = touched.email
    ? !form.email?.trim()
      ? 'Alamat email wajib diisi'
      : !isValidEmail(form.email)
        ? 'Format email tidak valid'
        : null
    : null;

  const notelpError = touched.notelp
    ? notelpDigits.length === 0
      ? 'Nomor telepon wajib diisi'
      : notelpDigits.length < 10
        ? 'Nomor telepon minimal 10 digit'
        : null
    : null;

  const alasanLength = richTextLength(form.alasan);
  const alasanTooLong = validateAlasanKeberatanLength(form.alasan || '');

  const alasanError =
    touched.alasan && !form.alasan?.trim()
      ? 'Alasan keberatan wajib diisi'
      : alasanTooLong;

  // Check if form is valid.
  // Catatan: pakai truthy check — form.x?.trim() !== '' bernilai true saat field
  // belum disentuh (undefined), sehingga tombol kirim aktif walau form kosong.
  const isFormValid = () => {
    const form = stateKeberatan.create.form;
    const notelpDigits = (form.notelp || '').replace(/\D/g, '');
    return (
      !!form.name?.trim() &&
      !!form.email?.trim() &&
      isValidEmail(form.email || '') &&
      notelpDigits.length >= 10 &&
      !!form.alasan?.trim() &&
      !validateAlasanKeberatanLength(form.alasan)
    );
  };

  const submit = async () => {
    const hasil = await stateKeberatan.create.create();
    if (hasil) router.push('/darmasaba/permohonan/berhasil');
  };

  return (
    <PpidPage title={TEXT.title} lead={TEXT.lead}>
      <PermohonanLayout aside={<PermohonanSteps title={TEXT.stepsTitle} steps={steps} />}>
        <PermohonanFormCard title={TEXT.formTitle}>
          <TextInput
            {...PERMOHONAN_FIELD}
            label="Nama Lengkap"
            placeholder="Tulis nama lengkap Anda"
            withAsterisk
            error={nameError}
            value={stateKeberatan.create.form.name || ''}
            onChange={(val) =>
              (stateKeberatan.create.form.name = val.target.value.replace(
                /[0-9]/g,
                ''
              ))
            }
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />

          <TextInput
            {...PERMOHONAN_FIELD}
            label="Alamat Email"
            placeholder="Contoh: nama@email.com"
            type="email"
            withAsterisk
            error={emailError}
            value={stateKeberatan.create.form.email || ''}
            onChange={(val) =>
              (stateKeberatan.create.form.email = val.target.value)
            }
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />

          <TextInput
            {...PERMOHONAN_FIELD}
            label="Nomor Telepon"
            placeholder="Contoh: 081234567890"
            withAsterisk
            inputMode="numeric"
            maxLength={13}
            error={notelpError}
            value={stateKeberatan.create.form.notelp || ''}
            onChange={(val) =>
              (stateKeberatan.create.form.notelp = val.target.value
                .replace(/\D/g, '')
                .slice(0, 13))
            }
            onBlur={() => setTouched((t) => ({ ...t, notelp: true }))}
          />

          <Input.Wrapper label="Alasan Keberatan" size={PERMOHONAN_FIELD.size} withAsterisk error={alasanError}>
            <div className={s.editor}>
              <PPIDTextEditor
                showSubmit={false}
                toolbar="basic"
                onChange={(val) => {
                  stateKeberatan.create.form.alasan = val;
                  if (!touched.alasan)
                    setTouched((t) => ({ ...t, alasan: true }));
                }}
              />
            </div>
            <Text
              fz="xs"
              mt={4}
              c={alasanLength > ALASAN_KEBERATAN_MAX_LENGTH ? 'red' : 'dimmed'}
            >
              {alasanLength}/{ALASAN_KEBERATAN_MAX_LENGTH} karakter
            </Text>
          </Input.Wrapper>

          <div className={s.actions}>
            <Tooltip label="Pastikan semua data sudah diisi dengan benar">
              <Button
                onClick={submit}
                size="md"
                radius="xl"
                fw={600}
                bg={colors['blue-button']}
                disabled={!isFormValid()}
              >
                Kirim Permohonan
              </Button>
            </Tooltip>
          </div>
        </PermohonanFormCard>

        <section>
          <h2 className={s.contactTitle}>{TEXT.contactTitle}</h2>
          <dl className={s.contactList}>
            {contacts.map((contact) => (
              <div key={contact.label} className={s.contactRow}>
                <dt>{contact.label}</dt>
                <dd>{contact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </PermohonanLayout>
    </PpidPage>
  );
}

export default Page;
