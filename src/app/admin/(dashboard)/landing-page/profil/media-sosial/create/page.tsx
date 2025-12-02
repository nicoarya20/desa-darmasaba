/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
  ActionIcon
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import profileLandingPageState from '../../../../_state/landing-page/profile';
import SelectSosialMedia from '@/app/admin/(dashboard)/_com/selectSocialMedia';


// ⭐ Tambah type SosmedKey
type SosmedKey =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'whatsapp'
  | 'gmail'
  | 'telegram'
  | 'x'
  | 'telephone'
  | 'custom';

// ⭐ mapping icon sosmed bawaan
const sosmedMap: Record<SosmedKey, { label: string; src: string | null }> = {
  facebook: { label: 'Facebook', src: '/assets/images/sosmed/facebook.png' },
  instagram: { label: 'Instagram', src: '/assets/images/sosmed/instagram.png' },
  tiktok: { label: 'Tiktok', src: '/assets/images/sosmed/tiktok.png' },
  youtube: { label: 'YouTube', src: '/assets/images/sosmed/youtube.png' },
  whatsapp: { label: 'WhatsApp', src: '/assets/images/sosmed/whatsapp.png' },
  gmail: { label: 'Gmail', src: '/assets/images/sosmed/gmail.png' },
  telegram: { label: 'Telegram', src: '/assets/images/sosmed/telegram.png' },
  x: { label: 'X (Twitter)', src: '/assets/images/sosmed/x-twitter.png' },
  telephone: { label: 'Telephone', src: '/assets/images/sosmed/telephone-call.png' },
  custom: { label: 'Custom Icon', src: null },
};

export default function CreateMediaSosial() {
  const router = useRouter();
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial);

  const [selectedSosmed, setSelectedSosmed] = useState<SosmedKey>('facebook');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    stateMediaSosial.findMany.load();
  }, []);

  const resetForm = () => {
    stateMediaSosial.create.form = {
      name: '',
      imageId: '',
      iconUrl: '',
      icon: ''
    };

    setFile(null);
    setPreviewImage(null);
    setSelectedSosmed('facebook');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // ──────────────── ⭐ CASE 1: PAKAI ICON DEFAULT ────────────────
      if (selectedSosmed !== 'custom') {
        stateMediaSosial.create.form.imageId = null;
        stateMediaSosial.create.form.icon = sosmedMap[selectedSosmed].src!;


        await stateMediaSosial.create.create();
        resetForm();
        router.push('/admin/landing-page/profil/media-sosial');
        return;
      }

      // ──────────────── ⭐ CASE 2: CUSTOM ICON → WAJIB UPLOAD ────────────────
      if (!file) {
        toast.warn('Silakan upload icon custom terlebih dahulu');
        return;
      }

      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });

      const uploaded = res.data?.data;

      if (!uploaded?.id) {
        toast.error('Gagal mengunggah icon custom');
        return;
      }

      stateMediaSosial.create.form.imageId = uploaded.id;
      stateMediaSosial.create.form.icon = null;

      await stateMediaSosial.create.create();

      resetForm();
      router.push('/admin/landing-page/profil/media-sosial');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menambahkan media sosial');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Media Sosial
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
          {/* Select Sosmed */}
          <SelectSosialMedia value={selectedSosmed} onChange={setSelectedSosmed} />

          {/* Custom icon uploader */}
          {selectedSosmed === 'custom' && (
            <Box>
              <Text fw="bold" fz="sm" mb={6}>
                Upload Custom Icon
              </Text>

              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile));
                  }
                }}
                onReject={() => toast.error('File tidak valid')}
                maxSize={5 * 1024 ** 2}
                accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
                radius="md"
                p="xl"
              >
                <Group justify="center" gap="xl" mih={180}>
                  <Dropzone.Accept>
                    <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={48} color="red" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={48} color="#868e96" stroke={1.5} />
                  </Dropzone.Idle>

                  <Stack align="center" gap="xs">
                    <Text fw={500}>Seret gambar atau klik untuk pilih</Text>
                    <Text size="sm" c="dimmed">
                      Maksimal 5MB, format .png, .jpg, .jpeg, webp
                    </Text>
                  </Stack>
                </Group>
              </Dropzone>

              {previewImage && (
                <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                  <Image
                    src={previewImage}
                    alt="Preview"
                    radius="md"
                    style={{
                      maxHeight: 200,
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                    }}
                  />

                  <ActionIcon
                    variant="filled"
                    color="red"
                    radius="xl"
                    size="sm"
                    pos="absolute"
                    top={5}
                    right={5}
                    onClick={() => {
                      setFile(null);
                      setPreviewImage(null);
                    }}
                    style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              )}
            </Box>
          )}

          {/* Input name */}
          <TextInput
            label="Nama Media Sosial"
            placeholder="Masukkan nama media sosial"
            value={stateMediaSosial.create.form.name ?? ''}
            onChange={(e) => (stateMediaSosial.create.form.name = e.target.value)}
            required
          />

          {/* Input link */}
          <TextInput
            label="Link / Kontak"
            placeholder="Masukkan link atau nomor"
            value={stateMediaSosial.create.form.iconUrl ?? ''}
            onChange={(e) => (stateMediaSosial.create.form.iconUrl = e.target.value)}
            required
          />

          {/* Actions */}
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={resetForm}>
              Reset
            </Button>
            <Button
              radius="md"
              onClick={handleSubmit}
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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
