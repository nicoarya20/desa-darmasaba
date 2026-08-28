/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormDaftarInformasi {
  jenisInformasi: string;
  deskripsi: string;
  tanggal: string;
}

function EditDaftarInformasiPublik() {
  const daftarInformasi = useProxy(daftarInformasiPublik);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<FormDaftarInformasi>({
    jenisInformasi: '',
    deskripsi: '',
    tanggal: '',
  });

  // Simpan data original untuk tombol Batal
  const [originalData, setOriginalData] = useState<FormDaftarInformasi>({
    jenisInformasi: '',
    deskripsi: '',
    tanggal: '',
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.jenisInformasi?.trim() !== '' &&
      formData.deskripsi?.trim() !== '' &&
      formData.tanggal?.trim() !== ''
    );
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Load data once on mount / when ID changes
  useEffect(() => {
    const loadDaftarInformasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await daftarInformasi.edit.load(id);
        if (data) {
          const loaded: FormDaftarInformasi = {
            jenisInformasi: data.jenisInformasi || '',
            deskripsi: data.deskripsi || '',
            tanggal: data.tanggal || '',
          };
          setFormData(loaded);
          setOriginalData(loaded);
        }
      } catch (error) {
        console.error('Error loading daftar informasi:', error);
        toast.error('Gagal memuat data daftar informasi');
      }
    };

    loadDaftarInformasi();
  }, [params?.id]);

  const handleChange = (field: keyof FormDaftarInformasi, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Tombol Batal → balikin ke data original
  const handleResetForm = () => {
    setFormData(originalData);
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      daftarInformasi.edit.form = {
        ...daftarInformasi.edit.form,
        jenisInformasi: formData.jenisInformasi.trim(),
        deskripsi: formData.deskripsi.trim(),
        tanggal: formData.tanggal.trim(),
      };
      await daftarInformasi.edit.update();
      router.push('/admin/ppid/daftar-informasi-publik');
    } catch (error) {
      console.error('Error updating daftar informasi:', error);
      toast.error('Terjadi kesalahan saat memperbarui daftar informasi');
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Daftar Informasi Publik
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
          <TextInput
            label="Jenis Informasi"
            placeholder="Masukkan jenis informasi"
            value={formData.jenisInformasi}
            onChange={(e) => handleChange('jenisInformasi', e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => handleChange('deskripsi', htmlContent)}
            />
          </Box>

          <TextInput
            type="date"
            label="Tanggal Publikasi"
            placeholder="Pilih tanggal publikasi"
            value={formatDateForInput(formData.tanggal)}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            required
          />

          <Group justify="right" mt="md">
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

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              radius="md"
              size="md"
              style={{
                background: !isFormValid()
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditDaftarInformasiPublik;
