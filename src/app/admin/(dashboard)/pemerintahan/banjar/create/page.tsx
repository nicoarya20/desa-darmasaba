'use client';
import stateBanjar from '@/app/admin/(dashboard)/_state/desa/banjar';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateBanjar() {
  const state = useProxy(stateBanjar, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = () => state.create.form.name?.trim() !== '';

  const resetForm = () => {
    state.create.form = { name: '' };
  };

  const handleSubmit = async () => {
    if (!state.create.form.name?.trim()) {
      toast.error('Nama banjar wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await state.create.create();
      resetForm();
      router.push('/admin/pemerintahan/banjar');
    } catch (error) {
      console.error('Error creating banjar:', error);
      toast.error('Gagal menambahkan banjar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Tambah Banjar</Title>
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
            label="Nama Banjar"
            placeholder="Masukkan nama banjar"
            value={state.create.form.name || ''}
            onChange={(e) => (state.create.form.name = e.target.value)}
            required
          />

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={resetForm}>
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background:
                  !isFormValid() || isSubmitting
                    ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
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

export default CreateBanjar;
