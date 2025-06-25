/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function CreatePersentaseDataKelahiranKematian() {
  const statePersentase = useProxy(persentasekelahiran);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    statePersentase.create.form = {
      tahun: "",
      kematianBayi: "",
      kematianKasar: "",
      kelahiranKasar: "",
    }
  }

  const handleSubmit = async () => {
    const id = await statePersentase.create.create();
    if (id) {
      const idStr = String(id);
      await statePersentase.findUnique.load(idStr);
      if (statePersentase.findUnique.data) {
        setChartData([statePersentase.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian");
  }
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack size={20} />
        </Button>
      </Box>
      <Box>
        <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
          <Title order={4}>Tambah Persentase Data Kelahiran & Kematian</Title>
          <Stack gap={"xs"}>
            <TextInput
              label="Tahun"
              type="number"
              value={statePersentase.create.form.tahun}
              placeholder="Masukkan tahun"
              onChange={(val) => {
                statePersentase.create.form.tahun = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Kematian Kasar"
              type="number"
              value={statePersentase.create.form.kematianKasar}
              placeholder="Masukkan kematian kasar"
              onChange={(val) => {
                statePersentase.create.form.kematianKasar = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Kematian Bayi"
              type="number"
              value={statePersentase.create.form.kematianBayi}
              placeholder="Masukkan kematian bayi"
              onChange={(val) => {
                statePersentase.create.form.kematianBayi = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Kelahiran Kasar"
              type="number"
              value={statePersentase.create.form.kelahiranKasar}
              placeholder="Masukkan kelahiran kasar"
              onChange={(val) => {
                statePersentase.create.form.kelahiranKasar = val.currentTarget.value;
              }}
            />
            <Group>
              <Button
                bg={colors['blue-button']}
                mt={10}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default CreatePersentaseDataKelahiranKematian;
