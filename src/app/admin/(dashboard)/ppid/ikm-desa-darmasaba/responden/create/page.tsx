'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useRouter } from 'next/navigation';
import grafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';
import { useProxy } from 'valtio/utils';
import { useState } from 'react';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput, Select, Text } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import { useShallowEffect } from '@mantine/hooks';

function RespondenCreate() {
  const router = useRouter();
  const stategrafikBerdasarkanResponden = useProxy(indeksKepuasanState.responden)
  const [donutData, setDonutData] = useState<any[]>([]);

  const resetForm = () => {
    stategrafikBerdasarkanResponden.create.form = {
      ...stategrafikBerdasarkanResponden.create.form,
      name: "",
      tanggal: "",
      jenisKelaminId: "",
      ratingId: "",
      kelompokUmurId: "",
    }
  }

  useShallowEffect(() => {
    indeksKepuasanState.jenisKelaminResponden.findMany.load()
    indeksKepuasanState.pilihanRatingResponden.findMany.load()
    indeksKepuasanState.kelompokUmurResponden.findMany.load()
  })

  const handleSubmit = async () => {
    try {
      const id = await stategrafikBerdasarkanResponden.create.create();
      if (typeof id !== 'undefined') {
        const idStr = String(id);
        await stategrafikBerdasarkanResponden.findUnique.load(idStr);
        if (stategrafikBerdasarkanResponden.findUnique.data) {
          setDonutData([stategrafikBerdasarkanResponden.findUnique.data]);
        }
      }
      resetForm();
      router.push("/admin/ppid/ikm-desa-darmasaba/responden");
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
          <Title order={3}>Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik</Title>
          <TextInput
            label="Nama"
            type='text'
            placeholder="masukkan nama"
            defaultValue={stategrafikBerdasarkanResponden.create.form.name}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.name = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Tanggal"
            type="date"
            placeholder="masukkan tanggal"
            defaultValue={stategrafikBerdasarkanResponden.create.form.tanggal}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.tanggal = val.currentTarget.value;
            }}
          />
          <Select
            key={"jenisKelamin"}
            label={"Jenis Kelamin"}
            placeholder={indeksKepuasanState.jenisKelaminResponden.findMany.loading ? 'Memuat...' : 'Pilih jenis kelamin'}
            value={stategrafikBerdasarkanResponden.create.form.jenisKelaminId || ""}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.jenisKelaminId = val ?? "";
            }}
            data={
              (indeksKepuasanState.jenisKelaminResponden.findMany.data || [])
                .filter(Boolean) // Hapus null, undefined, dll
                .map((item) => ({
                  value: item.id,
                  label: item.name || 'Tanpa Nama',
                }))
            }
            disabled={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
          />
            <Select
            key={"rating_responden"}
              label={"Rating"}
              placeholder={indeksKepuasanState.pilihanRatingResponden.findMany.loading ? 'Memuat...' : 'Pilih rating'}
              value={stategrafikBerdasarkanResponden.create.form.ratingId || ""}
              onChange={(val) => {
                stategrafikBerdasarkanResponden.create.form.ratingId = val ?? "";
              }}
              data={
                (indeksKepuasanState.pilihanRatingResponden.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
            />
          <Select
            key={"kelompokUmur"}
            label={"Kelompok Umur"}
            placeholder={indeksKepuasanState.kelompokUmurResponden.findMany.loading ? 'Memuat...' : 'Pilih kelompok umur'}
            value={stategrafikBerdasarkanResponden.create.form.kelompokUmurId || ""}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.kelompokUmurId = val ?? "";
            }}
            data={
              (indeksKepuasanState.kelompokUmurResponden.findMany.data || [])
                .filter(Boolean) // Hapus null, undefined, dll
                .map((item) => ({
                  value: item.id,
                  label: item.name || 'Tanpa Nama',
                }))
            }
            disabled={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
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

export default RespondenCreate;
