'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import GambarField from '@/app/admin/(dashboard)/_com/konten-bersama/gambar.field';
import type { PustuForm } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import { Box, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';

type Props = {
  value: PustuForm;
  onChange: (patch: Partial<PustuForm>) => void;
  baganBaru: File | null;
  onBaganBaru: (file: File | null) => void;
};

function Editor({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return (
    <Box>
      <Text fw={500} fz="sm">{label}</Text>
      <Text c="dimmed" fz="xs" mb={6}>{description}</Text>
      {children}
    </Box>
  );
}

/** Field konten PUSTU (teks kaya): prosedur pendaftaran, tarif BPJS & umum, serta foto bagan struktur. */
export default function PustuKontenFields({ value, onChange, baganBaru, onBaganBaru }: Props) {
  return (
    <Stack gap="md" data-testid="pustu-konten">
      <Editor label="Prosedur Pendaftaran" description="Langkah pendaftaran dan dokumen yang wajib dibawa.">
        <CreateEditor value={value.prosedurPendaftaran} onChange={(prosedurPendaftaran) => onChange({ prosedurPendaftaran })} />
      </Editor>
      <Editor label="Tarif Pasien JKN / BPJS Kesehatan / KIS" description="Tarif, ketentuan, dan syarat bagi peserta BPJS.">
        <CreateEditor value={value.tarifBpjs} onChange={(tarifBpjs) => onChange({ tarifBpjs })} />
      </Editor>
      <Editor label="Tarif Pasien Umum (Non-BPJS)" description="Biaya retribusi, obat, dan tindakan bagi pasien tanpa BPJS aktif.">
        <CreateEditor value={value.tarifUmum} onChange={(tarifUmum) => onChange({ tarifUmum })} />
      </Editor>
      <GambarField
        label="Foto Bagan Struktur Organisasi (opsional)"
        currentUrl={value.fotoBaganLink}
        file={baganBaru}
        onFileChange={onBaganBaru}
        onHapusTersimpan={() => onChange({ fotoBaganStrukturId: null, fotoBaganLink: null })}
      />
    </Stack>
  );
}
