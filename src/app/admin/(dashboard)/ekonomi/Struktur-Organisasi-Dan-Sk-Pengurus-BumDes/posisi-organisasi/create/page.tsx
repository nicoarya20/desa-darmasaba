/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateStrukturBumDes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePosisiOrganisasiBumDes() {
  const router = useRouter();
  const stateOrganisasi = useProxy(stateStrukturBumDes.posisiOrganisasi, { sync: true }); // sync: cegah caret jump di controlled input
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateOrganisasi.create.form.nama?.trim() !== '' &&
      !isHtmlEmpty(stateOrganisasi.create.form.deskripsi) &&
      stateOrganisasi.create.form.hierarki !== null &&
      stateOrganisasi.create.form.hierarki >= 0
    );
  };

  useEffect(() => {
    stateOrganisasi.findMany.load();
  }, []);

  const resetForm = () => {
    stateOrganisasi.create.form = {
      nama: "",
      deskripsi: "",
      hierarki: 0,
    };
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!stateOrganisasi.create.form.nama.trim()) {
        return toast.error('Nama posisi tidak boleh kosong');
      }

      await stateOrganisasi.create.submit();
      toast.success('Posisi organisasi berhasil ditambahkan');
      router.push('/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/posisi-organisasi');
    } catch (error) {
      toast.error('Gagal menambahkan posisi organisasi');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Posisi Organisasi BUMDes
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
          <TextInput
            label="Nama Posisi"
            placeholder="Contoh: Kepala Desa"
            value={stateOrganisasi.create.form.nama}
            onChange={(e) => (stateOrganisasi.create.form.nama = e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={stateOrganisasi.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateOrganisasi.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <TextInput
            label="Hierarki"
            type="number"
            min={0}
            placeholder="Contoh: 1 (Angka semakin kecil, posisi semakin tinggi)"
            value={stateOrganisasi.create.form.hierarki || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              stateOrganisasi.create.form.hierarki = isNaN(value) ? 0 : value;
            }}
            required
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

export default CreatePosisiOrganisasiBumDes;
