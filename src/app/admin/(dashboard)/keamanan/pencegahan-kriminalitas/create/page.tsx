'use client'

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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import pencegahanKriminalitasState from '../../../_state/keamanan/pencegahan-kriminalitas';
import { convertYoutubeUrlToEmbed } from '../../../desa/gallery/lib/youtube-utils';

function CreatePencegahanKriminalitas() {
  const router = useRouter();
  const kriminalitasState = useProxy(pencegahanKriminalitasState);
  const [link, setLink] = useState('');
  const embedLink = convertYoutubeUrlToEmbed(link);

  const resetForm = () => {
    kriminalitasState.create.form = {
      judul: "",
      deskripsi: "",
      deskripsiSingkat: "",
      linkVideo: "",
    };
    setLink('');
  };

  const handleSubmit = async () => {
    if (!embedLink) {
      toast.error('Link YouTube tidak valid. Pastikan formatnya benar.');
      return;
    }

    kriminalitasState.create.form.linkVideo = embedLink;
    await kriminalitasState.create.create();
    resetForm();
    router.push('/admin/keamanan/pencegahan-kriminalitas');
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
          Tambah Pencegahan Kriminalitas
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
            label="Judul Pencegahan Kriminalitas"
            placeholder="Masukkan judul Pencegahan Kriminalitas"
            defaultValue={kriminalitasState.create.form.judul}
            onChange={(e) => {
              kriminalitasState.create.form.judul = e.currentTarget.value;
            }}
            required
          />

          {/* Deskripsi Singkat */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Singkat
            </Text>
            <CreateEditor
              value={kriminalitasState.create.form.deskripsiSingkat}
              onChange={(val) => {
                kriminalitasState.create.form.deskripsiSingkat = val;
              }}
            />
          </Box>

          {/* Deskripsi Panjang */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={kriminalitasState.create.form.deskripsi}
              onChange={(val) => {
                kriminalitasState.create.form.deskripsi = val;
              }}
            />
          </Box>

          {/* Link YouTube */}
          <TextInput
            label="Link Video YouTube"
            placeholder="https://www.youtube.com/watch?v=abc123"
            defaultValue={link}
            onChange={(e) => setLink(e.currentTarget.value)}
            required
          />

          {/* Preview Video */}
          {embedLink && (
            <Box mt="sm">
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
              ></iframe>
            </Box>
          )}

          {/* Button Submit */}
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

export default CreatePencegahanKriminalitas;
