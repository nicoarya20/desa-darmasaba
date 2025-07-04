/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import programKemiskinanState from '@/app/admin/(dashboard)/_state/ekonomi/program-kemiskinan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditProgramKemiskinan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateProgram = useProxy(programKemiskinanState);
  const id = params.id;

  useEffect(() => {
    if (id) {
      stateProgram.findUnique.load(id).then(() => {
        const data = stateProgram.findUnique.data;
        if (data) {
          stateProgram.update.form = {
            nama: data.nama || '',
            deskripsi: data.deskripsi || '',
            ikonUrl: data.ikonUrl || '',
            statistik: {
              tahun: data.statistik?.tahun?.toString() || '',
              jumlah: data.statistik?.jumlah?.toString() || '',
            },
          };
        }
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    stateProgram.update.id = id;
    await stateProgram.update.update();
    router.push('/admin/ekonomi/program-kemiskinan');
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant="subtle" color="blue">
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="md">
        <Stack gap="xs">
          <Title order={4}>Edit Program Kemiskinan</Title>

          <TextInput
            value={stateProgram.update.form.nama}
            onChange={(e) => {
              stateProgram.update.form.nama = e.target.value;
            }}
            label={<Text fw="bold" fz="md">Judul Program</Text>}
            placeholder="Masukkan judul program"
          />

          <Box>
            <Text fw="bold" fz="md">Deskripsi</Text>
            <EditEditor
              value={stateProgram.update.form.deskripsi}
              onChange={(val) => {
                stateProgram.update.form.deskripsi = val;
              }}
            />
          </Box>

          <TextInput
            value={stateProgram.update.form.ikonUrl}
            onChange={(e) => {
              stateProgram.update.form.ikonUrl = e.target.value;
            }}
            label={<Text fw="bold" fz="md">Ikon URL</Text>}
            placeholder="Masukkan ikon url"
          />

          <Text fw="bold" fz="md">Statistik Jumlah Masyarakat Miskin</Text>

          <TextInput
            type="number"
            value={stateProgram.update.form.statistik.jumlah}
            onChange={(e) => {
              stateProgram.update.form.statistik.jumlah = e.target.value;
            }}
            label={<Text fw="bold" fz="md">Jumlah Masyarakat Miskin</Text>}
            placeholder="Masukkan jumlah masyarakat miskin"
          />

          <TextInput
            type="number"
            value={stateProgram.update.form.statistik.tahun}
            onChange={(e) => {
              stateProgram.update.form.statistik.tahun = e.target.value;
            }}
            label={<Text fw="bold" fz="md">Tahun</Text>}
            placeholder="Masukkan tahun"
          />

          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditProgramKemiskinan;
