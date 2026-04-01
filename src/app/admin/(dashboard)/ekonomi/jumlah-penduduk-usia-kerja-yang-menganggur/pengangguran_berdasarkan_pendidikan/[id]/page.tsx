/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditGrafikBerdasarkanPendidikan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan);
  const id = params.id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // state lokal untuk form
  const [formData, setFormData] = useState({
    SD: '',
    SMP: '',
    SMA: '',
    D3: '',
    S1: '',
  });

  const [originalData, setOriginalData] = useState({
    SD: '',
    SMP: '',
    SMA: '',
    D3: '',
    S1: '',
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.SD?.trim() !== '' &&
      formData.SMP?.trim() !== '' &&
      formData.SMA?.trim() !== '' &&
      formData.D3?.trim() !== '' &&
      formData.S1?.trim() !== ''
    );
  };

  useEffect(() => {
    if (id) {
      stategrafik.findUnique.load(id).then(() => {
        const data = stategrafik.findUnique.data;
        if (data) {
          setFormData({
            SD: data.SD || '',
            SMP: data.SMP || '',
            SMA: data.SMA || '',
            D3: data.D3 || '',
            S1: data.S1 || '',
          });
          setOriginalData({
            SD: data.SD || '',
            SMP: data.SMP || '',
            SMA: data.SMA || '',
            D3: data.D3 || '',
            S1: data.S1 || '',
          });
        }
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  

  const handleResetForm = () => {
    setFormData({
      SD: originalData.SD,
      SMP: originalData.SMP,
      SMA: originalData.SMA,
      D3: originalData.D3,
      S1: originalData.S1,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stategrafik.update.id = id;
      stategrafik.update.form = { ...formData }; // update global state pas submit aja
      await stategrafik.update.submit();
      router.push(
        '/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan'
      );
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memperbarui data grafik');
    } finally {
      setIsSubmitting(false);
    }
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
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Grafik Pengangguran Berdasarkan Pendidikan
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
            name="SD"
            label="SD"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.SD}
            onChange={handleChange}
          />
          <TextInput
            name="SMP"
            label="SMP"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.SMP}
            onChange={handleChange}
          />
          <TextInput
            name="SMA"
            label="SMA"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.SMA}
            onChange={handleChange}
          />
          <TextInput
            name="D3"
            label="D3"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.D3}
            onChange={handleChange}
          />
          <TextInput
            name="S1"
            label="S1"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.S1}
            onChange={handleChange}
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

export default EditGrafikBerdasarkanPendidikan;
