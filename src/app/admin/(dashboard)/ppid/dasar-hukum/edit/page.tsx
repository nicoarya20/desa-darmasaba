'use client';
import colors from '@/con/colors';
import { Loader, Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../../_state/ppid/dasar_hukum/dasarHukum';
import { toast } from 'react-toastify';

const PPIDTextEditor = dynamic(
  () => import('../../_com/PPIDTextEditor').then(mod => mod.PPIDTextEditor),
  { ssr: false }
);

function EditDasarHukum() {
  const router = useRouter();
  const dasarHukumState = useProxy(stateDasarHukumPPID);

  // Gabungkan judul & content jadi satu state lokal
  const [formData, setFormData] = useState({ judul: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState({
    judul: '',
    content: '',
  });

  // Helper function to check if rich text content is empty
  const isRichTextEmpty = (content: string) => {
    // Remove HTML tags and check if the resulting text is empty
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText === '' || content.trim() === '<p></p>' || content.trim() === '<p><br></p>';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      !isRichTextEmpty(formData.judul) &&
      !isRichTextEmpty(formData.content)
    );
  };

  // Load data awal sekali
  useShallowEffect(() => {
    if (!dasarHukumState.findById.data) {
      dasarHukumState.findById.initialize();
    }
  }, []);

  // Set state lokal saat data global sudah tersedia
  useEffect(() => {
    if (dasarHukumState.findById.data) {
      setFormData({
        judul: dasarHukumState.findById.data.judul ?? '',
        content: dasarHukumState.findById.data.content ?? '',
      });
      setOriginalData({
        judul: dasarHukumState.findById.data.judul ?? '',
        content: dasarHukumState.findById.data.content ?? '',
      });
    }
  }, [dasarHukumState.findById.data]);

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
      if (dasarHukumState.findById.data) {
        // Update global state hanya saat submit
        const updated = { ...dasarHukumState.findById.data, ...formData };
        dasarHukumState.update.save(updated);
      }
      router.push('/admin/ppid/dasar-hukum');
    } catch (error) {
      console.error("Error updating dasar hukum:", error);
      toast.error("Terjadi kesalahan saat memperbarui dasar hukum");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Dasar Hukum PPID
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
        <Stack gap="xl">
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Judul
            </Text>
            <Box style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
              <PPIDTextEditor
                showSubmit={false}
                initialContent={formData.judul}
                onChange={value => setFormData(prev => ({ ...prev, judul: value }))}
              />
            </Box>
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Konten
            </Text>
            <Box style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
              <PPIDTextEditor
                showSubmit={false}
                initialContent={formData.content}
                onChange={value => setFormData(prev => ({ ...prev, content: value }))}
              />
            </Box>
          </Box>

         {/* ======= Tombol Aksi ======= */}
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

export default EditDasarHukum;
