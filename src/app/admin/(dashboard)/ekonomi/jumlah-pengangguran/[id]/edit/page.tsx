/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
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
  Title,
  Select,
  NumberInput,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

// --- Helper konstanta
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

function EditDetailDataPengangguran() {
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- state lokal form
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    educatedUnemployment: 0,
    uneducatedUnemployment: 0,
    totalUnemployment: 0,
    percentageChange: 0,
  });

  const [originalData, setOriginalData] = useState({
    month: '',
    year: new Date().getFullYear(),
    educatedUnemployment: 0,
    uneducatedUnemployment: 0,
    totalUnemployment: 0,
    percentageChange: 0,
  });

  // --- hitung total + persentase perubahan
  const calculateTotalAndChange = useCallback(
    async (data: typeof formData) => {
      const total = data.educatedUnemployment + data.uneducatedUnemployment;
      let percentageChange = 0;

      const currentMonthIndex = MONTHS.indexOf(data.month);
      if (currentMonthIndex !== -1) {
        let prevMonthIndex = currentMonthIndex - 1;
        let prevYear = data.year;

        if (prevMonthIndex < 0) {
          prevMonthIndex = 11;
          prevYear--;
        }

        const prevData = await stateDetail.findByMonthYear.load({
          month: MONTHS[prevMonthIndex],
          year: prevYear,
        });

        if (prevData && prevData.totalUnemployment > 0) {
          const change =
            ((total - prevData.totalUnemployment) /
              prevData.totalUnemployment) * 100;
          percentageChange = parseFloat(change.toFixed(1));
        }
      }

      return { total, percentageChange };
    },
    [stateDetail.findByMonthYear]
  );

  // --- update state lokal
  const updateFormData = async (updates: Partial<typeof formData>) => {
    const newData = { ...formData, ...updates };
    const { total, percentageChange } = await calculateTotalAndChange(newData);
    setFormData({ ...newData, totalUnemployment: total, percentageChange });
  };

  // --- load detail by ID (sekali)
  useEffect(() => {
    const loadDetail = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateDetail.findUnique.load(id);
        const data = stateDetail.findUnique.data;
        if (!data) return;

        const yearValue = 
          data.year && typeof data.year === 'object' && 'getFullYear' in data.year
            ? (data.year as Date).getFullYear()
            : Number(data.year);

        stateDetail.update.id = id; // simpan id untuk update

        setFormData({
          month: data.month,
          year: yearValue,
          educatedUnemployment: data.educatedUnemployment,
          uneducatedUnemployment: data.uneducatedUnemployment,
          totalUnemployment: data.totalUnemployment,
          percentageChange: data.percentageChange || 0,
        });

        setOriginalData({
          month: data.month,
          year: yearValue,
          educatedUnemployment: data.educatedUnemployment,
          uneducatedUnemployment: data.uneducatedUnemployment,
          totalUnemployment: data.totalUnemployment,
          percentageChange: data.percentageChange || 0,
        });
      } catch (err) {
        console.error('Error loading detail:', err);
        toast.error('Gagal memuat data detail');
      }
    };

    loadDetail();
  }, [params?.id]);

  const handleResetForm = () => {
      setFormData({
        month: originalData.month,
        year: originalData.year,
        educatedUnemployment: originalData.educatedUnemployment,
        uneducatedUnemployment: originalData.uneducatedUnemployment,
        totalUnemployment: originalData.totalUnemployment,
        percentageChange: originalData.percentageChange,
      });
      toast.info("Form dikembalikan ke data awal");
    };

  // --- submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { total, percentageChange } = await calculateTotalAndChange(formData);

      stateDetail.update.form = {
        ...formData,
        totalUnemployment: total,
        percentageChange,
      };

      const success = await stateDetail.update.submit();
      if (success) {
        toast.success('Detail data pengangguran berhasil diperbarui!');
        router.push('/admin/ekonomi/jumlah-pengangguran');
      }
    } catch (err) {
      console.error('Error updating:', err);
      toast.error('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm">
          Edit Detail Data Pengangguran
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
          <Select
            label="Bulan"
            data={MONTHS}
            value={formData.month}
            onChange={(val) => updateFormData({ month: val || '' })}
          />
          <NumberInput
            label="Tahun"
            value={formData.year}
            onChange={(val) => updateFormData({ year: Number(val) })}
            required
          />
          <TextInput
            label="Pengangguran Terdidik"
            type="number"
            value={formData.educatedUnemployment}
            onChange={(e) =>
              updateFormData({
                educatedUnemployment: Number(e.currentTarget.value) || 0,
              })
            }
            required
          />
          <TextInput
            label="Pengangguran Tidak Terdidik"
            type="number"
            value={formData.uneducatedUnemployment}
            onChange={(e) =>
              updateFormData({
                uneducatedUnemployment: Number(e.currentTarget.value) || 0,
              })
            }
            required
          />
          <Text fz="sm" fw={500}>
            Total Otomatis: {formData.totalUnemployment}
          </Text>
          <Text fz="sm" fw={500}>
            Perubahan Otomatis:{' '}
            {formData.percentageChange !== null
              ? `${formData.percentageChange}%`
              : '-'}
          </Text>

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
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

export default EditDetailDataPengangguran;
