'use client'
import GambarField from '@/app/admin/(dashboard)/_com/konten-bersama/gambar.field';
import type { KlasterForm } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu-profil.form';
import {
  LABEL_SASARAN_KLASTER,
  MAX_DESKRIPSI_KLASTER,
  MAX_JAM_KLASTER,
  MAX_JUDUL_KLASTER,
} from '@/lib/posyandu/posyandu-konten.validation';
import { Paper, Stack, Textarea, TextInput, Title } from '@mantine/core';

type Props = {
  value: KlasterForm;
  onChange: (patch: Partial<KlasterForm>) => void;
  gambarBaru: File | null;
  onGambarBaru: (file: File | null) => void;
};

/** Field satu klaster posyandu (Balita / Remaja / Lansia): judul, fokus layanan, jam, gambar opsional. */
export default function KlasterFields({ value, onChange, gambarBaru, onGambarBaru }: Props) {
  return (
    <Paper p="md" radius="md" withBorder data-testid={`klaster-${value.sasaran}`}>
      <Stack gap="sm">
        <Title order={5}>Klaster {LABEL_SASARAN_KLASTER[value.sasaran]}</Title>
        <TextInput
          label="Judul"
          required
          maxLength={MAX_JUDUL_KLASTER}
          value={value.judul}
          onChange={(e) => onChange({ judul: e.currentTarget.value })}
        />
        <Textarea
          label="Fokus layanan"
          required
          autosize
          minRows={2}
          maxLength={MAX_DESKRIPSI_KLASTER}
          value={value.deskripsi}
          onChange={(e) => onChange({ deskripsi: e.currentTarget.value })}
        />
        <TextInput
          label="Jam pelayanan"
          placeholder="Mis. 09.00 WITA"
          maxLength={MAX_JAM_KLASTER}
          value={value.jamPelayanan}
          onChange={(e) => onChange({ jamPelayanan: e.currentTarget.value })}
        />
        <GambarField
          label="Gambar klaster (opsional)"
          currentUrl={value.imageLink}
          file={gambarBaru}
          onFileChange={onGambarBaru}
          onHapusTersimpan={() => onChange({ imageId: null, imageLink: null })}
        />
      </Stack>
    </Paper>
  );
}
