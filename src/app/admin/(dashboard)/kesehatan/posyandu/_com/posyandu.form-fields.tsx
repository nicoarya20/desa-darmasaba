'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import GambarField from '@/app/admin/(dashboard)/_com/konten-bersama/gambar.field';
import type { PosyanduForm } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.form';
import JadwalPelayananInput from '@/components/admin/JadwalPelayananInput';
import { MAX_ALAMAT_POSYANDU } from '@/lib/posyandu/posyandu-konten.validation';
import { Box, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';

type Props = {
  value: PosyanduForm;
  onChange: (patch: Partial<PosyanduForm>) => void;
  banjar: readonly { id: string; name: string }[];
  /** Gambar utama tersimpan (halaman edit); null di halaman tambah. */
  gambarUrl: string | null;
  gambarBaru: File | null;
  onGambarBaru: (file: File | null) => void;
};

/** Field form posyandu banjar (create & edit): foto lokasi, nama, telepon, banjar, alamat, keterangan, jadwal. */
export default function PosyanduFormFields({ value, onChange, banjar, gambarUrl, gambarBaru, onGambarBaru }: Props) {
  return (
    <Stack gap="md" data-testid="posyandu-form">
      <GambarField label="Foto Lokasi Posyandu" currentUrl={gambarUrl} file={gambarBaru} onFileChange={onGambarBaru} />
      <TextInput
        label="Nama Posyandu"
        placeholder="Mis. Posyandu Banjar ..."
        required
        value={value.name}
        onChange={(e) => onChange({ name: e.currentTarget.value })}
      />
      <TextInput
        label="Telepon Posyandu"
        placeholder="Masukkan telepon posyandu"
        inputMode="numeric"
        maxLength={13}
        required
        value={value.nomor}
        onChange={(e) => onChange({ nomor: e.currentTarget.value.replace(/\D/g, '').slice(0, 13) })}
      />
      <Select
        label="Banjar"
        placeholder="Pilih banjar"
        required
        searchable
        data={banjar.map((b) => ({ value: b.id, label: b.name }))}
        value={value.banjarId || null}
        onChange={(val) => onChange({ banjarId: val ?? '' })}
      />
      <Textarea
        label="Alamat"
        placeholder="Mis. Balai Banjar ..., Desa Darmasaba"
        autosize
        minRows={2}
        maxLength={MAX_ALAMAT_POSYANDU}
        value={value.alamat}
        onChange={(e) => onChange({ alamat: e.currentTarget.value })}
      />
      <Box>
        <Text fw="bold" fz="sm" mb={6}>Keterangan Posyandu (opsional)</Text>
        <Text fz="xs" c="dimmed" mb={6}>Deskripsi umum posyandu desa diisi di tab Profil &amp; Klaster.</Text>
        <EditEditor value={value.deskripsi} onChange={(deskripsi) => onChange({ deskripsi })} />
      </Box>
      <Box>
        <Text fw="bold" fz="sm" mb={6}>Jadwal Pelayanan</Text>
        <JadwalPelayananInput value={value.jadwalPelayanan} onChange={(jadwalPelayanan) => onChange({ jadwalPelayanan })} />
      </Box>
    </Stack>
  );
}
