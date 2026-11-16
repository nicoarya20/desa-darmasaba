'use client'
import GambarField from '@/app/admin/(dashboard)/_com/konten-bersama/gambar.field';
import MediaSosialInput from '@/app/admin/(dashboard)/_com/konten-bersama/media-sosial.input';
import type { PustuForm } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import { linkGoogleMapsSchema } from '@/lib/konten-bersama/lokasi.logic';
import { LABEL_KONTAK_DARURAT, LABEL_PUSTU_SINGKAT } from '@/lib/pustu/pustu.label';
import {
  MAX_ALAMAT_PUSTU, MAX_DESKRIPSI_LAYANAN, MAX_HARI_JADWAL, MAX_JADWAL_PUSTU, MAX_JAM_JADWAL, MAX_JUDUL_LAYANAN,
  MAX_KONTAK_PUSTU, MAX_LAYANAN_PUSTU, MAX_NAMA_PUSTU,
} from '@/lib/pustu/pustu.validation';
import { SimpleGrid, Stack, TextInput } from '@mantine/core';
import BarisInput from './pustu.baris-input';

type Props = {
  value: PustuForm;
  onChange: (patch: Partial<PustuForm>) => void;
  fotoBaru: File | null;
  onFotoBaru: (file: File | null) => void;
};

const KOLOM_JADWAL = [
  { key: 'hari', label: 'Hari', placeholder: 'Senin – Kamis', maxLength: MAX_HARI_JADWAL },
  { key: 'jam', label: 'Jam', placeholder: '08.00 – 14.00 WITA', maxLength: MAX_JAM_JADWAL },
] as const;

const KOLOM_LAYANAN = [
  { key: 'judul', label: 'Judul layanan', placeholder: 'Imunisasi', maxLength: MAX_JUDUL_LAYANAN },
  { key: 'deskripsi', label: 'Deskripsi layanan', placeholder: 'Pelayanan imunisasi rutin untuk balita.', maxLength: MAX_DESKRIPSI_LAYANAN, multiline: true },
] as const;

/** Field profil PUSTU (create & edit): nama, alamat, foto lokasi, jam, kontak, kontak darurat, medsos, peta, layanan. */
export default function PustuFormFields({ value, onChange, fotoBaru, onFotoBaru }: Props) {
  const cekLink = linkGoogleMapsSchema.safeParse(value.linkMaps);
  return (
    <Stack gap="md" data-testid="pustu-form">
      <TextInput label={`Nama ${LABEL_PUSTU_SINGKAT}`} placeholder="PUSTU Desa Darmasaba" required maxLength={MAX_NAMA_PUSTU} value={value.name} onChange={(e) => onChange({ name: e.currentTarget.value })} />
      <TextInput label="Alamat Lengkap" placeholder="Jalan, banjar, desa" required maxLength={MAX_ALAMAT_PUSTU} value={value.alamat} onChange={(e) => onChange({ alamat: e.currentTarget.value })} />
      <GambarField
        label="Foto Lokasi / Gedung (opsional)"
        currentUrl={value.imageLink}
        file={fotoBaru}
        onFileChange={onFotoBaru}
        onHapusTersimpan={() => onChange({ imageId: null, imageLink: null })}
      />
      <BarisInput
        label="Jam Operasional"
        description="Satu baris per rentang hari, mis. Senin – Kamis · 08.00 – 14.00 WITA."
        value={value.jadwal}
        onChange={(jadwal) => onChange({ jadwal })}
        kolom={KOLOM_JADWAL}
        tambahLabel="Tambah jam operasional"
        max={MAX_JADWAL_PUSTU}
      />
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <TextInput label="Telepon" maxLength={MAX_KONTAK_PUSTU} value={value.kontakPuskesmas} onChange={(e) => onChange({ kontakPuskesmas: e.currentTarget.value })} />
        <TextInput label="Email" type="email" maxLength={MAX_KONTAK_PUSTU} value={value.email} onChange={(e) => onChange({ email: e.currentTarget.value })} />
        <TextInput label={LABEL_KONTAK_DARURAT} maxLength={MAX_KONTAK_PUSTU} value={value.kontakUGD} onChange={(e) => onChange({ kontakUGD: e.currentTarget.value })} />
      </SimpleGrid>
      <MediaSosialInput value={value.mediaSosial} onChange={(mediaSosial) => onChange({ mediaSosial })} label="Link Media Sosial" />
      <TextInput
        label="Link Google Maps (opsional)"
        description="Tampil sebagai tombol “Buka di Google Maps” di halaman publik."
        placeholder="https://maps.app.goo.gl/..."
        value={value.linkMaps}
        error={cekLink.success ? null : cekLink.error.issues[0]?.message}
        onChange={(e) => onChange({ linkMaps: e.currentTarget.value })}
      />
      <BarisInput
        label="Layanan Unggulan"
        description="Judul layanan dan penjelasan singkat; tampil sebagai kartu di halaman publik."
        value={value.layananUnggulan}
        onChange={(layananUnggulan) => onChange({ layananUnggulan })}
        kolom={KOLOM_LAYANAN}
        tambahLabel="Tambah layanan"
        max={MAX_LAYANAN_PUSTU}
      />
    </Stack>
  );
}
