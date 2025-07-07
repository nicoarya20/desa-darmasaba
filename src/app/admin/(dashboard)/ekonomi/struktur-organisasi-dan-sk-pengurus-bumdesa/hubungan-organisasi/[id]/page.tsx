/* eslint-disable react-hooks/exhaustive-deps */
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

  useEffect(() => {
    strukturorganisasiState.pegawai.findMany.load();

    if (id) {
      state.edit.load(id).then(data => {
        if (data) {
          setForm({
            atasanId: data.atasanId,
            bawahanId: data.bawahanId,
            tipe: data.tipe || '',
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!form.atasanId || !form.bawahanId) {
      toast.warn("Atasan dan bawahan harus diisi");
      return;
    }

    state.edit.id = id;
    state.edit.form = form;

    const result = await state.edit.update();

    if (result) {
      toast.success("Data berhasil diperbarui");
      router.push('/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/hubungan-organisasi');
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
            data={pegawaiList?.map(p => ({
              value: p.id,
              label: p.namaLengkap,
            })) || []}
            value={form.atasanId}
            onChange={(val) => setForm({ ...form, atasanId: val || '' })}
          />
          <Select
            label="Bawahan"
            placeholder="Pilih bawahan"
            searchable
            data={pegawaiList?.map(p => ({
              value: p.id,
              label: p.namaLengkap,
            })) || []}
            value={form.bawahanId}
            onChange={(val) => setForm({ ...form, bawahanId: val || '' })}
          />
          <TextInput
            label="Tipe"
            placeholder="Contoh: langsung_melapor"
            value={form.tipe}
            onChange={(e) => setForm({ ...form, tipe: e.currentTarget.value })}
          />
          <Button onClick={handleSubmit} color="blue">Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
