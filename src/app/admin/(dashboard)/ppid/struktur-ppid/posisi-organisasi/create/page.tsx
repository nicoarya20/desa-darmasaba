/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePosisiOrganisasiPPID() {
  const router = useRouter();
  const stateOrganisasi = useProxy(stateStrukturPPID.posisiOrganisasi);
  
  useEffect(() => {
    stateOrganisasi.findMany.load();
    // Initialize form with default values
    stateOrganisasi.create.form = {
      nama: "",
      deskripsi: "",
      hierarki: 0,
    };
    
    return () => {
      // Clean up form on unmount
      stateOrganisasi.create.form = {
        nama: "",
        deskripsi: "",
        hierarki: 0,
      };
    };
  }, []);

  const handleSubmit = async () => {
    try {
      if (!stateOrganisasi.create.form.nama.trim()) {
        return toast.error('Nama posisi tidak boleh kosong');
      }
      
      await stateOrganisasi.create.submit();
      toast.success('Posisi organisasi berhasil ditambahkan');
      router.push('/admin/ppid/struktur-ppid/posisi-organisasi');
    } catch (error) {
      toast.error('Gagal menambahkan posisi organisasi');
      console.error('Error:', error);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Posisi Organisasi PPID
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
            defaultValue={stateOrganisasi.create.form.nama}
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
            defaultValue={stateOrganisasi.create.form.hierarki || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              stateOrganisasi.create.form.hierarki = isNaN(value) ? 0 : value;
            }}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleSubmit}
              loading={stateOrganisasi.create.loading}
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

export default CreatePosisiOrganisasiPPID;
