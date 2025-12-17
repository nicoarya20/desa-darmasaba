'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import daftarInformasiPublik from '../../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

export default function CreateDaftarInformasi() {
  const daftarInformasi = useProxy(daftarInformasiPublik);
  const router = useRouter();

  const resetForm = () => {
    daftarInformasi.create.form = {
      jenisInformasi: "",
      deskripsi: "",
      tanggal: "",
    };
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
      await daftarInformasi.create.create();
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

          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleSubmit}
              loading={daftarInformasi.create.loading}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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
