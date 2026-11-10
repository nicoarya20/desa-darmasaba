/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import colors from '@/con/colors';
import { MAX_GAMBAR_DOKUMENTASI } from '@/lib/program-inovasi';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSnapshot } from 'valtio';
import profileLandingPageState from '../../../../_state/landing-page/profile';
import { emptyProgramInovasiForm } from '@/app/admin/(dashboard)/_state/landing-page/profile/program-inovasi';
import { DokumentasiUploader } from '../_com/DokumentasiUploader';
import { LogoDropzone } from '../_com/LogoDropzone';
import { useProgramInovasiMedia } from '../_lib/useProgramInovasiMedia';

function CreateProgramInovasi() {
  const router = useRouter();
  // BACA (render/value) via snapshot; TULIS (onChange/handler) via proxy mentah.
  // { sync: true } WAJIB: default useSnapshot notify re-render async (satu microtask),
  // sehingga controlled <input> commit dgn value lama dulu → caret loncat saat ketik di
  // tengah. Sync memaksa re-render di event yang sama → caret stabil.
  const stateProgramInovasi = profileLandingPageState.programInovasi;
  const snap = useSnapshot(profileLandingPageState.programInovasi, { sync: true });
  const media = useProgramInovasiMedia();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logo & dokumentasi opsional: cukup nama + deskripsi.
  const isFormValid = () =>
    snap.create.form.name?.trim() !== '' && snap.create.form.description?.trim() !== '';

  useEffect(() => {
    stateProgramInovasi.findMany.load();
  }, []);

  // ✅ Reset semua input form, logo & dokumentasi
  const resetForm = () => {
    stateProgramInovasi.create.form = emptyProgramInovasiForm();
    media.muat();
  };

  // ✅ Submit data: unggah logo & dokumentasi dulu, baru simpan program
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { imageId, imageIds } = await media.unggah();
      stateProgramInovasi.create.form.imageId = imageId;
      stateProgramInovasi.create.form.imageIds = imageIds;
      await stateProgramInovasi.create.create();

      resetForm();
      router.push('/admin/landing-page/profil/program-inovasi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan program inovasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Program Inovasi
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <LogoDropzone preview={media.logoPreview} onSelect={media.pilihLogo} onRemove={media.hapusLogo} />

          {/* ======= Input Nama ======= */}
          <TextInput
            label="Nama Program Inovasi"
            placeholder="Masukkan nama program inovasi"
            value={snap.create.form.name}
            onChange={(e) => (stateProgramInovasi.create.form.name = e.target.value)}
            required
          />

          {/* ======= Deskripsi ======= */}
          <Box>
            <Text fz={'sm'} fw={'bold'}>
              Deskripsi
            </Text>
            <CreateEditor
              value={snap.create.form.description || ''}
              onChange={(htmlContent: string) => {
                stateProgramInovasi.create.form.description = htmlContent;
              }}
            />
          </Box>

          <DokumentasiUploader
            items={media.dokumentasi}
            max={MAX_GAMBAR_DOKUMENTASI}
            onAdd={media.tambahGambar}
            onRemove={media.hapusGambar}
          />

          {/* ======= Tombol Aksi ======= */}
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={resetForm}>
              Reset
            </Button>

            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramInovasi;
