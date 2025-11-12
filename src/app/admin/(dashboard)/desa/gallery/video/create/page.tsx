'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Loader
} from '@mantine/core';
import { IconArrowBack, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { convertYoutubeUrlToEmbed } from '../../lib/youtube-utils';

function CreateVideo() {
  const videoState = useProxy(stateGallery.video);
  const router = useRouter();
  const [link, setLink] = useState('');
  const embedLink = convertYoutubeUrlToEmbed(link);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    videoState.create.form = {
      name: '',
      deskripsi: '',
      linkVideo: '',
    };
    setLink('');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!embedLink) {
        toast.error('Link YouTube tidak valid. Pastikan formatnya benar.');
        return;
      }

      videoState.create.form.linkVideo = embedLink;
      await videoState.create.create();
      resetForm();
      router.push('/admin/desa/gallery/video');
    } catch (error) {
      console.error("Error creating video:", error);
      toast.error("Terjadi kesalahan saat menambahkan video");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header Back Button + Title */}
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
          Tambah Video
        </Title>
      </Group>

      {/* Card Form */}
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
            label="Judul Video"
            placeholder="Masukkan judul video"
            value={videoState.create.form.name}
            onChange={(e) => {
              videoState.create.form.name = e.currentTarget.value;
            }}
            required
          />

          {/* Link YouTube */}
          <TextInput
            label="Link Video YouTube"
            placeholder="https://www.youtube.com/watch?v=abc123"
            value={link}
            onChange={(e) => setLink(e.currentTarget.value)}
            required
          />

          {/* Preview Video */}
          {embedLink && (
            <Box mt="sm" pos="relative">
              <iframe
                style={{
                  borderRadius: 10,
                  width: '100%',
                  height: 400,
                  border: '1px solid #ddd',
                }}
                src={embedLink}
                title="Preview Video"
                allowFullScreen
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
                  setLink('');
                }}
                style={{
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                <IconX size={14} />
              </ActionIcon>
            </Box>
          )}

          {/* Deskripsi */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Video
            </Text>
            <CreateEditor
              value={videoState.create.form.deskripsi}
              onChange={(val) => {
                videoState.create.form.deskripsi = val;
              }}
            />
          </Box>

          {/* Button Submit */}
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

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
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

export default CreateVideo;
