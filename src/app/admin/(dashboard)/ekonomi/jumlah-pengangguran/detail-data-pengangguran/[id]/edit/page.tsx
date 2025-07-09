/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditDetailDataPengangguran() {
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran)
  const router = useRouter();
  const params = useParams()

  const [formData, setFormData] = useState({
    month: stateDetail.update.form.month,
    year: stateDetail.update.form.year,
    totalUnemployment: stateDetail.update.form.totalUnemployment,
    educatedUnemployment: stateDetail.update.form.educatedUnemployment,
    uneducatedUnemployment: stateDetail.update.form.uneducatedUnemployment,
    percentageChange: stateDetail.update.form.percentageChange || 0, // Ensure it's always a number
  })

  const calculateTotalAndChange = async () => {
    const total = formData.educatedUnemployment + formData.uneducatedUnemployment;

    // Ambil data bulan sebelumnya
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentIndex = monthOrder.findIndex(
      (m) => m.toLowerCase() === formData.month.toLowerCase()
    );

    let percentageChange = 0;
    if (currentIndex > 0) {
      const prevMonth = monthOrder[currentIndex - 1];
      const prev = await stateDetail.findByMonthYear.load({
        month: prevMonth,
        year: formData.year,
      });

      if (prev?.totalUnemployment) {
        percentageChange = Number(
          (((total - prev.totalUnemployment) / prev.totalUnemployment) * 100).toFixed(1)
        );
      }
    }

    setFormData({
      ...formData,
      totalUnemployment: total,
      percentageChange,
    });

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
          // Set the ID for update
          stateDetail.update.id = id;
          
          // Isi state Valtio untuk update
          stateDetail.update.form = { 
            ...data,
            percentageChange: data.percentageChange || 0 // Ensure it's always a number
          };
  
          // Isi local formData supaya input bisa dikontrol
          setFormData({
            month: data.month,
            year: data.year,
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
        router.push("/admin/ekonomi/jumlah-pengangguran/detail-data-pengangguran");
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
          <TextInput
            label="Bulan"
            value={formData.month}
            placeholder="Contoh: Jan, Feb, Mar"
            onChange={(val) => (setFormData({
              ...formData,
              month: val.currentTarget.value
            }))}
          />
          <TextInput
            label="Tahun"
            type="number"
            value={formData.year}
            onChange={(val) => (setFormData({
              ...formData,
              year: Number(val.currentTarget.value)
            }))}
          />
          <TextInput
            label="Pengangguran Terdidik"
            type="number"
            value={formData.educatedUnemployment}
            onChange={(val) => (setFormData({
              ...formData,
              educatedUnemployment: Number(val.currentTarget.value)
            }))}
          />
          <TextInput
            label="Pengangguran Tidak Terdidik"
            type="number"
            value={formData.uneducatedUnemployment}
            onChange={(val) => (setFormData({
              ...formData,
              uneducatedUnemployment: Number(val.currentTarget.value)
            }))}
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
