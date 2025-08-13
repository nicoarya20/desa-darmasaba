'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput, Text, Select } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
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
          const formattedDate = data.tanggal && !isNaN(new Date(data.tanggal).getTime())
            ? new Date(data.tanggal).toISOString().split('T')[0]
            : '';
          // ⬇️ FIX PENTING: tambahkan ini
          state.update.id = id;

          state.update.form = {
            name: data.name,
            tanggal: formattedDate,
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
    await state.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/responden')
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack size={20} />
        </Button>
      </Box>
      <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
        <Stack>
          <Title order={3}>Edit Responden</Title>
          <TextInput
            label="Nama"
            type='text'
            placeholder="masukkan nama"
            value={formData.name}
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.currentTarget.value
              })
            }}
          />
          <TextInput
            type="date"
            value={formData.tanggal}
            onChange={(e) => {
              setFormData({
                ...formData,
                tanggal: e.currentTarget.value, // ✅ sudah format YYYY-MM-DD
              });
            }}
          />
          <Select
            key={"jenisKelamin"}
            label={<Text fw="bold" fz="sm">Jenis Kelamin</Text>}
            placeholder="Pilih jenis kelamin"
            value={formData.jenisKelaminId}
            onChange={(val) => setFormData({ ...formData, jenisKelaminId: val || "" })}
            data={
              (indeksKepuasanState.jenisKelaminResponden.findMany.data || [])
                .filter(Boolean) // Hapus null/undefined
                .map((v) => ({
                  value: v.id || '',
                  label: typeof v.name === 'string' ? v.name : 'Tanpa Nama'
                }))
            }
            disabled={indeksKepuasanState.jenisKelaminResponden.findMany.loading} // ✅ disable saat loading
            clearable
            searchable
            required
            error={!formData.jenisKelaminId ? "Pilih jenis kelamin" : undefined}
          />
          <Select
            key={"rating"}
            value={formData.ratingId}
            onChange={(val) => setFormData({ ...formData, ratingId: val || "" })}
            label={<Text fw={"bold"} fz={"sm"}>Rating</Text>}
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

          <Button
            mt={10}
            bg={colors['blue-button']}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditResponden;
