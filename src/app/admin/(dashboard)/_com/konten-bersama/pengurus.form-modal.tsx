'use client'
import type { DaftarAnakState } from '@/app/admin/(dashboard)/_state/konten-bersama/daftar-anak.state';
import { unggahGambar } from '@/app/admin/(dashboard)/_state/konten-bersama/unggah-gambar';
import type { PengurusItem } from '@/lib/konten-bersama/konten-bersama.types';
import { MAX_TEKS_PENGURUS } from '@/lib/konten-bersama/pengurus.validation';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { toast } from 'react-toastify';
import GambarField from './gambar.field';

type Props = {
  state: DaftarAnakState<PengurusItem>;
  /** Pengurus yang diedit; null = tambah baru. */
  pengurus: PengurusItem | null;
  onClose: () => void;
};

/** Form tambah/edit satu pengurus (nama, jabatan, foto opsional); foto diunggah saat disimpan. */
export default function PengurusFormModal({ state, pengurus, onClose }: Props) {
  const [nama, setNama] = useState(pengurus?.nama ?? '');
  const [jabatan, setJabatan] = useState(pengurus?.jabatan ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [fotoTersimpan, setFotoTersimpan] = useState(pengurus?.image?.link ?? null);
  const [menyimpan, setMenyimpan] = useState(false);
  const valid = nama.trim() !== '' && jabatan.trim() !== '';

  const simpan = async () => {
    setMenyimpan(true);
    let unggahan: string[] = [];
    try {
      unggahan = file ? [await unggahGambar(file)] : [];
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengunggah foto pengurus');
      setMenyimpan(false);
      return;
    }
    const imageId = unggahan[0] ?? (fotoTersimpan ? (pengurus?.imageId ?? null) : null);
    const isi = { nama: nama.trim(), jabatan: jabatan.trim(), imageId };
    const ok = pengurus ? await state.ubah(pengurus.id, isi, unggahan) : await state.tambah([isi], unggahan);
    setMenyimpan(false);
    if (ok) onClose();
  };

  return (
    <Modal opened onClose={onClose} title={pengurus ? 'Edit Pengurus' : 'Tambah Pengurus'} centered>
      <Stack gap="sm">
        <TextInput label="Nama" required maxLength={MAX_TEKS_PENGURUS} value={nama} onChange={(e) => setNama(e.currentTarget.value)} />
        <TextInput
          label="Jabatan"
          required
          placeholder="mis. Ketua, Sekretaris, Bendahara"
          maxLength={MAX_TEKS_PENGURUS}
          value={jabatan}
          onChange={(e) => setJabatan(e.currentTarget.value)}
        />
        <GambarField
          label="Foto (opsional)"
          currentUrl={fotoTersimpan}
          file={file}
          onFileChange={setFile}
          onHapusTersimpan={() => setFotoTersimpan(null)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>Batal</Button>
          <Button onClick={() => void simpan()} disabled={!valid} loading={menyimpan}>Simpan</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
