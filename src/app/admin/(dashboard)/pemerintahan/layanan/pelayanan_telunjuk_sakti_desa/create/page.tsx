'use client';

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import LayananWaktuBiayaFields from '@/components/admin/LayananWaktuBiayaFields';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePelayananTelunjukDesa() {
  const stateTelunjukDesa = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateTelunjukDesa.create.form.name?.trim() !== '' &&
      stateTelunjukDesa.create.form.deskripsi?.trim() !== '' &&
      stateTelunjukDesa.create.form.link?.trim() !== ''
    );
  };

  const resetForm = () => {
    stateTelunjukDesa.create.form = {
      name: '',
      deskripsi: '',
      link: '',
      estimasiWaktu: '',
      biaya: '',
    };
  };

  const handleSubmit = async () => {
    if (!stateTelunjukDesa.create.form.name?.trim()) {
      toast.error('Nama pelayanan wajib diisi');
      return;
    }

    if (!stateTelunjukDesa.create.form.deskripsi?.trim()) {
      toast.error('Judul link wajib diisi');
      return;
    }

    if (!stateTelunjukDesa.create.form.link?.trim()) {
      toast.error('Link wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      await stateTelunjukDesa.create.create();
      resetForm();
      toast.success('Data pelayanan telunjuk sakti berhasil ditambahkan');
      router.push('/admin/pemerintahan/layanan/pelayanan_telunjuk_sakti_desa');
    } catch (error) {
      console.error('Error create pelayanan telunjuk sakti:', error);
      toast.error('Terjadi kesalahan saat menambahkan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pelayanan Telunjuk Sakti Desa
        </Title>
      </Group>

      {/* Form */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Nama */}
          <TextInput
            value={stateTelunjukDesa.create.form.name}
            onChange={(val) => {
              stateTelunjukDesa.create.form.name = val.target.value;
            }}
            label="Nama Pelayanan"
            placeholder="Masukkan nama pelayanan telunjuk sakti desa"
            required
          />

          {/* Deskripsi */}
          <TextInput
            value={stateTelunjukDesa.create.form.deskripsi}
            onChange={(val) => {
              stateTelunjukDesa.create.form.deskripsi = val.target.value;
            }}
            label="Judul Link"
            placeholder="Masukkan judul link"
            required
          />

          {/* Link */}
          <TextInput
            value={stateTelunjukDesa.create.form.link}
            onChange={(val) => {
              stateTelunjukDesa.create.form.link = val.target.value;
            }}
            label="Link"
            placeholder="Masukkan link pelayanan"
            required
          />

          <LayananWaktuBiayaFields
            estimasiWaktu={stateTelunjukDesa.create.form.estimasiWaktu}
            biaya={stateTelunjukDesa.create.form.biaya}
            onEstimasiWaktuChange={(v) => (stateTelunjukDesa.create.form.estimasiWaktu = v)}
            onBiayaChange={(v) => (stateTelunjukDesa.create.form.biaya = v)}
          />

          {/* Tombol Simpan */}
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

export default CreatePelayananTelunjukDesa;
