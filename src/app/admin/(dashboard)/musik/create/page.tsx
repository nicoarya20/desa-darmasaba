'use client'
import CreateEditor from '../../_com/createEditor';
import stateDashboardMusik from '../../_state/desa/musik';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Card,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
  ActionIcon,
  NumberInput
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconPhoto, IconUpload, IconX, IconMusic } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export default function CreateMusik() {
  const musikState = useProxy(stateDashboardMusik);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isExtractingDuration, setIsExtractingDuration] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mendapatkan durasi dari file audio
  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        URL.revokeObjectURL(url);
        resolve(formatted);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve('0:00');
      });
      
      audio.src = url;
    });
  };

  const isFormValid = () => {
    return (
      musikState.musik.create.form.judul?.trim() !== '' &&
      musikState.musik.create.form.artis?.trim() !== '' &&
      musikState.musik.create.form.durasi?.trim() !== '' &&
      audioFile !== null &&
      coverFile !== null
    );
  };

  useShallowEffect(() => {
    return () => {
      musikState.musik.create.resetForm();
    };
  }, []);

  const resetForm = () => {
    musikState.musik.create.form = {
      judul: '',
      artis: '',
      deskripsi: '',
      durasi: '',
      audioFileId: '',
      coverImageId: '',
      genre: '',
      tahunRilis: undefined,
    };
    setPreviewCover(null);
    setCoverFile(null);
    setPreviewAudio(null);
    setAudioFile(null);
  };

  const handleSubmit = async () => {
    if (!musikState.musik.create.form.judul?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    if (!musikState.musik.create.form.artis?.trim()) {
      toast.error('Artis wajib diisi');
      return;
    }

    if (!musikState.musik.create.form.durasi?.trim()) {
      toast.error('Durasi wajib diisi');
      return;
    }

    if (!coverFile) {
      toast.error('Cover image wajib dipilih');
      return;
    }

    if (!audioFile) {
      toast.error('File audio wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload cover image
      const coverRes = await ApiFetch.api.fileStorage.create.post({
        file: coverFile,
        name: coverFile.name,
      });

      const coverUploaded = coverRes.data?.data;
      if (!coverUploaded?.id) {
        return toast.error('Gagal mengunggah cover, silakan coba lagi');
      }

      musikState.musik.create.form.coverImageId = coverUploaded.id;

      // Upload audio file
      const audioRes = await ApiFetch.api.fileStorage.create.post({
        file: audioFile,
        name: audioFile.name,
      });

      const audioUploaded = audioRes.data?.data;
      if (!audioUploaded?.id) {
        return toast.error('Gagal mengunggah audio, silakan coba lagi');
      }

      musikState.musik.create.form.audioFileId = audioUploaded.id;

      await musikState.musik.create.create();

      resetForm();
      router.push('/admin/musik');
    } catch (error) {
      console.error('Error creating musik:', error);
      toast.error('Terjadi kesalahan saat membuat musik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan tombol kembali */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Musik
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
          <TextInput
            label="Judul"
            placeholder="Masukkan judul lagu"
            value={musikState.musik.create.form.judul}
            onChange={(e) => (musikState.musik.create.form.judul = e.target.value)}
            required
          />

          <TextInput
            label="Artis"
            placeholder="Masukkan nama artis"
            value={musikState.musik.create.form.artis}
            onChange={(e) => (musikState.musik.create.form.artis = e.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={musikState.musik.create.form.deskripsi}
              onChange={(htmlContent) => {
                musikState.musik.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <Group gap="md">
            <TextInput
              label="Durasi"
              placeholder="Contoh: 3:45"
              value={musikState.musik.create.form.durasi}
              onChange={(e) => (musikState.musik.create.form.durasi = e.target.value)}
              required
              style={{ flex: 1 }}
            />

            <TextInput
              label="Genre"
              placeholder="Contoh: Pop, Rock, Jazz"
              value={musikState.musik.create.form.genre}
              onChange={(e) => (musikState.musik.create.form.genre = e.target.value)}
              style={{ flex: 1 }}
            />
          </Group>

          <NumberInput
            label="Tahun Rilis"
            placeholder="Contoh: 2024"
            value={musikState.musik.create.form.tahunRilis}
            onChange={(val) => (musikState.musik.create.form.tahunRilis = val as number | undefined)}
            min={1900}
            max={new Date().getFullYear() + 1}
          />

          {/* Cover Image */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Cover Image
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setCoverFile(selectedFile);
                  setPreviewCover(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="sm" color="dimmed">
                Seret gambar atau klik untuk memilih file (maks 5MB)
              </Text>
            </Dropzone>

            {previewCover && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewCover}
                  alt="Preview Cover"
                  radius="md"
                  style={{
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                  }}
                  loading="lazy"
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
                    setPreviewCover(null);
                    setCoverFile(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          {/* Audio File */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              File Audio
            </Text>
            <Dropzone
              onDrop={async (files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setAudioFile(selectedFile);
                  setPreviewAudio(selectedFile.name);
                  
                  // Extract durasi otomatis dari audio
                  setIsExtractingDuration(true);
                  try {
                    const duration = await getAudioDuration(selectedFile);
                    musikState.musik.create.form.durasi = duration;
                    toast.success(`Durasi audio terdeteksi: ${duration}`);
                  } catch (error) {
                    console.error('Error extracting audio duration:', error);
                    toast.error('Gagal mendeteksi durasi audio, silakan isi manual');
                  } finally {
                    setIsExtractingDuration(false);
                  }
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format audio (MP3, WAV, OGG)')}
              maxSize={50 * 1024 ** 2}
              accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconMusic size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="sm" color="dimmed">
                Seret file audio atau klik untuk memilih file (maks 50MB)
              </Text>
            </Dropzone>

            {previewAudio && (
              <Box mt="sm">
                <Card p="sm" withBorder>
                  <Group gap="sm">
                    <IconMusic size={20} color={colors['blue-button']} />
                    <Text fz="sm" truncate style={{ flex: 1 }}>
                      {previewAudio}
                    </Text>
                    {isExtractingDuration && (
                      <Text fz="xs" c="blue">
                        Mendeteksi durasi...
                      </Text>
                    )}
                    <ActionIcon
                      variant="filled"
                      color="red"
                      radius="xl"
                      size="sm"
                      onClick={() => {
                        setPreviewAudio(null);
                        setAudioFile(null);
                      }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Box>
            )}
          </Box>

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
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
