/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import grafikSektorUnggulan from '@/app/admin/(dashboard)/_state/ekonomi/sektor-unggulan-desa';
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
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditSektorUnggulanDesa() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateGrafik = useProxy(grafikSektorUnggulan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id;

  // state lokal buat form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: 0,
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    description: '',
    value: 0,
  });

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      !isHtmlEmpty(formData.description) &&
      formData.value !== null &&
      formData.value >= 0
    );
  };

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      stateGrafik.findUnique
        .load(id)
        .then(() => {
          const data = stateGrafik.findUnique.data;
          if (data) {
            setFormData({
              name: data.name || '',
              description: data.description || '',
              value: data.value || 0,
            });
            setOriginalData({
              name: data.name || '',
              description: data.description || '',
              value: data.value || 0,
            });
          }
        })
        .catch((err) => {
          console.error('Error load sektor unggulan:', err);
          toast.error('Gagal mengambil data sektor unggulan');
        });
    }
  }, [id]);

  const handleChange =
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === 'value' ? Number(e.currentTarget.value) : e.currentTarget.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
      };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateGrafik.update.id = id;
      stateGrafik.update.form = { ...formData }; // update global pas submit
      await stateGrafik.update.submit();
      toast.success('Sektor unggulan berhasil diperbarui!');
      router.push('/admin/ekonomi/sektor-unggulan-desa');
    } catch (error) {
      console.error('Error update sektor unggulan:', error);
      toast.error('Terjadi kesalahan saat memperbarui sektor unggulan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      description: originalData.description,
      value: originalData.value,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={22} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Sektor Unggulan Desa
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
            label="Nama Sektor Unggulan"
            placeholder="Masukkan nama sektor unggulan"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />
          <Box>
            <Text fz="sm" fw="bold">
              Konten
            </Text>
            <EditEditor
              value={formData.description}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, description: htmlContent }))
              }
            />
          </Box>
          <TextInput
            label="Jumlah"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.value}
            onChange={handleChange('value')}
            required
          />

          <Group justify="right">
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

export default EditSektorUnggulanDesa;
