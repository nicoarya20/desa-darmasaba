'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateKesejahteraanMasyarakat from '@/app/admin/(dashboard)/_state/ekonomi/kesejahteraan-masyarakat';
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
  ActionIcon,
  Grid,
  Card,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX, IconVideo, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { convertYoutubeUrlToEmbed } from '@/app/admin/(dashboard)/pemerintahan/gallery/lib/youtube-utils';

export default function CreateKesejahteraan() {
  const state = useProxy(stateKesejahteraanMasyarakat, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();

  // Featured image state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Gallery images state
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // YouTube link state
  const [youtubeLink, setYoutubeLink] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHtmlEmpty = (html: string) => {
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  const isFormValid = () => {
    return (
      state.kesejahteraan.create.form.judul?.trim() !== '' &&
      !isHtmlEmpty(state.kesejahteraan.create.form.deskripsi) &&
      file !== null &&
      !isHtmlEmpty(state.kesejahteraan.create.form.content)
    );
  };

  const resetForm = () => {
    state.kesejahteraan.create.form = {
      judul: '',
      deskripsi: '',
      imageId: '',
      content: '',
      imageIds: [],
      linkVideo: '',
    };
    setPreviewImage(null);
    setFile(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setYoutubeLink('');
  };

  const handleGalleryDrop = (files: File[]) => {
    const newFiles = files.filter(
      (_, index) => galleryFiles.length + index < 10 // Max 10 images
    );

    if (newFiles.length === 0) {
      toast.warn('Maksimal 10 gambar untuk galeri');
      return;
    }

    setGalleryFiles([...galleryFiles, ...newFiles]);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!state.kesejahteraan.create.form.judul?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    if (isHtmlEmpty(state.kesejahteraan.create.form.deskripsi)) {
      toast.error('Deskripsi singkat wajib diisi');
      return;
    }

    if (!file) {
      toast.error('Gambar utama wajib dipilih');
      return;
    }

    if (isHtmlEmpty(state.kesejahteraan.create.form.content)) {
      toast.error('Konten wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload featured image
      const featuredRes = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });
      const featuredUploaded = featuredRes.data?.data;
      if (!featuredUploaded?.id) {
        return toast.error('Gagal mengunggah gambar utama');
      }
      state.kesejahteraan.create.form.imageId = featuredUploaded.id;

      // Upload gallery images
      const galleryIds: string[] = [];
      for (const galleryFile of galleryFiles) {
        const galleryRes = await ApiFetch.api.fileStorage.create.post({
          file: galleryFile,
          name: galleryFile.name,
        });
        const galleryUploaded = galleryRes.data?.data;
        if (galleryUploaded?.id) {
          galleryIds.push(galleryUploaded.id);
        }
      }
      state.kesejahteraan.create.form.imageIds = galleryIds;

      // Set YouTube link if provided
      const embedLink = convertYoutubeUrlToEmbed(youtubeLink);
      if (embedLink) {
        state.kesejahteraan.create.form.linkVideo = embedLink;
      }

      await state.kesejahteraan.create.create();

      resetForm();
      router.push('/admin/ekonomi/kesejahteraan-masyarakat');
    } catch (error) {
      console.error('Error creating kesejahteraan:', error);
      toast.error('Terjadi kesalahan saat membuat program kesejahteraan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const embedLink = convertYoutubeUrlToEmbed(youtubeLink);

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Program Kesejahteraan
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
          {/* Judul */}
          <TextInput
            label="Judul"
            placeholder="Masukkan judul program kesejahteraan"
            value={state.kesejahteraan.create.form.judul}
            onChange={(e) => (state.kesejahteraan.create.form.judul = e.target.value)}
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi Singkat
            </Text>
            <CreateEditor
              value={state.kesejahteraan.create.form.deskripsi}
              onChange={(htmlContent) => {
                state.kesejahteraan.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          {/* Featured Image */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Utama (Featured)
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
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
              <Text ta="center" mt="sm" size="sm" c="dimmed">
                Seret gambar atau klik untuk memilih file (maks 5MB)
              </Text>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar Utama"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
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
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          {/* Gallery Images */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Galeri Dokumentasi (Opsional - Maksimal 10)
            </Text>
            <Dropzone
              onDrop={handleGalleryDrop}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="md"
              multiple
            >
              <Group justify="center" gap="xl" mih={120}>
                <Dropzone.Accept>
                  <IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="xs" c="dimmed">
                Seret gambar atau klik untuk menambahkan ke galeri
              </Text>
            </Dropzone>

            {galleryPreviews.length > 0 && (
              <Grid mt="sm" gap="sm">
                {galleryPreviews.map((preview, index) => (
                  <Grid.Col span={4} key={index}>
                    <Card p="xs" radius="md" withBorder>
                      <Image src={preview} alt={`Gallery ${index}`} radius="sm" height={100} fit="cover" />
                      <ActionIcon
                        variant="filled"
                        color="red"
                        radius="xl"
                        size="sm"
                        pos="absolute"
                        top={5}
                        right={5}
                        onClick={() => removeGalleryImage(index)}
                        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Box>

          {/* YouTube Video */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Link Video YouTube (Opsional)
            </Text>
            <TextInput
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.currentTarget.value)}
              leftSection={<IconVideo size={18} />}
              rightSection={
                youtubeLink && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => setYoutubeLink('')}
                  >
                    <IconX size={18} />
                  </ActionIcon>
                )
              }
            />
            {embedLink && (
              <Box mt="sm" pos="relative">
                <iframe
                  style={{
                    borderRadius: 10,
                    width: '100%',
                    height: 250,
                    border: '1px solid #ddd',
                  }}
                  src={embedLink}
                  title="Preview Video"
                  allowFullScreen
                />
              </Box>
            )}
          </Box>

          {/* Konten */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten
            </Text>
            <CreateEditor
              value={state.kesejahteraan.create.form.content}
              onChange={(htmlContent) => {
                state.kesejahteraan.create.form.content = htmlContent;
              }}
            />
          </Box>

          {/* Buttons */}
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
