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
  NumberInput,
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
import { parseSektorValueInput, PERIODE_MAX_LENGTH, SATUAN_MAX_LENGTH } from '@/lib/sektor-unggulan';

function EditSektorUnggulanDesa() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateGrafik = useProxy(grafikSektorUnggulan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id;

  // state lokal buat form
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    value: number | null;
    satuan: string;
    periode: string;
  }>({
    name: '',
    description: '',
    value: null,
    satuan: '',
    periode: '',
  });

  // Teks mentah NumberInput (mis. "1.") — dipisah dari formData.value agar desimal bisa diketik
  const [valueInput, setValueInput] = useState<number | string>('');

  const [originalData, setOriginalData] = useState<typeof formData>({
    name: '',
    description: '',
    value: null,
    satuan: '',
    periode: '',
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
      !isHtmlEmpty(formData.description)
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
              value: data.value ?? null,
              satuan: data.satuan || '',
              periode: data.periode || '',
            });
            setValueInput(data.value ?? '');
            setOriginalData({
              name: data.name || '',
              description: data.description || '',
              value: data.value ?? null,
              satuan: data.satuan || '',
              periode: data.periode || '',
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
    (field: 'name' | 'satuan' | 'periode') =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.currentTarget.value }));
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
      satuan: originalData.satuan,
      periode: originalData.periode,
    });
    setValueInput(originalData.value ?? '');
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
          <NumberInput
            label="Jumlah"
            description="Opsional. Kosongkan bila sektor ini belum punya angka."
            placeholder="Masukkan jumlah"
            min={0}
            allowNegative={false}
            value={valueInput}
            onChange={(val) => {
              setValueInput(val);
              setFormData((prev) => ({ ...prev, value: parseSektorValueInput(val) }));
            }}
          />
          <TextInput
            label="Satuan"
            description='Opsional. Contoh: ton, kg, ha, ekor, %'
            placeholder="Masukkan satuan"
            maxLength={SATUAN_MAX_LENGTH}
            value={formData.satuan}
            onChange={handleChange('satuan')}
          />
          <TextInput
            label="Periode"
            description='Opsional. Contoh: 2025, Semester I 2026'
            placeholder="Masukkan periode"
            maxLength={PERIODE_MAX_LENGTH}
            value={formData.periode}
            onChange={handleChange('periode')}
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
