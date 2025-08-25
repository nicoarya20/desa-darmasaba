/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';



function CreateProgramKreatifDesa() {
  const stateCreate = useProxy(kolaborasiInovasiState)
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      tahun: 0,
      slug: "",
      deskripsi: "",
      kolaborator: "",
    }
  }

  // Generate slug from name
  useEffect(() => {
    const { name } = stateCreate.create.form;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      stateCreate.create.form.slug = slug;
    }
  }, [stateCreate.create.form.name]);

  const handleSubmit = async () => {
    try {
      // Submit data kolaborasi inovasi
      await stateCreate.create.create();

      // Reset form setelah submit
      resetForm();
      router.push("/admin/inovasi/kolaborasi-inovasi");
      toast.success("Berhasil menambahkan kolaborasi inovasi");
    } catch (error) {
      console.error("Error creating kolaborasi inovasi:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
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
        <Stack gap={"xs"}>
          <Title order={3}>Create Kolaborasi Inovasi</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Kolaborasi Inovasi</Text>}
            placeholder="masukkan nama kolaborasi inovasi"
            onChange={(val) => stateCreate.create.form.name = val.target.value}
          />
          <YearPickerInput
            clearable
            value={stateCreate.create.form.tahun ? new Date(stateCreate.create.form.tahun, 0, 1) : null}
            label="Tahun"
            placeholder="Pilih tahun"
            onChange={(dateString: string) => {
              const year = dateString ? new Date(dateString).getFullYear() : 0;
              stateCreate.create.form.tahun = year;
            }}
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(val) => {
                stateCreate.create.form.deskripsi = val;
              }}
            />
          </Box>
          <TextInput
            onChange={(e) => stateCreate.create.form.kolaborator = e.currentTarget.value}
            label={<Text fw={"bold"} fz={"sm"}>Kolaborator</Text>}
            placeholder='Masukkan kolaborator'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Kolaborasi Inovasi</Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(htmlContent) => stateCreate.create.form.deskripsi = htmlContent}
            />
          </Box>
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramKreatifDesa;
