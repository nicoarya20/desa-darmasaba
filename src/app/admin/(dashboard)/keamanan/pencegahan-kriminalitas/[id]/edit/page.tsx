/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import pencegahanKriminalitasState from '@/app/admin/(dashboard)/_state/keamanan/pencegahan-kriminalitas';
import { convertYoutubeUrlToEmbed } from '@/app/admin/(dashboard)/desa/gallery/lib/youtube-utils';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPencegahanKriminalitas() {
  const router = useRouter();
  const params = useParams();
  const kriminalitasState = useProxy(pencegahanKriminalitasState);

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    deskripsiSingkat: '',
    linkVideo: '',
  });

  // load data hanya sekali pas id berubah
  useEffect(() => {
    const loadKriminalitas = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kriminalitasState.update.load(id);
        if (data) {
          setFormData({
            judul: data.judul ?? '',
            deskripsi: data.deskripsi ?? '',
            deskripsiSingkat: data.deskripsiSingkat ?? '',
            linkVideo: data.linkVideo ?? '',
          });
        }
      } catch (error) {
        console.error('Error loading pencegahan kriminalitas:', error);
        toast.error('Gagal memuat data pencegahan kriminalitas');
      }
    };

    loadKriminalitas();
  }, [params?.id]);

  const embedLink = convertYoutubeUrlToEmbed(formData.linkVideo);

  const handleChange =
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleSubmit = async () => {
    const converted = convertYoutubeUrlToEmbed(formData.linkVideo);
    if (!converted) {
      toast.error('Link YouTube tidak valid. Pastikan formatnya benar.');
      return;
    }

    try {
      // update global state saat submit
      kriminalitasState.update.form = {
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        deskripsiSingkat: formData.deskripsiSingkat,
        linkVideo: formData.linkVideo,
      };
      kriminalitasState.update.id = params?.id as string;

      await kriminalitasState.update.update();
      toast.success('Pencegahan Kriminalitas berhasil diperbarui!');
      router.push('/admin/keamanan/pencegahan-kriminalitas');
    } catch (error) {
      console.error('Error updating pencegahan kriminalitas:', error);
      toast.error('Terjadi kesalahan saat memperbarui data');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Back button + Title */}
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
          Edit Pencegahan Kriminalitas
        </Title>
      </Group>

      {/* Form container */}
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
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={handleChange('judul')}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsiSingkat}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, deskripsiSingkat: val }))
              }
            />
          </Box>

          <Box>
            <Title order={6} fw="bold" fz="sm" mb={6}>
              Deskripsi Lengkap
            </Title>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, deskripsi: val }))
              }
            />
          </Box>

          <Box>
            <TextInput
              label="Link Video YouTube"
              placeholder="https://www.youtube.com/watch?v=abc123"
              value={formData.linkVideo}
              onChange={handleChange('linkVideo')}
              required
            />
            {embedLink && (
              <Box
                mt="sm"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
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

          {/* Action button */}
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

export default EditPencegahanKriminalitas;
