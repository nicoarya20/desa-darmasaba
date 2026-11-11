'use client';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Button, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import s from './layanan-detail.module.css';
import { LAYANAN_DETAIL_TEXT as T } from './layanan-detail.text';

type Props = { opened: boolean; onClose: () => void };

const UNTOUCHED = { nama: false, nik: false, alamat: false, nomorKk: false, kategori: false };

/** Formulir "Ajukan Permohonan" (nama, NIK, alamat, nomor KK, kategori surat) di modal. */
export function AjukanPermohonanModal({ opened, onClose }: Props) {
  const state = useProxy(stateLayananDesa);
  const stateCreate = useProxy(stateLayananDesa.ajukanPermohonan, { sync: true }); // sync: caret input controlled tak loncat

  // Tandai field yang sudah disentuh (blur) agar pesan error tidak langsung
  // merah saat modal pertama kali dibuka.
  const [touched, setTouched] = useState(UNTOUCHED);

  useEffect(() => {
    void stateLayananDesa.suratKeterangan.findManyAll.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      nama: '',
      nik: '',
      alamat: '',
      nomorKk: '',
      kategoriId: '',
    };
    setTouched(UNTOUCHED);
  };

  // Pesan error per field (hanya tampil setelah field disentuh).
  const f = stateCreate.create.form;
  const namaError = touched.nama && !(f.nama || '').trim() ? 'Nama wajib diisi' : null;
  const nikError = touched.nik
    ? (f.nik || '').length === 0
      ? 'NIK wajib diisi'
      : (f.nik || '').length !== 16
        ? 'NIK harus terdiri dari 16 digit'
        : null
    : null;
  const alamatError = touched.alamat && !(f.alamat || '').trim() ? 'Alamat wajib diisi' : null;
  const nomorKkError = touched.nomorKk
    ? (f.nomorKk || '').length === 0
      ? 'Nomor KK wajib diisi'
      : (f.nomorKk || '').length !== 16
        ? 'Nomor KK harus terdiri dari 16 digit'
        : null
    : null;
  const kategoriError = touched.kategori && !f.kategoriId ? 'Kategori wajib dipilih' : null;

  // Tombol Simpan aktif hanya bila semua syarat terpenuhi.
  const isFormValid = () =>
    !!(f.nama || '').trim() &&
    (f.nik || '').length === 16 &&
    !!(f.alamat || '').trim() &&
    (f.nomorKk || '').length === 16 &&
    !!f.kategoriId;

  const handleSubmit = async () => {
    const f = stateCreate.create.form;
    if (!f.nama?.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }
    // Nama tidak boleh mengandung angka (nama orang, bukan kode).
    if (/[0-9]/.test(f.nama)) {
      toast.error('Nama tidak boleh mengandung angka');
      return;
    }
    if (f.nik.length !== 16) {
      toast.error('NIK harus terdiri dari 16 digit');
      return;
    }
    if (f.nomorKk.length !== 16) {
      toast.error('Nomor KK harus terdiri dari 16 digit');
      return;
    }
    if (!f.alamat?.trim()) {
      toast.error('Alamat wajib diisi');
      return;
    }
    if (!f.kategoriId) {
      toast.error('Kategori wajib dipilih');
      return;
    }
    // Gagal (toast sudah tampil di create()) → biarkan modal terbuka berisi input warga agar bisa dikirim ulang.
    const saved = await stateCreate.create.create();
    if (!saved) return;
    resetForm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={T.ajukan}
      centered
      radius={24}
      padding={28}
      overlayProps={{ backgroundOpacity: 0.45, blur: 8 }}
      transitionProps={{ transition: 'pop', duration: 220 }}
      classNames={{ title: s.modalTitle }}
    >
      <Stack gap="sm">
        <TextInput
          label="Nama"
          placeholder="Masukkan nama"
          withAsterisk
          radius="md"
          error={namaError}
          value={stateCreate.create.form.nama || ''}
          // Tolak angka saat mengetik — nama orang tidak memuat digit.
          onChange={(val) => (stateCreate.create.form.nama = val.target.value.replace(/[0-9]/g, ''))}
          onBlur={() => setTouched((t) => ({ ...t, nama: true }))}
        />
        <TextInput
          inputMode="numeric"
          maxLength={16}
          label="NIK"
          placeholder="Masukkan NIK"
          withAsterisk
          radius="md"
          error={nikError}
          value={stateCreate.create.form.nik || ''}
          onChange={(val) => (stateCreate.create.form.nik = val.target.value.replace(/\D/g, '').slice(0, 16))}
          onBlur={() => setTouched((t) => ({ ...t, nik: true }))}
        />
        <TextInput
          label="Alamat"
          placeholder="Masukkan alamat"
          withAsterisk
          radius="md"
          error={alamatError}
          value={stateCreate.create.form.alamat || ''}
          onChange={(val) => (stateCreate.create.form.alamat = val.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, alamat: true }))}
        />
        <TextInput
          inputMode="numeric"
          maxLength={16}
          label="Nomor KK"
          placeholder="Masukkan Nomor KK"
          withAsterisk
          radius="md"
          error={nomorKkError}
          value={stateCreate.create.form.nomorKk || ''}
          onChange={(val) => (stateCreate.create.form.nomorKk = val.target.value.replace(/\D/g, '').slice(0, 16))}
          onBlur={() => setTouched((t) => ({ ...t, nomorKk: true }))}
        />
        <Select
          label="Kategori"
          placeholder="Pilih kategori"
          radius="md"
          // Baca via snapshot `state` (bukan raw proxy `stateLayananDesa`) agar
          // komponen re-render saat findManyAll.load() selesai async — kalau baca
          // raw proxy, Select tak subscribe & tetap kosong bila modal dibuka
          // sebelum fetch kelar (race intermiten, lebih sering muncul di STG).
          data={state.suratKeterangan.findManyAll.data?.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          value={stateCreate.create.form.kategoriId || null}
          error={kategoriError}
          onChange={(val: string | null) => {
            if (val) {
              // Cari di findManyAll (sumber data dropdown), bukan findMany
              // (list berpaginasi) — sebelumnya mismatch bikin item tak ketemu.
              const selected = state.suratKeterangan.findManyAll.data?.find((item) => item.id === val);
              if (selected) {
                stateCreate.create.form.kategoriId = selected.id;
              }
            } else {
              stateCreate.create.form.kategoriId = '';
            }
          }}
          onBlur={() => setTouched((t) => ({ ...t, kategori: true }))}
          clearable
          nothingFoundMessage="Tidak ditemukan"
          required
        />
        <Button
          mt="xs"
          size="md"
          radius="xl"
          // Modal dirender di portal (di luar akar halaman), jadi variabel --brand tidak terwarisi.
          bg={isFormValid() ? colors['blue-button'] : undefined}
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          Simpan
        </Button>
      </Stack>
    </Modal>
  );
}
