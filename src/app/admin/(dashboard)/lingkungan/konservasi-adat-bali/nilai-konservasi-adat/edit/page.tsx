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
  () => import('../../_lib/konservasiAdatBaliTextEditor').then(mod => mod.KonservasiAdatBaliTextEditor),
  { ssr: false }
);

function EditNilaiKonservasiAdat() {
  const router = useRouter();
  const nilaiKonservasiState = useProxy(stateKonservasiAdatBali.stateNilaiKonservasiAdat);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // state lokal untuk form
  const [formData, setFormData] = useState({ judul: '', deskripsi: '' });
  const [originalData, setOriginalData] = useState({ judul: '', deskripsi: '' });

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      !isHtmlEmpty(formData.judul) &&
      !isHtmlEmpty(formData.deskripsi)
    );
  };

  // load data awal
  useShallowEffect(() => {
    if (!nilaiKonservasiState.findById.data) {
      nilaiKonservasiState.findById.initialize();
    }
  }, []);

  // sync state lokal saat data backend siap
  useEffect(() => {
    if (nilaiKonservasiState.findById.data) {
      setFormData({
        judul: nilaiKonservasiState.findById.data.judul ?? '',
        deskripsi: nilaiKonservasiState.findById.data.deskripsi ?? '',
      });
      setOriginalData({
        judul: nilaiKonservasiState.findById.data.judul ?? '',
        deskripsi: nilaiKonservasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [nilaiKonservasiState.findById.data]);

  const handleChange = (field: 'judul' | 'deskripsi', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = () => {
    try {
      setIsSubmitting(true);
      if (nilaiKonservasiState.findById.data) {
        // update global state saat submit
        nilaiKonservasiState.findById.data.judul = formData.judul;
        nilaiKonservasiState.findById.data.deskripsi = formData.deskripsi;
        nilaiKonservasiState.update.save(nilaiKonservasiState.findById.data);
      }
      router.push('/admin/lingkungan/konservasi-adat-bali/nilai-konservasi-adat');
    } catch (error) {
      console.error("Error updating nilai konservasi adat:", error);
      toast.error("Terjadi kesalahan saat memperbarui nilai konservasi adat");
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
          Edit Nilai Konservasi Adat
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
              onChange={val => handleChange('judul', val)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Deskripsi
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={val => handleChange('deskripsi', val)}
              initialContent={formData.deskripsi}
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

export default EditNilaiKonservasiAdat;
