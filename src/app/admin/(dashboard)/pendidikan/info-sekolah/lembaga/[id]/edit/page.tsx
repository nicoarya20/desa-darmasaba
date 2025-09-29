/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
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
      state.edit.load(id).then((data) => {
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
      toast.warn('Nama dan jenjang pendidikan harus diisi');
      return;
    }

    state.edit.id = id;
    state.edit.form = form;

    const result = await state.edit.update();

    if (result) {
      toast.success('Data berhasil diperbarui');
      router.push('/admin/pendidikan/info-sekolah/lembaga');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan back button */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Lembaga Pendidikan
        </Title>
      </Group>

      {/* Card Form */}
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
            label="Nama Lembaga"
            placeholder="Masukkan nama lembaga"
            defaultValue={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.currentTarget.value })}
            required
          />

          <Select
            label="Jenjang Pendidikan"
            placeholder="Pilih jenjang pendidikan"
            searchable
            data={
              jenjangPendidikanList?.map((p) => ({
                value: p.id,
                label: p.nama,
              })) || []
            }
            value={form.jenjangId}
            onChange={(val) => setForm({ ...form, jenjangId: val || '' })}
            required
          />

          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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
