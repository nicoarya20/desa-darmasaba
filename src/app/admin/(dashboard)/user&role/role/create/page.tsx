/* eslint-disable react-hooks/exhaustive-deps */
'use client';
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
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import user from '../../../_state/user/user-state';


export default function CreateRole() {
  const router = useRouter();
  const stateRole = useProxy(user.roleState, { sync: true }); // sync: cegah caret jump di controlled input
  useEffect(() => {
    stateRole.findMany.load();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateRole.create.form = {
      name: ''
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await stateRole.create.create();

      resetForm();
      router.push('/admin/user&role/role');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Terjadi kesalahan saat membuat role');
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
        <Title order={4} ml="sm" c="dark">
          Tambah Role
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
          <Box>
            <TextInput
              label="Nama Role"
              placeholder="Masukkan nama role"
              value={stateRole.create.form.name || ''}
              onChange={(e) => (stateRole.create.form.name = e.target.value)}
              required
            />
          </Box>

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
