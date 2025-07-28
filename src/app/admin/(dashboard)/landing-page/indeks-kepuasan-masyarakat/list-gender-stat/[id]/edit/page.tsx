/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan-masyarakat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditListSurvey() {
  const editState = useProxy(indeksKepuasanState.genderStatState)
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    laki: editState.edit.form.laki || 0,
    perempuan: editState.edit.form.perempuan || 0,
    monthlyStatId: editState.edit.form.monthlyStatId || '',
    total: editState.edit.form.total || 0,
    percentLaki: editState.edit.form.percentLaki || 0,
    percentPerempuan: editState.edit.form.percentPerempuan || 0,
  })

  useEffect(() => {
    indeksKepuasanState.monthlyStatState.findMany.load();
    const loadSurvey = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            laki: data.laki || 0,
            perempuan: data.perempuan || 0,
            monthlyStatId: data.monthlyStatId || '',
            total: data.total || 0,
            percentLaki: data.percentLaki || 0,
            percentPerempuan: data.percentPerempuan || 0,
          });
        }
      } catch (error) {
        console.error("Error loading list survey:", error);
        toast.error("Gagal memuat data list survey");
      }
    };
    loadSurvey();
  }, [params?.id]);

  // Hitung total dan persentase saat nilai laki atau perempuan berubah
  useEffect(() => {
    const total = formData.laki + formData.perempuan;
    const percentLaki = total > 0 ? Math.round((formData.laki / total) * 100) : 0;
    const percentPerempuan = 100 - percentLaki;
    
    setFormData(prev => ({
      ...prev,
      total,
      percentLaki,
      percentPerempuan
    }));
  }, [formData.laki, formData.perempuan]);

  const handleSubmit = async () => {
    if (!formData.monthlyStatId) {
      return toast.error("Silakan pilih bulan terlebih dahulu");
    }

    if (formData.laki < 0 || formData.perempuan < 0) {
      return toast.error("Nilai tidak boleh negatif");
    }

    try {
      // edit global state with form data
      editState.edit.form = {
        ...editState.edit.form,
        laki: formData.laki,
        perempuan: formData.perempuan,
        monthlyStatId: formData.monthlyStatId,
        total: formData.total,
        percentLaki: formData.percentLaki,
        percentPerempuan: formData.percentPerempuan,
      };

      await editState.edit.update();
      toast.success("Data gender berhasil diperbarui!");
      router.push("/admin/landing-page/indeks-kepuasan-masyarakat/list-gender-stat");
    } catch (error) {
      console.error("Error updating list gender:", error);
      toast.error("Terjadi kesalahan saat memperbarui data gender");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Edit List Survey</Text>
          <Paper>
            <Stack gap={"xs"}>
              <TextInput
                type="number"
                value={formData.laki}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    laki: Number(val.target.value)
                  })
                }}
                label={<Text fw={"bold"} fz={"sm"}>Laki - Laki</Text>}
                placeholder='Masukkan laki - laki'
              />
              <TextInput
                type="number"
                value={formData.perempuan}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    perempuan: Number(val.target.value)
                  })
                }}
                label={<Text fw={"bold"} fz={"sm"}>Perempuan</Text>}
                placeholder='Masukkan perempuan'
              />
              <TextInput
                type="number"
                value={formData.total}
                label={<Text fw="bold" fz="sm">Total</Text>}
                disabled
              />
              <TextInput
                type="number"
                value={formData.percentLaki}
                label={<Text fw="bold" fz="sm">Persentase Laki Laki</Text>}
                disabled
              />
              <TextInput
                type="number"
                value={formData.percentPerempuan}
                label={<Text fw="bold" fz="sm">Persentase Perempuan</Text>}
                disabled
              />
              <Select
                label={"Pilih Bulan"}
                placeholder="Pilih bulanan"
                value={formData.monthlyStatId}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    monthlyStatId: value || ''
                  }));
                }}
                data={
                  indeksKepuasanState.monthlyStatState.findMany.data?.map((monthlyStat) => ({
                    value: monthlyStat.id,
                    label: `${monthlyStat.month} (${monthlyStat.respondentsCount} responden)`,
                  })) || []
                }
                required
                error={!formData.monthlyStatId ? 'Bulan harus dipilih' : undefined}
              />
              <Group>
                <Button 
                  bg={colors['blue-button']} 
                  onClick={handleSubmit}
                  loading={editState.edit.loading}
                >
                  {editState.edit.loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditListSurvey;
