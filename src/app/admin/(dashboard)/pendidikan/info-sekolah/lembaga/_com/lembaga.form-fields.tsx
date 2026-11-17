'use client'
import GambarField from '@/app/admin/(dashboard)/_com/konten-bersama/gambar.field';
import LokasiInput from '@/app/admin/(dashboard)/_com/konten-bersama/lokasi.input';
import MediaSosialInput from '@/app/admin/(dashboard)/_com/konten-bersama/media-sosial.input';
import type { LembagaForm, LembagaFotoBaru } from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga.form';
import { linkGoogleMapsSchema } from '@/lib/konten-bersama/lokasi.logic';
import { MAX_ALAMAT_LEMBAGA, MAX_DESKRIPSI_LEMBAGA, MAX_KONTAK_LEMBAGA } from '@/lib/lembaga-pendidikan/lembaga.validation';
import { Select, Stack, Textarea, TextInput } from '@mantine/core';

type Props = {
  value: LembagaForm;
  onChange: (patch: Partial<LembagaForm>) => void;
  /** Pilihan jenjang pendidikan (value = id). */
  jenjangOptions: { value: string; label: string }[];
  fotoBaru: LembagaFotoBaru;
  onFotoBaru: (patch: Partial<LembagaFotoBaru>) => void;
};

/** Field form lembaga pendidikan (create & edit): identitas, deskripsi, alamat, kontak, medsos, lokasi, foto. */
export default function LembagaFormFields({ value, onChange, jenjangOptions, fotoBaru, onFotoBaru }: Props) {
  const cekLink = linkGoogleMapsSchema.safeParse(value.linkMaps);
  return (
    <Stack gap="md" data-testid="lembaga-form">
      <TextInput label="Nama Lembaga" placeholder="Masukkan nama lembaga" required value={value.nama} onChange={(e) => onChange({ nama: e.currentTarget.value })} />
      <Select
        label="Jenjang Pendidikan"
        placeholder="Pilih jenjang pendidikan"
        searchable
        required
        data={jenjangOptions}
        value={value.jenjangId || null}
        onChange={(jenjangId) => onChange({ jenjangId: jenjangId ?? '' })}
      />
      <Textarea
        label="Deskripsi"
        placeholder="Profil singkat sekolah: visi, kegiatan, keunggulan"
        autosize
        minRows={4}
        maxLength={MAX_DESKRIPSI_LEMBAGA}
        value={value.deskripsi}
        onChange={(e) => onChange({ deskripsi: e.currentTarget.value })}
      />
      <TextInput
        label="Alamat"
        placeholder="Mis. Jl. Jempiring, Desa Darmasaba"
        maxLength={MAX_ALAMAT_LEMBAGA}
        value={value.alamat}
        onChange={(e) => onChange({ alamat: e.currentTarget.value })}
      />
      <TextInput
        label="Kontak"
        description="Telepon/WhatsApp atau email sekolah; nomor yang valid tampil sebagai tombol di halaman publik."
        maxLength={MAX_KONTAK_LEMBAGA}
        value={value.kontak}
        onChange={(e) => onChange({ kontak: e.currentTarget.value })}
      />
      <MediaSosialInput value={value.mediaSosial} onChange={(mediaSosial) => onChange({ mediaSosial })} />
      <LokasiInput
        koordinat={value.koordinat}
        onKoordinatChange={(koordinat) => onChange({ koordinat })}
        onKoordinatHapus={() => onChange({ koordinat: null })}
        alamat={value.alamat}
        linkMaps={value.linkMaps}
        onLinkMapsChange={(linkMaps) => onChange({ linkMaps })}
        linkError={cekLink.success ? null : cekLink.error.issues[0]?.message}
      />
      <GambarField
        label="Foto Sekolah (opsional)"
        currentUrl={value.fotoSekolahLink}
        file={fotoBaru.fotoSekolah}
        onFileChange={(fotoSekolah) => onFotoBaru({ fotoSekolah })}
        onHapusTersimpan={() => onChange({ fotoSekolahId: null, fotoSekolahLink: null })}
      />
      <GambarField
        label="Foto Bagan Struktur Organisasi (opsional)"
        currentUrl={value.fotoBaganLink}
        file={fotoBaru.bagan}
        onFileChange={(bagan) => onFotoBaru({ bagan })}
        onHapusTersimpan={() => onChange({ fotoBaganStrukturId: null, fotoBaganLink: null })}
      />
    </Stack>
  );
}
