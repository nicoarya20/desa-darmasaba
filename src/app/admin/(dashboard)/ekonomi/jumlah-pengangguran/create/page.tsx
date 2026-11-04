/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateJumlahPengangguran() {
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran, { sync: true }); // sync: cegah caret jump di controlled input
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateDetail.create.form.month?.trim() !== '' &&
      stateDetail.create.form.year !== null &&
      stateDetail.create.form.year > 0 &&
      stateDetail.create.form.educatedUnemployment !== null &&
      stateDetail.create.form.educatedUnemployment >= 0 &&
      stateDetail.create.form.uneducatedUnemployment !== null &&
      stateDetail.create.form.uneducatedUnemployment >= 0
    );
  };

  const monthOptions = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ] as const;

  const resetForm = () => {
    stateDetail.create.form = {
      month: monthOptions[new Date().getMonth()], // default bulan sekarang
      year: new Date().getFullYear(), // default tahun sekarang
      totalUnemployment: 0,
      educatedUnemployment: 0,
      uneducatedUnemployment: 0,
      percentageChange: 0,
    };
  };

  const calculateTotalAndChange = async () => {
    const total =
      stateDetail.create.form.educatedUnemployment +
      stateDetail.create.form.uneducatedUnemployment;

    stateDetail.create.form.totalUnemployment = total;

    // hitung perubahan dibanding bulan sebelumnya
    const monthOrder = monthOptions;
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
    try {
      setIsSubmitting(true);
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
    } catch (error) {
      console.error("Error creating jumlah pengangguran:", error);
      toast.error("Gagal menambahkan data pengangguran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
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
          Tambah Data Pengangguran
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
          <Select
            label="Bulan"
            placeholder="Pilih bulan"
            data={monthOptions}
            value={stateDetail.create.form.month}
            onChange={(value) => {
              stateDetail.create.form.month = (value || '') as typeof stateDetail.create.form.month;
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

          <Box>
            <Text fz="sm" fw={500} mb={4}>
              Total Otomatis:
            </Text>
            <Text fz="sm" c="dimmed">
              {stateDetail.create.form.totalUnemployment.toLocaleString()}
            </Text>
          </Box>

          <Box>
            <Text fz="sm" fw={500} mb={4}>
              Perubahan Otomatis:
            </Text>
            <Text fz="sm" c="dimmed">
              {stateDetail.create.form.percentageChange.toFixed(1)}%
            </Text>
          </Box>

          {/* Action Button */}
          <Group justify="right">
            {/* Tombol Batal */}
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

export default CreateJumlahPengangguran;
