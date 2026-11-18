/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  NumberInput,
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
import { parseSektorValueInput, PERIODE_MAX_LENGTH, SATUAN_MAX_LENGTH } from '@/lib/sektor-unggulan';

function CreateSektorUnggulanDesa() {
  const stateGrafik = useProxy(grafikSektorUnggulan, { sync: true }); // sync: cegah caret jump di controlled input
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Teks mentah NumberInput (mis. "1.") — dipisah dari form.value agar desimal bisa diketik
  const [valueInput, setValueInput] = useState<number | string>(stateGrafik.create.form.value ?? '');

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
      !isHtmlEmpty(stateGrafik.create.form.description)
    );
  };

  const resetForm = () => {
    stateGrafik.create.form = {
      name: '',
      description: '',
      value: null,
      satuan: '',
      periode: '',
    };
    setValueInput('');
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

          <NumberInput
            label="Jumlah"
            description="Opsional. Kosongkan bila sektor ini belum punya angka."
            placeholder="Masukkan jumlah"
            min={0}
            allowNegative={false}
            value={valueInput}
            onChange={(val) => {
              setValueInput(val);
              stateGrafik.create.form.value = parseSektorValueInput(val);
            }}
          />

          <TextInput
            label="Satuan"
            description='Opsional. Contoh: ton, kg, ha, ekor, %'
            placeholder="Masukkan satuan"
            maxLength={SATUAN_MAX_LENGTH}
            value={stateGrafik.create.form.satuan ?? ''}
            onChange={(e) => {
              stateGrafik.create.form.satuan = e.currentTarget.value;
            }}
          />

          <TextInput
            label="Periode"
            description='Opsional. Contoh: 2025, Semester I 2026'
            placeholder="Masukkan periode"
            maxLength={PERIODE_MAX_LENGTH}
            value={stateGrafik.create.form.periode ?? ''}
            onChange={(e) => {
              stateGrafik.create.form.periode = e.currentTarget.value;
            }}
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
