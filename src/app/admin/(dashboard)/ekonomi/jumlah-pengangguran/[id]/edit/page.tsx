/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Select, NumberInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditDetailDataPengangguran() {
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran)
  const router = useRouter();
  const params = useParams()

  const [formData, setFormData] = useState<{
    month: string;
    year: number;
    educatedUnemployment: number;
    uneducatedUnemployment: number;
    totalUnemployment: number;
    percentageChange: number | null;
  }>({
    month: "",
    year: new Date().getFullYear(),
    educatedUnemployment: 0,
    uneducatedUnemployment: 0,
    totalUnemployment: 0,
    percentageChange: 0,
  });

  // Update form data and recalculate totals
  const updateFormData = async (updates: Partial<typeof formData>) => {
    const newData = { ...formData, ...updates };
    const { total, percentageChange } = await calculateTotalAndChange();
    
    setFormData({
      ...newData,
      totalUnemployment: total,
      percentageChange,
    });
  };

  const calculateTotalAndChange = async () => {
    const total = formData.educatedUnemployment + formData.uneducatedUnemployment;
    
    // Calculate percentage change based on previous month's data
    let percentageChange = 0;
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const currentMonthIndex = monthOrder.indexOf(formData.month);
    
    if (currentMonthIndex !== -1) {
      let prevMonthIndex = currentMonthIndex - 1;
      let prevYear = formData.year;
      
      if (prevMonthIndex < 0) {
        prevMonthIndex = 11;
        prevYear--;
      }
      
      const prevMonth = monthOrder[prevMonthIndex];
      
      // Get previous month's data
      const prevData = await stateDetail.findByMonthYear.load({
        month: prevMonth,
        year: prevYear,
      });

      if (prevData && prevData.totalUnemployment > 0) {
        const change = ((total - prevData.totalUnemployment) / prevData.totalUnemployment) * 100;
        percentageChange = parseFloat(change.toFixed(1));
      }
    }
    
    return { total, percentageChange };
  };

  useEffect(() => {
    const loadDetail = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateDetail.findUnique.load(id); // ambil by ID
        const data = stateDetail.findUnique.data;

        if (data) {

          // Convert year from Date to number if needed
          const yearValue = data.year && typeof data.year === 'object' && 'getFullYear' in data.year
            ? (data.year as Date).getFullYear()
            : Number(data.year);

          // Set the ID for update
          stateDetail.update.id = id;

          // Update Valtio state with converted year
          stateDetail.update.form = {
            ...data,
            year: yearValue,
            percentageChange: data.percentageChange || 0 // Ensure it's always a number
          };

          // Update local formData with converted year
          setFormData({
            month: data.month,
            year: yearValue,
            totalUnemployment: data.totalUnemployment,
            educatedUnemployment: data.educatedUnemployment,
            uneducatedUnemployment: data.uneducatedUnemployment,
            percentageChange: data.percentageChange || 0, // Ensure it's always a number
          });
        }
      } catch (error) {
        console.error("Error loading detail:", error);
        toast.error("Gagal memuat data detail");
      }
    };

    loadDetail();
  }, [params?.id]);

  const handleSubmit = async () => {
    const { total, percentageChange } = await calculateTotalAndChange();
    try {
      stateDetail.update.form = {
        ...formData,
        totalUnemployment: total,
        percentageChange,
      };

      const success = await stateDetail.update.submit();
      if (success) {
        toast.success("Detail data pengangguran berhasil diperbarui!");
        router.push("/admin/ekonomi/jumlah-pengangguran");
      }
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Title order={4}>Edit Detail Data Pengangguran</Title>
        <Stack gap="xs">
          <Select
            label="Bulan"
            data={["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]}
            value={formData.month}
            onChange={async (val) => {
              await updateFormData({ month: val || "" });
            }}
          />
          <NumberInput
            label="Tahun"
            value={formData.year}
            onChange={async (val) => {
              await updateFormData({ year: Number(val) });
            }}
          />
          <TextInput
            label="Pengangguran Terdidik"
            type="number"
            value={formData.educatedUnemployment}
            onChange={async (val) => {
              const value = Number(val.currentTarget.value) || 0;
              await updateFormData({ educatedUnemployment: value });
            }}
          />
          <TextInput
            label="Pengangguran Tidak Terdidik"
            type="number"
            value={formData.uneducatedUnemployment}
            onChange={async (val) => {
              const value = Number(val.currentTarget.value) || 0;
              await updateFormData({ uneducatedUnemployment: value });
            }}
          />
          <Text fz="sm" fw={500}>
            Total Otomatis: {formData.totalUnemployment}
          </Text>
          <Text fz="sm" fw={500}>
            Perubahan Otomatis:{" "}
            {formData.percentageChange !== null
              ? `${formData.percentageChange}%`
              : '-'}
          </Text>
          <Group>
            <Button bg={colors['blue-button']} mt={10} onClick={handleSubmit}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditDetailDataPengangguran;
