'use client'

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
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
  const kriminalitasState = useProxy(pencegahanKriminalitasState, { sync: true }); // sync: cegah caret jump di controlled input
  const [link, setLink] = useState('');
  const embedLink = convertYoutubeUrlToEmbed(link);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      kriminalitasState.create.form.judul?.trim() !== '' &&
      !isHtmlEmpty(kriminalitasState.create.form.deskripsiSingkat) &&
      !isHtmlEmpty(kriminalitasState.create.form.deskripsi) &&
      embedLink !== ''
    );
  };

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
    try {
      setIsSubmitting(true);
      if (!embedLink) {
        toast.error('Link YouTube tidak valid. Pastikan formatnya benar.');
        return;
      }
  
      kriminalitasState.create.form.linkVideo = embedLink;
      await kriminalitasState.create.create();
      resetForm();
      router.push('/admin/keamanan/pencegahan-kriminalitas');
    } catch (error) {
      console.error('Gagal menambahkan pencegahan kriminalitas:', error);
      toast.error('Gagal menambahkan pencegahan kriminalitas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
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
            value={kriminalitasState.create.form.judul}
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
            value={link}
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

export default CreatePencegahanKriminalitas;
