'use client'
import colors from '@/con/colors';
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes';
import { Box, Button, Group, NumberInput, Paper, Stack, Switch, Textarea, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BumdesImageField from './BumdesImageField';

export const UNIT_USAHA_LIST_PATH = '/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/unit-usaha';

/** Form tambah/ubah unit usaha BUMDes; mode ditentukan oleh `editId` di state (kosong = tambah). */
export default function UnitUsahaForm({ title }: { title: string }) {
  const router = useRouter();
  const unit = useProxy(stateBumdes.unitUsaha, { sync: true }); // sync: cegah caret jump di controlled input
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    const ok = await stateBumdes.unitUsaha.submit(file);
    if (ok) {
      stateBumdes.unitUsaha.resetForm();
      router.push(UNIT_USAHA_LIST_PATH);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm">{title}</Title>
      </Group>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        <Stack gap="md">
          <BumdesImageField
            label="Gambar Unit Usaha"
            currentUrl={unit.currentImageUrl}
            file={file}
            onFileChange={setFile}
          />
          <TextInput
            label="Nama Unit Usaha"
            placeholder="Contoh: Unit Simpan Pinjam"
            required
            value={unit.form.nama}
            onChange={(e) => (stateBumdes.unitUsaha.form.nama = e.currentTarget.value)}
          />
          <Textarea
            label="Deskripsi"
            placeholder="Jelaskan kegiatan unit usaha ini"
            required
            autosize
            minRows={4}
            maxRows={12}
            value={unit.form.deskripsi}
            onChange={(e) => (stateBumdes.unitUsaha.form.deskripsi = e.currentTarget.value)}
          />
          <NumberInput
            label="Urutan Tampil"
            description="Angka kecil tampil lebih dulu. Kosongkan untuk menaruh di urutan terakhir."
            min={0}
            max={9999}
            allowDecimal={false}
            allowNegative={false}
            value={unit.form.urutan ?? ''}
            onChange={(v) => (stateBumdes.unitUsaha.form.urutan = typeof v === 'number' ? v : null)}
          />
          <Switch
            label="Tampilkan di halaman publik"
            checked={unit.form.isActive}
            onChange={(e) => (stateBumdes.unitUsaha.form.isActive = e.currentTarget.checked)}
          />
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={() => router.back()}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={unit.loading}
              radius="md"
              size="md"
              style={{ background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`, color: '#fff' }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
