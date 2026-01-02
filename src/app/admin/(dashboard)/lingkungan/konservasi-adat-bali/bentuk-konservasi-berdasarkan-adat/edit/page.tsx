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

function EditBentukKonservasiBerdasarkanAdat() {
  const router = useRouter();
  const bentukKonservasiState = useProxy(stateKonservasiAdatBali.stateBentukKonservasiBerdasarkanAdat);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gabung semua field form jadi satu object
  const [formData, setFormData] = useState({ judul: '', deskripsi: '' });
  const [originalData, setOriginalData] = useState({
    judul: '',
    deskripsi: '',
  });

  // Initialize data dari global state
  useShallowEffect(() => {
    if (!bentukKonservasiState.findById.data) {
      bentukKonservasiState.findById.initialize();
    }
  }, []);

  useEffect(() => {
    if (bentukKonservasiState.findById.data) {
      setFormData({
        judul: bentukKonservasiState.findById.data.judul ?? '',
        deskripsi: bentukKonservasiState.findById.data.deskripsi ?? '',
      });
      setOriginalData({
        judul: bentukKonservasiState.findById.data.judul ?? '',
        deskripsi: bentukKonservasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [bentukKonservasiState.findById.data]);

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
      if (bentukKonservasiState.findById.data) {
        // Update global state cuma pas submit
        const updatedData = { ...bentukKonservasiState.findById.data, ...formData };
        bentukKonservasiState.update.save(updatedData);
      }
      router.push('/admin/lingkungan/konservasi-adat-bali/bentuk-konservasi-berdasarkan-adat');
    } catch (error) {
      console.error("Error updating bentuk konservasi berdasarkan adat:", error);
      toast.error("Terjadi kesalahan saat memperbarui bentuk konservasi berdasarkan adat");
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
          Edit Bentuk Konservasi Berdasarkan Adat
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
              onChange={(value: string) => handleChange('judul', value)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Deskripsi
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={(value: string) => handleChange('deskripsi', value)}
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

export default EditBentukKonservasiBerdasarkanAdat;
