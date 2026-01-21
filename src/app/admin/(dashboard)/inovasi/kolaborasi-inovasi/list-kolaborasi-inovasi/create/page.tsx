/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateProgramKreatifDesa() {
  const stateCreate = useProxy(kolaborasiInovasiState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      tahun: 0,
      slug: "",
      deskripsi: "",
      kolaborator: "",
    };
  };

  // Generate slug dari name
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
      setIsSubmitting(true);
      await stateCreate.create.create();
      resetForm();
      router.push("/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi");
      toast.success("Berhasil menambahkan kolaborasi inovasi");
    } catch (error) {
      console.error("Error creating kolaborasi inovasi:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Back Button */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Kolaborasi Inovasi
        </Title>
      </Group>

      {/* Form */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Kolaborasi Inovasi</Text>}
            placeholder="Masukkan nama kolaborasi inovasi"
            value={stateCreate.create.form.name || ''}
            onChange={(val) => stateCreate.create.form.name = val.target.value}
            required
          />

          <TextInput
            label={<Text fz="sm" fw="bold">Deskripsi Singkat</Text>}
            placeholder="Masukkan deskripsi singkat"
            value={stateCreate.create.form.slug || ''}
            onChange={(e) => stateCreate.create.form.slug = e.currentTarget.value}
          />

          <YearPickerInput
            clearable
            value={stateCreate.create.form.tahun ? new Date(stateCreate.create.form.tahun, 0, 1) : null}
            label={<Text fz="sm" fw="bold">Tahun</Text>}
            placeholder="Pilih tahun"
            onChange={(date) => {
              const year = date ? new Date(date).getFullYear() : 0;
              stateCreate.create.form.tahun = year;
            }}
          />

          <TextInput
            label={<Text fz="sm" fw="bold">Kolaborator</Text>}
            placeholder="Masukkan kolaborator"
            value={stateCreate.create.form.kolaborator || ''}
            onChange={(e) => stateCreate.create.form.kolaborator = e.currentTarget.value}
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(val) => stateCreate.create.form.deskripsi = val}
            />
          </Box>  

          <Group justify="right" mt="md">
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

export default CreateProgramKreatifDesa;
