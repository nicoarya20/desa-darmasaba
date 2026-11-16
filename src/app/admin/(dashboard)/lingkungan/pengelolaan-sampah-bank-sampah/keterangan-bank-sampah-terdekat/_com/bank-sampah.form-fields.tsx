'use client'
import GambarField from '@/app/admin/(dashboard)/_com/konten-bersama/gambar.field';
import LokasiInput from '@/app/admin/(dashboard)/_com/konten-bersama/lokasi.input';
import MediaSosialInput from '@/app/admin/(dashboard)/_com/konten-bersama/media-sosial.input';
import type { BankSampahForm } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import { MAX_DESKRIPSI_BANK_SAMPAH, MAX_KONTAK_BANK_SAMPAH } from '@/lib/bank-sampah/bank-sampah.validation';
import { linkGoogleMapsSchema } from '@/lib/konten-bersama/lokasi.logic';
import { Stack, Textarea, TextInput } from '@mantine/core';
import InovasiMultiSelect from './inovasi.multiselect';

type Props = {
  value: BankSampahForm;
  onChange: (patch: Partial<BankSampahForm>) => void;
  baganBaru: File | null;
  onBaganBaru: (file: File | null) => void;
};

/** Field form bank sampah (create & edit): identitas, deskripsi, kontak, medsos, inovasi, lokasi, foto bagan. */
export default function BankSampahFormFields({ value, onChange, baganBaru, onBaganBaru }: Props) {
  const cekLink = linkGoogleMapsSchema.safeParse(value.linkMaps);
  return (
    <Stack gap="md" data-testid="bank-sampah-form">
      <TextInput label="Nama Bank Sampah" placeholder="Masukkan nama bank sampah" required value={value.name} onChange={(e) => onChange({ name: e.currentTarget.value })} />
      <TextInput label="Alamat" placeholder="Masukkan alamat lengkap" required value={value.alamat} onChange={(e) => onChange({ alamat: e.currentTarget.value })} />
      <TextInput
        label="Nama Tempat di Maps"
        placeholder="Masukkan nama tempat yang terdaftar di Google Maps"
        required
        value={value.namaTempatMaps}
        onChange={(e) => onChange({ namaTempatMaps: e.currentTarget.value })}
      />
      <Textarea
        label="Deskripsi"
        placeholder="Deskripsi singkat bank sampah / TPS"
        autosize
        minRows={3}
        maxLength={MAX_DESKRIPSI_BANK_SAMPAH}
        value={value.deskripsi}
        onChange={(e) => onChange({ deskripsi: e.currentTarget.value })}
      />
      <TextInput
        label="Kontak"
        description="Nomor telepon/WhatsApp beserta keterangan, mis. 0812xxxx (Admin)."
        maxLength={MAX_KONTAK_BANK_SAMPAH}
        value={value.kontak}
        onChange={(e) => onChange({ kontak: e.currentTarget.value })}
      />
      <MediaSosialInput value={value.mediaSosial} onChange={(mediaSosial) => onChange({ mediaSosial })} />
      <InovasiMultiSelect value={value.programInovasiIds} onChange={(programInovasiIds) => onChange({ programInovasiIds })} />
      <LokasiInput
        koordinat={value.koordinat}
        onKoordinatChange={(koordinat) => onChange({ koordinat })}
        linkMaps={value.linkMaps}
        onLinkMapsChange={(linkMaps) => onChange({ linkMaps })}
        linkError={cekLink.success ? null : cekLink.error.issues[0]?.message}
      />
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
