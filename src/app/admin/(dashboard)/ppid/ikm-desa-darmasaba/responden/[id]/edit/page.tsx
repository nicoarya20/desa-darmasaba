'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Title, TextInput, Text, Select, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy } from '@tabler/icons-react';
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import { toast } from 'react-toastify';

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
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Nama Responden
              </Text>
            }
            type='text'
            placeholder="Masukkan nama responden"
            value={formData.name}
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
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Tanggal
              </Text>
            }
            type="date"
            placeholder='Pilih tanggal'
            value={formData.tanggal ? new Date(formData.tanggal).toISOString().split('T')[0] : ''}
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
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Jenis Kelamin
              </Text>
            }
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
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Rating
              </Text>
            }
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
            label={<Text fw={"bold"} fz={"sm"}>Kelompok Umur</Text>}
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
