'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import PdfDropzoneField from '@/app/admin/_com/upload/PdfDropzoneField';
import { uploadPdfFile } from '@/app/admin/_com/upload/pdf-upload';
import CreateEditor from '../../../_com/createEditor';
import daftarInformasiPublik from '../../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

export default function CreateDaftarInformasi() {
  const daftarInformasi = useProxy(daftarInformasiPublik, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  // PDF yang dipilih; diunggah saat Simpan.
  const [file, setFile] = useState<File | null>(null);

  // Check if form is valid
  const isFormValid = () => {
    return (
      daftarInformasi.create.form.jenisInformasi?.trim() !== '' &&
      daftarInformasi.create.form.deskripsi?.trim() !== '' &&
      daftarInformasi.create.form.tanggal?.trim() !== ''
    );
  };

  const resetForm = () => {
    daftarInformasi.create.form = {
      jenisInformasi: "",
      deskripsi: "",
      tanggal: "",
    };
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!daftarInformasi.create.form.jenisInformasi) {
      return alert('Mohon isi jenis informasi');
    }
    if (!daftarInformasi.create.form.deskripsi) {
      return alert('Mohon isi deskripsi');
    }
    if (!daftarInformasi.create.form.tanggal) {
      return alert('Mohon pilih tanggal publikasi');
    }

    try {
      let fileId: string | undefined;
      if (file) {
        const uploadedId = await uploadPdfFile(file);
        if (!uploadedId) return; // toast galat sudah ditampilkan uploadPdfFile
        fileId = uploadedId;
      }
      await daftarInformasi.create.create(fileId);
      resetForm();
      router.push("/admin/ppid/daftar-informasi-publik");
    } catch (error) {
      console.error('Error creating informasi publik:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
        <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Informasi Publik
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
        <Stack gap="xl">
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Jenis Informasi
            </Text>
            <TextInput
              placeholder="Contoh: Profil Desa, Laporan Keuangan, dll"
              value={daftarInformasi.create.form.jenisInformasi}
              onChange={(e) => {
                daftarInformasi.create.form.jenisInformasi = e.target.value;
              }}
              required
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <Box style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
              <CreateEditor
                value={daftarInformasi.create.form.deskripsi}
                onChange={(htmlContent) => {
                  daftarInformasi.create.form.deskripsi = htmlContent;
                }}
              />
            </Box>
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Tanggal Publikasi
            </Text>
            <TextInput
              type="date"
              value={daftarInformasi.create.form.tanggal}
              onChange={(e) => {
                daftarInformasi.create.form.tanggal = e.target.value;
              }}
              required
            />
          </Box>

          <PdfDropzoneField
            label="Berkas PDF"
            description="Opsional. Dokumen yang bisa diunduh pengunjung dari baris ini."
            file={file}
            onChange={setFile}
          />

          <Group justify="flex-end" mt="md">
            {/* Tombol Reset */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            <Button
              onClick={handleSubmit}
              loading={daftarInformasi.create.loading}
              disabled={!isFormValid() || daftarInformasi.create.loading}
              radius="md"
              size="md"
              style={{
                background: !isFormValid() || daftarInformasi.create.loading
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
