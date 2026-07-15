/* eslint-disable react-hooks/exhaustive-deps */
'use client';
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
import { useProxy } from 'valtio/utils';
import infoSekolahPaud from '../../../../_state/pendidikan/info-sekolah-paud';
import { toast } from 'react-toastify';

function CreateLembaga() {
  const router = useRouter();
  const stateLembaga = useProxy(infoSekolahPaud.lembagaPendidikan, { sync: true }); // sync: cegah caret jump di controlled input
  // Snapshot cabang jenjangPendidikan agar Select re-render saat findMany.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const stateJenjang = useProxy(infoSekolahPaud.jenjangPendidikan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateLembaga.create.form.nama?.trim() !== '' &&
      stateLembaga.create.form.jenjangId?.trim() !== ''
    );
  };

  useEffect(() => {
    stateLembaga.findMany.load();
    infoSekolahPaud.jenjangPendidikan.findMany.load();
  }, []);

  const resetForm = () => {
    stateLembaga.create.form = {
      nama: '',
      jenjangId: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await stateLembaga.create.create();
      resetForm();
      router.push('/admin/pendidikan/info-sekolah/lembaga');
    } catch (error) {
      console.error('Error creating lembaga:', error);
      toast.error('Gagal menambahkan lembaga');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Lembaga Pendidikan
        </Title>
      </Group>

      {/* Form */}
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
            value={stateLembaga.create.form.nama}
            onChange={(val) => {
              stateLembaga.create.form.nama = val.target.value;
            }}
            label={<Text fw="bold" fz="sm">Nama Lembaga</Text>}
            placeholder="Masukkan nama lembaga"
            required
          />

          <Select
            label={<Text fw="bold" fz="sm">Jenjang Pendidikan</Text>}
            placeholder="Pilih jenjang pendidikan"
            searchable
            data={
              stateJenjang.findMany.data?.map((j) => ({
                value: j.id,
                label: j.nama,
              })) || []
            }
            value={stateLembaga.create.form.jenjangId}
            onChange={(val) => {
              stateLembaga.create.form.jenjangId = val || '';
            }}
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

export default CreateLembaga;
