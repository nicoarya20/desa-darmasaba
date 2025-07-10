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

function EditPendapatan() {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: pendapatanState.update.form.name || '',
    value: pendapatanState.update.form.value || '',
  });

  useEffect(() => {
    const loadPendapatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pendapatanState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            value: data.value || '',
          });
        }
      } catch (error) {
        console.error("Error loading pendapatan:", error);
        toast.error("Gagal memuat data pendapatan");
      }
    };

    loadPendapatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      pendapatanState.update.form = {
        ...pendapatanState.update.form,
        name: formData.name,
        value: Number(formData.value),
      }

      await pendapatanState.update.update();
      toast.success("Jenis Pendapatan berhasil diperbarui!");
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan");
    } catch (error) {
      console.error("Error updating jenis pendapatan:", error);
      toast.error("Terjadi kesalahan saat memperbarui jenis pendapatan");
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
          value={formData.value}
          onChange={(val) => {
            setFormData({ ...formData, value: val.target.value });
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

export default EditPendapatan;