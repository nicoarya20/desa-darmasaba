/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import demografiPekerjaan from '../../../_state/ekonomi/demografi-pekerjaan';

function EditDemografiPekerjaan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateDemografi = useProxy(demografiPekerjaan);

  const id = params.id;

  useEffect(() => {
    if (!id) return;
    stateDemografi.update.id = id;
    stateDemografi.findUnique
      .load(id)
      .then(() => {
        const data = stateDemografi.findUnique.data;
        if (data) {
          stateDemografi.update.form = {
            pekerjaan: String(data.pekerjaan || ''),
            lakiLaki: Number(data.lakiLaki || 0),
            perempuan: Number(data.perempuan || 0),
          };
        }
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data');
      });
  }, [id]);

  const handleSubmit = async () => {
    try {
      stateDemografi.update.id = id;
      await stateDemografi.update.submit();
      toast.success('Data berhasil diperbarui');
      router.push('/admin/ekonomi/demografi-pekerjaan');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
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
          Edit Demografi Pekerjaan
        </Title>
      </Group>

      {/* Form Card */}
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
            label="Pekerjaan"
            placeholder="Masukkan jenis pekerjaan"
            defaultValue={stateDemografi.update.form.pekerjaan}
            onChange={(e) =>
              (stateDemografi.update.form.pekerjaan = e.currentTarget.value)
            }
            required
          />

          <TextInput
            label="Jumlah Pekerja Laki-laki"
            type="number"
            placeholder="Masukkan jumlah pekerja laki-laki"
            defaultValue={stateDemografi.update.form.lakiLaki}
            onChange={(e) =>
              (stateDemografi.update.form.lakiLaki = Number(
                e.currentTarget.value
              ))
            }
            required
          />

          <TextInput
            label="Jumlah Pekerja Perempuan"
            type="number"
            placeholder="Masukkan jumlah pekerja perempuan"
            defaultValue={stateDemografi.update.form.perempuan}
            onChange={(e) =>
              (stateDemografi.update.form.perempuan = Number(
                e.currentTarget.value
              ))
            }
            required
          />

          <Group justify="flex-end">
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

export default EditDemografiPekerjaan;
