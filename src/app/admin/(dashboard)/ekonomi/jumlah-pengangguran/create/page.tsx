/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Select, NumberInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function CreateJumlahPengangguran() {
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran)
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();

  const monthOptions = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const resetForm = () => {
    stateDetail.create.form = {
      month: monthOptions[new Date().getMonth()], // Default to current month
      year: new Date().getFullYear(), // Default to current year
      totalUnemployment: 0,
      educatedUnemployment: 0,
      uneducatedUnemployment: 0,
      percentageChange: 0,
    }
  }

  const calculateTotalAndChange = async () => {
    const total =
      stateDetail.create.form.educatedUnemployment +
      stateDetail.create.form.uneducatedUnemployment;

    stateDetail.create.form.totalUnemployment = total;

    // Ambil data bulan sebelumnya
    const monthOrder = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const currentIndex = monthOrder.findIndex(
      (m) => m.toLowerCase() === stateDetail.create.form.month.toLowerCase()
    );

    if (currentIndex > 0) {
      const prevMonth = monthOrder[currentIndex - 1];
      const prev = await stateDetail.findByMonthYear.load({
        month: prevMonth,
        year: stateDetail.create.form.year,
      });

      if (prev?.totalUnemployment) {
        const change = ((total - prev.totalUnemployment) / prev.totalUnemployment) * 100;
        stateDetail.create.form.percentageChange = Number(change.toFixed(1));
      } else {
        stateDetail.create.form.percentageChange = 0;
      }
    } else {
      stateDetail.create.form.percentageChange = 0;
    }
  };

  const handleSubmit = async () => {
    await calculateTotalAndChange();
    const id = await stateDetail.create.create();
    if (id) {
      await stateDetail.findUnique.load(String(id));
      if (stateDetail.findUnique.data) {
        setChartData([stateDetail.findUnique.data]);
      }
      resetForm();
      router.push('/admin/ekonomi/jumlah-pengangguran');
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Title order={4}>Tambah Data Pengangguran</Title>
        <Stack gap="xs" mt="md">
          <Select
            label="Bulan"
            placeholder="Pilih bulan"
            data={monthOptions}
            value={stateDetail.create.form.month}
            onChange={(value) => {
              stateDetail.create.form.month = value || '';
              calculateTotalAndChange();
            }}
            required
          />
          <NumberInput
            label="Tahun"
            value={stateDetail.create.form.year}
            onChange={(value) => {
              stateDetail.create.form.year = Number(value) || new Date().getFullYear();
              calculateTotalAndChange();
            }}
            min={2000}
            max={2100}
            required
          />
          <NumberInput
            label="Pengangguran Terdidik"
            value={stateDetail.create.form.educatedUnemployment}
            onChange={(value) => {
              stateDetail.create.form.educatedUnemployment = Number(value) || 0;
              calculateTotalAndChange();
            }}
            min={0}
            required
          />
          <NumberInput
            label="Pengangguran Tidak Terdidik"
            value={stateDetail.create.form.uneducatedUnemployment}
            onChange={(value) => {
              stateDetail.create.form.uneducatedUnemployment = Number(value) || 0;
              calculateTotalAndChange();
            }}
            min={0}
            required
          />
          <Text fz="sm" fw={500}>
            Total Otomatis: {stateDetail.create.form.totalUnemployment.toLocaleString()}
          </Text>
          <Text fz="sm" fw={500}>
            Perubahan Otomatis: {stateDetail.create.form.percentageChange.toFixed(1)}%
          </Text>
          <Group mt="md">
            <Button
              onClick={handleSubmit}
              disabled={!stateDetail.create.form.month || !stateDetail.create.form.year}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateJumlahPengangguran;
