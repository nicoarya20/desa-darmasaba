/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import { MAX_GAMBAR_DOKUMENTASI } from '@/lib/program-inovasi';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { DokumentasiUploader } from '../../_com/DokumentasiUploader';
import { LogoDropzone } from '../../_com/LogoDropzone';
import { useProgramInovasiMedia, type MediaAwal } from '../../_lib/useProgramInovasiMedia';

type DataAwal = { name: string; description: string; media: MediaAwal };

const DATA_KOSONG: DataAwal = {
  name: '',
  description: '',
  media: { imageId: null, imageUrl: null, images: [] },
};

function EditProgramInovasi() {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const router = useRouter();
  const params = useParams();
  const media = useProgramInovasiMedia();

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [originalData, setOriginalData] = useState<DataAwal>(DATA_KOSONG);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logo & dokumentasi opsional: cukup nama + deskripsi.
  const isFormValid = () => formData.name?.trim() !== '' && formData.description?.trim() !== '';

  const terapkan = (data: DataAwal) => {
    setFormData({ name: data.name, description: data.description });
    media.muat(data.media);
  };

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadProgramInovasi = async () => {
      const data = await stateProgramInovasi.update.load(id);
      if (!data) return;
      const awal: DataAwal = {
        name: data.name || '',
        description: data.description || '',
        media: {
          imageId: data.imageId ?? null,
          imageUrl: data.image?.link ?? null,
          images: data.images ?? [],
        },
      };
      setOriginalData(awal);
      terapkan(awal);
    };
    loadProgramInovasi();
  }, [params?.id]);

  // ✅ Tombol Batal → balikin ke data original (termasuk logo & dokumentasi)
  const handleResetForm = () => {
    terapkan(originalData);
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Unggah logo/dokumentasi baru; logo yang dihapus terkirim sebagai null.
      const { imageId, imageIds } = await media.unggah();
      stateProgramInovasi.update.form = {
        name: formData.name,
        description: formData.description,
        imageId,
        imageIds,
      };

      const berhasil = await stateProgramInovasi.update.update();
      if (berhasil) router.push('/admin/landing-page/profil/program-inovasi');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui program inovasi'
      );
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
          Edit Program Inovasi
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

          <TextInput
            key={String(params.id)} // Convert to string to ensure valid key
            label="Nama Program Inovasi"
            placeholder="Masukkan nama program inovasi"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <EditEditor
              value={formData.description}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, description: htmlContent }))
              }
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
            <Button variant="outline" color="gray" radius="md" size="md" onClick={handleResetForm}>
              Batal
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

export default EditProgramInovasi;
