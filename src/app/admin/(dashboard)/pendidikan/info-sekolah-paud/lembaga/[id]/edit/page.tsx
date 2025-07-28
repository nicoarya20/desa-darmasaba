/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Paper, Select, Stack, TextInput, Title } from '@mantine/core';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { IconArrowBack } from '@tabler/icons-react';


export default function EditLembaga() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const state = useProxy(infoSekolahPaud.lembagaPendidikan);
  const jenjangPendidikanList = infoSekolahPaud.jenjangPendidikan.findMany.data;

  const [form, setForm] = useState({
    nama: '',
    jenjangId: '',
  });

  useEffect(() => {
    infoSekolahPaud.jenjangPendidikan.findMany.load();

    if (id) {
      state.edit.load(id).then(data => {
        if (data) {
          setForm({
            nama: data.nama,
            jenjangId: data.jenjangId,
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!form.nama || !form.jenjangId) {
      toast.warn("Nama dan jenjang pendidikan harus diisi");
      return;
    }

    state.edit.id = id;
    state.edit.form = form;

    const result = await state.edit.update();

    if (result) {
      toast.success("Data berhasil diperbarui");
      router.push('/admin/pendidikan/info-sekolah-paud/lembaga');
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper p="md" w={{ base: '100%', md: '50%' }}>
        <Stack>
          <Title order={3}>Edit Lembaga</Title>
          <TextInput
            label="Nama Lembaga"
            placeholder="Masukkan nama lembaga"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.currentTarget.value })}
          />
          <Select
            label="Jenjang Pendidikan"
            placeholder="Pilih jenjang pendidikan"
            searchable
            data={jenjangPendidikanList?.map(p => ({
              value: p.id,
              label: p.nama,
            })) || []}
            value={form.jenjangId}
            onChange={(val) => setForm({ ...form, jenjangId: val || '' })}
          />
          <Button onClick={handleSubmit} color="blue">Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
