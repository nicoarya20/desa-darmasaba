/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
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
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import grafikSektorUnggulan from '../../../_state/ekonomi/sektor-unggulan-desa';
import { toast } from 'react-toastify';

function CreateSektorUnggulanDesa() {
  const stateGrafik = useProxy(grafikSektorUnggulan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
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
      stateGrafik.create.form.name?.trim() !== '' &&
      !isHtmlEmpty(stateGrafik.create.form.description) &&
      stateGrafik.create.form.value !== null &&
      stateGrafik.create.form.value >= 0
    );
  };

  const resetForm = () => {
    stateGrafik.create.form = {
      name: '',
      description: '',
      value: 0,
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const id = await stateGrafik.create.create();
      if (id) {
        const idStr = String(id);
        await stateGrafik.findUnique.load(idStr);
        if (stateGrafik.findUnique.data) {
          setChartData([stateGrafik.findUnique.data]);
        }
      }
      resetForm();
      router.push('/admin/ekonomi/sektor-unggulan-desa');
    } catch (error) {
      console.error('Error creating sektor unggulan:', error);
      toast.error('Terjadi kesalahan saat menambahkan sektor unggulan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan back button */}
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
          Tambah Sektor Unggulan Desa
        </Title>
      </Group>

      {/* Form */}
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
            value={stateGrafik.create.form.name}
            onChange={(e) => {
              stateGrafik.create.form.name = e.currentTarget.value;
            }}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Sektor Unggulan
            </Text>
            <CreateEditor
              value={stateGrafik.create.form.description}
              onChange={(val) => {
                stateGrafik.create.form.description = val;
              }}
            />
          </Box>

          <TextInput
            label="Jumlah"
            type="number"
            placeholder="Masukkan jumlah"
            value={stateGrafik.create.form.value}
            onChange={(e) => {
              stateGrafik.create.form.value = Number(e.currentTarget.value);
            }}
            required
          />

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

export default CreateSektorUnggulanDesa;
