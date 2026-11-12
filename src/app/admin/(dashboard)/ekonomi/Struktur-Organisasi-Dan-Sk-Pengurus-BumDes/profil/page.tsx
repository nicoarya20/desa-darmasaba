'use client'
import colors from '@/con/colors';
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes';
import { Box, Button, Group, NumberInput, Paper, Skeleton, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BumdesImageField from '../_lib/BumdesImageField';
import GaleriFotoBumdesAdmin from '../_lib/GaleriFotoBumdesAdmin';

/** Admin: form ubah profil BUMDes (singleton, disimpan lewat upsert) + galeri foto di bawahnya. */
function ProfilBumdesAdmin() {
  const profil = useProxy(stateBumdes.profil, { sync: true }); // sync: cegah caret jump di controlled input
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    void stateBumdes.profil.load().then(() => stateBumdes.profil.fillForm());
  }, []);

  if (!profil.loaded) {
    return <Skeleton height={420} radius="md" />;
  }

  const handleSave = async () => {
    const ok = await stateBumdes.profil.save(file);
    if (ok) {
      setFile(null);
      stateBumdes.profil.fillForm();
    }
  };

  return (
    <Box py="xs">
      <Title order={3} mb="xs">Profil BUMDes</Title>
      {!profil.data && (
        <Text c="dimmed" fz="sm" mb="md">
          Profil BUMDes belum diisi. Halaman publik menampilkan keterangan kosong sampai data ini disimpan.
        </Text>
      )}
      <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
        <Stack gap="md">
          <BumdesImageField
            label="Foto / Logo BUMDes"
            currentUrl={profil.data?.image?.link ?? null}
            file={file}
            onFileChange={setFile}
          />
          <TextInput
            label="Nama BUMDes"
            placeholder="Nama resmi BUMDes"
            required
            value={profil.form.nama}
            onChange={(e) => (stateBumdes.profil.form.nama = e.currentTarget.value)}
          />
          <Textarea
            label="Deskripsi"
            placeholder="Gambaran singkat BUMDes, tujuan, dan kegiatan utamanya"
            required
            autosize
            minRows={4}
            maxRows={14}
            value={profil.form.deskripsi}
            onChange={(e) => (stateBumdes.profil.form.deskripsi = e.currentTarget.value)}
          />
          <Textarea
            label="Alamat"
            placeholder="Alamat kantor / sekretariat BUMDes"
            autosize
            minRows={2}
            value={profil.form.alamat}
            onChange={(e) => (stateBumdes.profil.form.alamat = e.currentTarget.value)}
          />
          <TextInput
            label="Kontak"
            placeholder="Nomor telepon / email / media sosial"
            value={profil.form.kontak}
            onChange={(e) => (stateBumdes.profil.form.kontak = e.currentTarget.value)}
          />
          <NumberInput
            label="Tahun Berdiri"
            placeholder="Contoh: 2018"
            min={1900}
            max={new Date().getFullYear()}
            allowDecimal={false}
            allowNegative={false}
            thousandSeparator={false}
            value={profil.form.tahunBerdiri ?? ''}
            onChange={(v) => (stateBumdes.profil.form.tahunBerdiri = typeof v === 'number' ? v : null)}
          />
          <Group justify="right">
            <Button
              onClick={handleSave}
              loading={profil.saving}
              radius="md"
              size="md"
              style={{ background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`, color: '#fff' }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
      <GaleriFotoBumdesAdmin profilTersimpan={profil.data !== null} />
    </Box>
  );
}

export default ProfilBumdesAdmin;
