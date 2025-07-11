/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPembiayaan() {
  const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: pembiayaanState.update.form.name || '',
    value: pembiayaanState.update.form.value || '',
  });

  const formatRupiah = (value: number | string) => {
    const number = typeof value === 'number' ? value : Number(value.replace(/\D/g, ''));
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const unformatRupiah = (value: string) => {
    return Number(value.replace(/\D/g, ''));
  };

  useEffect(() => {
    const loadPembiayaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pembiayaanState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            value: data.value || '',
          });
        }
      } catch (error) {
        console.error("Error loading pembiayaan:", error);
        toast.error("Gagal memuat data pembiayaan");
      }
    };

    loadPembiayaan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      pembiayaanState.update.form = {
        ...pembiayaanState.update.form,
        name: formData.name,
        value: Number(formData.value),
      }

      await pembiayaanState.update.update();
      toast.success("Jenis Pembiayaan berhasil diperbarui!");
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan");
    } catch (error) {
      console.error("Error updating jenis pembiayaan:", error);
      toast.error("Terjadi kesalahan saat memperbarui jenis pembiayaan");
    }
  }

  return (
    <Box>
    <Box mb={10}>
      <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
        <IconArrowBack color={colors['blue-button']} size={25} />
      </Button>
    </Box>

    <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Title order={4}>Edit Jenis Pembiayaan</Title>
        <TextInput
          value={formData.name}
          onChange={(val) => {
            setFormData({ ...formData, name: val.target.value });
          }}
          label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Pembiayaan</Text>}
          placeholder='Masukkan nama Jenis Pembiayaan'
        />
        <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nilai</Text>}
          placeholder='Masukkan nilai'
          value={formatRupiah(formData.value)}
          onChange={(val) => {
            const raw = val.currentTarget.value;
            const cleanValue = unformatRupiah(raw);
            setFormData({ ...formData, value: cleanValue });
          }}
        />
        <Group>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
        </Group>
      </Stack>
    </Paper>
  </Box>
  );
}

export default EditPembiayaan;