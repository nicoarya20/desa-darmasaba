'use client'

import stateKonservasiAdatBali from '@/app/admin/(dashboard)/_state/lingkungan/konservasi-adat-bali';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const KonservasiAdatBaliTextEditor = dynamic(
  () =>
    import('../../_lib/konservasiAdatBaliTextEditor').then(
      (mod) => mod.KonservasiAdatBaliTextEditor
    ),
  { ssr: false }
);

function EditFilosofiTriHitaKarana() {
  const router = useRouter();
  const filosofiTriHitaState = useProxy(stateKonservasiAdatBali.stateFilosofiTriHita);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state form
  const [formData, setFormData] = useState({ judul: '', content: '' });
  const [originalData, setOriginalData] = useState({
    judul: '',
    content: '',
  });

  // Load data dari global state kalau belum ada
  useShallowEffect(() => {
    if (!filosofiTriHitaState.findById.data) {
      filosofiTriHitaState.findById.initialize();
    }
  }, []);

  // Set formData dari global state saat data tersedia
  useEffect(() => {
    if (filosofiTriHitaState.findById.data) {
      setFormData({
        judul: filosofiTriHitaState.findById.data.judul ?? '',
        content: filosofiTriHitaState.findById.data.deskripsi ?? '',
      });
      setOriginalData({
        judul: filosofiTriHitaState.findById.data.judul ?? '',
        content: filosofiTriHitaState.findById.data.deskripsi ?? '',
      });
    }
  }, [filosofiTriHitaState.findById.data]);

  const handleChange = (field: 'judul' | 'content', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      content: originalData.content,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = () => {
    try {
      setIsSubmitting(true);
      if (filosofiTriHitaState.findById.data) {
        filosofiTriHitaState.findById.data.judul = formData.judul;
        filosofiTriHitaState.findById.data.deskripsi = formData.content;
        filosofiTriHitaState.update.save(filosofiTriHitaState.findById.data);
      }
      router.push('/admin/lingkungan/konservasi-adat-bali/filosofi-tri-hita-karana');
    } catch (error) {
      console.error("Error updating filosofi tri hita karana:", error);
      toast.error("Terjadi kesalahan saat memperbarui filosofi tri hita karana");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Filosofi Tri Hita Karana
        </Title>
      </Group>

      {/* Form Paper */}
      <Paper
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        w={{ base: '100%', md: '50%' }}
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <Box>
            <Text fw="bold" mb={6}>
              Judul
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={(val) => handleChange('judul', val)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Deskripsi
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={(val) => handleChange('content', val)}
              initialContent={formData.content}
            />
          </Box>

          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
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

export default EditFilosofiTriHitaKarana;
