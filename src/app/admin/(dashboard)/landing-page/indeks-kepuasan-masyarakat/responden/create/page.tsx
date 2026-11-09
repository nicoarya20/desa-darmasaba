'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Select, Stack, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function RespondenCreate() {
  const router = useRouter();
  const stategrafikBerdasarkanResponden = useProxy(indeksKepuasanState.responden, { sync: true }) // sync: cegah caret jump di controlled input
  // Snapshot 3 cabang opsi agar Select re-render saat findMany.load() async
  // selesai — JSX sebelumnya baca raw proxy (loading/data tak reaktif).
  const snapJK = useProxy(indeksKepuasanState.jenisKelaminResponden)
  const snapRating = useProxy(indeksKepuasanState.pilihanRatingResponden)
  const snapUmur = useProxy(indeksKepuasanState.kelompokUmurResponden)
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await stategrafikBerdasarkanResponden.create.create();
      resetForm();
      router.push("/admin/landing-page/indeks-kepuasan-masyarakat/responden");
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
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
            value={stategrafikBerdasarkanResponden.create.form.name}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.name = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Tanggal"
            type="date"
            placeholder="masukkan tanggal"
            value={stategrafikBerdasarkanResponden.create.form.tanggal}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.tanggal = val.currentTarget.value;
            }}
          />
          <Select
            key={"jenisKelamin"}
            label={"Jenis Kelamin"}
            placeholder={snapJK.findMany.loading ? 'Memuat...' : 'Pilih jenis kelamin'}
            value={stategrafikBerdasarkanResponden.create.form.jenisKelaminId || ""}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.jenisKelaminId = val ?? "";
            }}
            data={
              (snapJK.findMany.data || [])
                .filter(Boolean) // Hapus null, undefined, dll
                .map((item) => ({
                  value: item.id,
                  label: item.name || 'Tanpa Nama',
                }))
            }
            disabled={snapJK.findMany.loading}
          />
          <Select
            key={"rating_responden"}
            label={"Rating"}
            placeholder={snapRating.findMany.loading ? 'Memuat...' : 'Pilih rating'}
            value={stategrafikBerdasarkanResponden.create.form.ratingId || ""}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.ratingId = val ?? "";
            }}
            data={
              (snapRating.findMany.data || [])
                .filter(Boolean) // Hapus null, undefined, dll
                .map((item) => ({
                  value: item.id,
                  label: item.name || 'Tanpa Nama',
                }))
            }
            disabled={snapRating.findMany.loading}
          />
          <Select
            key={"kelompokUmur"}
            label={"Kelompok Umur"}
            placeholder={snapUmur.findMany.loading ? 'Memuat...' : 'Pilih kelompok umur'}
            value={stategrafikBerdasarkanResponden.create.form.kelompokUmurId || ""}
            onChange={(val) => {
              stategrafikBerdasarkanResponden.create.form.kelompokUmurId = val ?? "";
            }}
            data={
              (snapUmur.findMany.data || [])
                .filter(Boolean) // Hapus null, undefined, dll
                .map((item) => ({
                  value: item.id,
                  label: item.name || 'Tanpa Nama',
                }))
            }
            disabled={snapUmur.findMany.loading}
          />
          <Group justify="right">
            {/* Tombol Batal */}
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

export default RespondenCreate;
