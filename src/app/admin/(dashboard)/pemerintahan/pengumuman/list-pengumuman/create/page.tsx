'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { hariIniInput } from '@/lib/pengumuman-tanggal';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Loader
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { LampiranFields } from '../_com/LampiranFields';
import { useLampiranPengumuman } from '../_lib/useLampiranPengumuman';

function CreatePengumuman() {
  const pengumumanState = useProxy(stateDesaPengumuman, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lampiran = useLampiranPengumuman();

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      pengumumanState.pengumuman.create.form.judul?.trim() !== '' &&
      pengumumanState.pengumuman.create.form.categoryPengumumanId !== '' &&
      pengumumanState.pengumuman.create.form.deskripsi?.trim() !== '' &&
      pengumumanState.pengumuman.create.form.tanggalTerbit !== '' &&
      !isHtmlEmpty(pengumumanState.pengumuman.create.form.content)
    );
  };

  useShallowEffect(() => {
    pengumumanState.category.findMany.load();
    // Default Tanggal Terbit = hari ini (WITA); admin bisa mengubahnya untuk pengumuman lama.
    if (!stateDesaPengumuman.pengumuman.create.form.tanggalTerbit) {
      stateDesaPengumuman.pengumuman.create.form.tanggalTerbit = hariIniInput();
    }
  }, []);

  const handleSubmit = async () => {
    if (!pengumumanState.pengumuman.create.form.judul?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    
    if (!pengumumanState.pengumuman.create.form.categoryPengumumanId) {
      toast.error('Kategori wajib dipilih');
      return;
    }
    
    if (!pengumumanState.pengumuman.create.form.deskripsi?.trim()) {
      toast.error('Deskripsi singkat wajib diisi');
      return;
    }
    
    if (!pengumumanState.pengumuman.create.form.tanggalTerbit) {
      toast.error('Tanggal terbit wajib diisi');
      return;
    }

    if (isHtmlEmpty(pengumumanState.pengumuman.create.form.content)) {
      toast.error('Konten lengkap wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      // Berkas diunggah ke MinIO baru sekarang (bukan saat dipilih) agar batal tidak meninggalkan berkas yatim.
      const ids = await lampiran.unggah();
      Object.assign(stateDesaPengumuman.pengumuman.create.form, ids);
      const ok = await pengumumanState.pengumuman.create.create();
      if (!ok) return;
      resetForm();
      router.push('/admin/pemerintahan/pengumuman/list-pengumuman');
    } catch (error) {
      console.error('Error creating pengumuman:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    pengumumanState.pengumuman.create.form = {
      judul: '',
      deskripsi: '',
      content: '',
      categoryPengumumanId: '',
      imageId: null,
      imageIds: [],
      dokumenIds: [],
      tanggalTerbit: hariIniInput(),
    };
    lampiran.muat();
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pengumuman
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Judul */}
          <TextInput
            value={pengumumanState.pengumuman.create.form.judul}
            onChange={(val) => (pengumumanState.pengumuman.create.form.judul = val.target.value)}
            label="Judul"
            placeholder="Masukkan judul pengumuman"
            required
          />

          {/* Kategori */}
          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={pengumumanState.category.findMany.data?.map((item) => ({
              label: item.name,
              value: item.id,
            })) || []}
            value={pengumumanState.pengumuman.create.form.categoryPengumumanId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = pengumumanState.category.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  pengumumanState.pengumuman.create.form.categoryPengumumanId = selected.id;
                }
              } else {
                pengumumanState.pengumuman.create.form.categoryPengumumanId = '';
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          {/* Tanggal Terbit */}
          <TextInput
            type="date"
            label="Tanggal Terbit"
            description="Tanggal asli pengumuman; default hari ini"
            value={pengumumanState.pengumuman.create.form.tanggalTerbit}
            onChange={(e) => (pengumumanState.pengumuman.create.form.tanggalTerbit = e.target.value)}
            required
          />

          {/* Deskripsi Singkat */}
          <TextInput
            value={pengumumanState.pengumuman.create.form.deskripsi}
            onChange={(val) => (pengumumanState.pengumuman.create.form.deskripsi = val.target.value)}
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat"
            required
          />

          {/* Konten Editor */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten Lengkap
            </Text>
            <CreateEditor
              value={pengumumanState.pengumuman.create.form.content}
              onChange={(htmlContent) => {
                pengumumanState.pengumuman.create.form.content = htmlContent;
              }}
            />
          </Box>

          {/* Lampiran: gambar utama, galeri, dokumen PDF (semua opsional) */}
          <LampiranFields lampiran={lampiran} />

          {/* Tombol Submit */}
          <Group justify="right">
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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreatePengumuman;
