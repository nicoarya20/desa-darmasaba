'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormResponden {
  name: string;
  tanggal: string;
  jenisKelaminId: string;
  ratingId: string;
  kelompokUmurId: string;
}

function EditResponden() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const state = useProxy(indeksKepuasanState.responden)
  const id = params.id
  const [formData, setFormData] = useState<FormResponden>({
    name: '',
    tanggal: '',
    jenisKelaminId: '',
    ratingId: '',
    kelompokUmurId: '',
  })
  useEffect(() => {
    indeksKepuasanState.jenisKelaminResponden.findMany.load();
    indeksKepuasanState.pilihanRatingResponden.findMany.load();
    indeksKepuasanState.kelompokUmurResponden.findMany.load();

    const loadResponden = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await state.update.load(id);
        if (data) {
          state.update.id = id;

          state.update.form = {
            name: data.name,
            tanggal: data.tanggal,
            jenisKelaminId: data.jenisKelaminId,
            ratingId: data.ratingId,
            kelompokUmurId: data.kelompokUmurId,
          };

          setFormData({
            name: data.name,
            tanggal: data.tanggal,
            jenisKelaminId: data.jenisKelaminId,
            ratingId: data.ratingId,
            kelompokUmurId: data.kelompokUmurId,
          });


        }
      } catch (error) {
        console.error("Error loading program penghijauan:", error);
        toast.error("Gagal memuat data program penghijauan");
      }
    }

    loadResponden();
  }, [params?.id]);

  const handleSubmit = async () => {
    state.update.id = id;
    state.update.form = { ...formData }; // <-- sinkronisasi manual
    await state.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/responden')
  }

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Responden
        </Title>
      </Group>

      <Paper
        withBorder
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <TextInput
            label="Nama Responden"
            type='text'
            placeholder="Masukkan nama responden"
            defaultValue={formData.name}
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.currentTarget.value
              })
            }}
            radius="md"
            required
          />
          <TextInput
            label="Tanggal"
            type="date"
            placeholder='Pilih tanggal'
            defaultValue={formData.tanggal ? new Date(formData.tanggal).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const selectedDate = e.currentTarget.value;
              setFormData({
                ...formData,
                tanggal: selectedDate,
              });
            }}
            radius="md"
            required
          />
          <Select
            key="jenisKelamin"
            label="Jenis Kelamin"
            placeholder="Pilih jenis kelamin"
            value={formData.jenisKelaminId}
            onChange={(val) => setFormData({ ...formData, jenisKelaminId: val || "" })}
            data={
              (indeksKepuasanState.jenisKelaminResponden.findMany.data || [])
                .filter(Boolean)
                .map((v) => ({
                  value: v.id || '',
                  label: typeof v.name === 'string' ? v.name : 'Tanpa Nama'
                }))
            }
            disabled={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
            clearable
            searchable
            required
            radius="md"
            error={!formData.jenisKelaminId ? "Pilih jenis kelamin" : undefined}
          />
          <Select
            key="rating"
            value={formData.ratingId}
            onChange={(val) => setFormData({ ...formData, ratingId: val || "" })}
            label="Rating"
            placeholder='Pilih rating'
            data={
              (indeksKepuasanState.pilihanRatingResponden.findMany.data || [])
                .filter(Boolean)
                .map((v) => ({
                  value: v.id || '',
                  label: typeof v.name === 'string' ? v.name : 'Tanpa Nama'
                }))
            }
            disabled={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
            clearable
            searchable
            required
            radius="md"
            error={!formData.ratingId ? "Pilih rating" : undefined}
          />

          <Select
            key={"kelompokUmur"}
            value={formData.kelompokUmurId}
            onChange={(val) => setFormData({ ...formData, kelompokUmurId: val || "" })}
            label="Kelompok Umur"
            placeholder='Pilih kelompok umur'
            data={
              (indeksKepuasanState.kelompokUmurResponden.findMany.data || [])
                .filter(Boolean)
                .map((v) => ({
                  value: v.id || '',
                  label: typeof v.name === 'string' ? v.name : 'Tanpa Nama'
                }))
            }
            disabled={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
            clearable
            searchable
            required
            error={!formData.kelompokUmurId ? "Pilih kelompok umur" : undefined}
          />
          
          <Group justify="flex-end" mt="md">
            <Button 
              variant="light" 
              color="red" 
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button 
              leftSection={<IconDeviceFloppy size={20} />}
              onClick={handleSubmit} 
              loading={state.update.loading}
              color={colors['blue-button']}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditResponden;
