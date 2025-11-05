/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { convertYoutubeUrlToEmbed } from '../../../lib/youtube-utils';

function EditVideo() {
  const router = useRouter();
  const videoState = useProxy(stateGallery.video);
  const params = useParams();

  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    linkVideo: '',
  });

  // load data video sekali saat id ada
  useEffect(() => {
    const loadVideo = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await videoState.update.load(id);
        if (data) {
          setFormData({
            name: data.name ?? '',
            deskripsi: data.deskripsi ?? '',
            linkVideo: data.linkVideo ?? '',
          });
        }
      } catch (error) {
        console.error('Error loading video:', error);
        toast.error('Gagal memuat data video');
      }
    };

    loadVideo();
  }, [params?.id]);

  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    const converted = convertYoutubeUrlToEmbed(formData.linkVideo);
    if (!converted) {
      toast.error("Link YouTube tidak valid. Pastikan formatnya benar.");
      return;
    }

    try {
      videoState.update.form = {
        name: formData.name,
        deskripsi: formData.deskripsi,
        linkVideo: formData.linkVideo,
      };
      await videoState.update.update();
      toast.success('Video berhasil diperbarui!');
      router.push('/admin/desa/gallery/video');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Terjadi kesalahan saat memperbarui video');
    }
  };

  const embedLink = convertYoutubeUrlToEmbed(formData.linkVideo);

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit Video
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
            label="Judul Video"
            placeholder="Masukkan judul video"
            value={formData.name}
            onChange={(e) => handleChange('name', e.currentTarget.value)}
            required
          />

          <Box>
            <TextInput
              label="Link Video YouTube"
              placeholder="https://www.youtube.com/watch?v=abc123"
              value={formData.linkVideo}
              onChange={(e) => handleChange('linkVideo', e.currentTarget.value)}
              required
            />
            {embedLink && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <iframe
                  className="rounded"
                  width="100%"
                  height="220"
                  src={embedLink}
                  title="Preview Video"
                  allowFullScreen
                ></iframe>
              </Box>
            )}
          </Box>

          <Box>
            <Title order={6} fw="bold" fz="sm" mb={6}>
              Deskripsi Video
            </Title>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => handleChange('deskripsi', val)}
            />
          </Box>

          <Group justify="right">
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
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditVideo;
