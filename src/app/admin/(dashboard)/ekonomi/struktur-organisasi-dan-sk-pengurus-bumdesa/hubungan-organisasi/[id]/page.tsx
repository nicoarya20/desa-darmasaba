'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Paper, Select, Stack, TextInput, Title } from '@mantine/core';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';

export default function EditHubunganOrganisasi() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const state = useProxy(strukturorganisasiState.hubunganOrganisasi);
  const pegawaiList = strukturorganisasiState.pegawai.findMany.data;

  const [form, setForm] = useState({
    atasanId: '',
    bawahanId: '',
    tipe: '',
  });

  // load data awal sekali aja
  useEffect(() => {
    strukturorganisasiState.pegawai.findMany.load();

    if (id) {
      (async () => {
        const data = await state.edit.load(id);
        if (data) {
          setForm({
            atasanId: data.atasanId ?? '',
            bawahanId: data.bawahanId ?? '',
            tipe: data.tipe ?? '',
          });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.atasanId || !form.bawahanId) {
      toast.warn('Atasan dan bawahan harus diisi');
      return;
    }

    // update global state cuma pas submit
    state.edit.id = id;
    state.edit.form = form;

    const result = await state.edit.update();

    if (result) {
      toast.success('Data berhasil diperbarui');
      router.push(
        '/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/hubungan-organisasi'
      );
    }
  };

  return (
    <Box>
      <Paper p="md" w={{ base: '100%', md: '50%' }}>
        <Stack>
          <Title order={3}>Edit Hubungan Organisasi</Title>

          <Select
            label="Atasan"
            placeholder="Pilih atasan"
            searchable
            data={
              pegawaiList?.map(p => ({
                value: p.id,
                label: p.namaLengkap,
              })) || []
            }
            value={form.atasanId}
            onChange={val => handleChange('atasanId', val || '')}
          />

          <Select
            label="Bawahan"
            placeholder="Pilih bawahan"
            searchable
            data={
              pegawaiList?.map(p => ({
                value: p.id,
                label: p.namaLengkap,
              })) || []
            }
            value={form.bawahanId}
            onChange={val => handleChange('bawahanId', val || '')}
          />

          <TextInput
            label="Tipe"
            placeholder="Contoh: langsung_melapor"
            value={form.tipe}
            onChange={e => handleChange('tipe', e.currentTarget.value)}
          />

          <Button onClick={handleSubmit} color="blue">
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
