/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePengajar() {
  const router = useRouter();
  const stateCreate = useProxy(infoSekolahPaud.pengajar, { sync: true }); // sync: cegah caret jump di controlled input
  // Snapshot cabang lembagaPendidikan agar Select re-render saat findMany.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const lembagaState = useProxy(infoSekolahPaud.lembagaPendidikan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateCreate.create.form.nama?.trim() !== '' &&
      stateCreate.create.form.lembagaId?.trim() !== ''
    );
  };

  useEffect(() => {
    stateCreate.findMany.load();
    infoSekolahPaud.lembagaPendidikan.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      nama: '',
      lembagaId: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!stateCreate.create.form.nama || !stateCreate.create.form.lembagaId) {
        return toast.warn('Nama dan Lembaga wajib diisi!');
      }
  
      await stateCreate.create.create();
  
      resetForm();
      router.push('/admin/pendidikan/info-sekolah/pengajar');
    } catch (error) {
      console.error('Error creating pengajar:', error);
      toast.error('Terjadi kesalahan saat menambahkan pengajar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header Back + Title */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pengajar
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
            label={<Text fw="bold" fz="sm">Nama</Text>}
            placeholder="Masukkan nama pengajar"
            value={stateCreate.create.form.nama}
            onChange={(e) => (stateCreate.create.form.nama = e.target.value)}
            required
          />

          <Select
            label={<Text fw="bold" fz="sm">Lembaga</Text>}
            placeholder="Pilih lembaga"
            value={stateCreate.create.form.lembagaId}
            onChange={(val) => (stateCreate.create.form.lembagaId = val ?? '')}
            data={
              lembagaState.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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

export default CreatePengajar;
