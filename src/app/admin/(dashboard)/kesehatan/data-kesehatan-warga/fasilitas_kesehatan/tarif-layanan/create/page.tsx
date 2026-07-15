'use client';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
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

function CreateTarifLayanan() {
  const createState = useProxy(fasilitasKesehatanState.tarif, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      createState.create.form.layanan?.trim() !== '' &&
      createState.create.form.tarif?.trim() !== ''
    );
  };

  const resetForm = () => {
    createState.create.form = {
      tarif: '',
      layanan: '',
    };
  };

  const handleSubmit = async () => {
    if (!createState.create.form.layanan?.trim()) {
      toast.error('Layanan wajib diisi');
      return;
    }

    if (!createState.create.form.tarif?.trim()) {
      toast.error('Tarif wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await createState.create.create();
      resetForm();
      router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan');
    } catch (error) {
      console.error('Error creating tarif layanan:', error);
      toast.error('Gagal menambahkan tarif layanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan back button */}
      <Group mb="md">
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Tarif Layanan
        </Title>
      </Group>

      {/* Form utama */}
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
            label="Layanan"
            placeholder="Masukkan nama layanan"
            value={createState.create.form.layanan || ''}
            onChange={(e) => (createState.create.form.layanan = e.target.value)}
            required
          />
          <TextInput
            label="Tarif"
            placeholder="Masukkan tarif"
            value={createState.create.form.tarif || ''}
            onChange={(e) => (createState.create.form.tarif = e.target.value)}
            required
          />

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

export default CreateTarifLayanan;
