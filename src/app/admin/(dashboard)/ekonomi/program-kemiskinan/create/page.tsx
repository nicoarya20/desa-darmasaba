/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import SelectIconProgram from '../../../_com/selectIcon';
import programKemiskinanState from '../../../_state/ekonomi/program-kemiskinan';

function CreateProgramKemiskinan() {
  const programState = useProxy(programKemiskinanState);
  const router = useRouter();
  const [lineChart, setLineChart] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const resetForm = () => {
    programState.create.form = {
      nama: '',
      deskripsi: '',
      icon: '',
      statistik: {
        tahun: '',
        jumlah: '',
      },
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!programState.create.form.nama || !programState.create.form.deskripsi) {
        return toast.warn('Judul dan deskripsi wajib diisi');
      }

      const id = await programState.create.create();
      if (id) {
        const idStr = String(id);
        await programState.findUnique.load(idStr);
        if (programState.findUnique.data) {
          setLineChart([programState.findUnique.data]);
        }
        toast.success('Program berhasil ditambahkan');
      } else {
        toast.error('Gagal menambahkan program, coba lagi');
      }

      resetForm();
      router.push('/admin/ekonomi/program-kemiskinan');
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol back */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Program Kemiskinan
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Judul Program */}
          <TextInput
            label="Judul Program"
            placeholder="Masukkan judul program"
            value={programState.create.form.nama}
            onChange={(val) => (programState.create.form.nama = val.target.value)}
            required
          />

          {/* Ikon Program */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgram
              onChange={(value) => (programState.create.form.icon = value)}
            />
          </Box>

          {/* Deskripsi */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={programState.create.form.deskripsi}
              onChange={(val) => {
                programState.create.form.deskripsi = val;
              }}
            />
          </Box>

          {/* Statistik */}
          <Text fw="bold" fz="sm">
            Statistik Jumlah Masyarakat Miskin
          </Text>
          <Group grow>
            <TextInput
              type="number"
              value={programState.create.form.statistik.jumlah}
              onChange={(val) =>
                (programState.create.form.statistik.jumlah = val.target.value)
              }
              label="Jumlah"
              placeholder="Masukkan jumlah masyarakat miskin"
              required
            />
            <TextInput
              type="number"
              value={programState.create.form.statistik.tahun}
              onChange={(val) =>
                (programState.create.form.statistik.tahun = val.target.value)
              }
              label="Tahun"
              placeholder="Masukkan tahun"
              required
            />
          </Group>

          {/* Tombol Submit */}
          <Group justify="right" mt="sm">
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
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreateProgramKemiskinan;
