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

function EditBelanja() {
  const belanjaState = useProxy(PendapatanAsliDesa.belanja);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: belanjaState.update.form.name || '',
    value: belanjaState.update.form.value || '',
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
    const loadBelanja = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await belanjaState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            value: data.value || '',
          });
        }
      } catch (error) {
        console.error("Error loading belanja:", error);
        toast.error("Gagal memuat data belanja");
      }
    };

    loadBelanja();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      belanjaState.update.form = {
        ...belanjaState.update.form,
        name: formData.name,
        value: Number(formData.value),
      }

      await belanjaState.update.update();
      toast.success("Jenis Belanja berhasil diperbarui!");
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/belanja");
    } catch (error) {
      console.error("Error updating jenis belanja:", error);
      toast.error("Terjadi kesalahan saat memperbarui jenis belanja");
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
        <Title order={4}>Edit Jenis Pendapatan</Title>
        <TextInput
          value={formData.name}
          onChange={(val) => {
            setFormData({ ...formData, name: val.target.value });
          }}
          label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Pendapatan</Text>}
          placeholder='Masukkan nama Jenis Pendapatan'
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

export default EditBelanja;