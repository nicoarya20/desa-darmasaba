/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  MultiSelect,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import user from '../../../_state/user/user-state';


export default function CreateRole() {
  const router = useRouter();
  const stateRole = useProxy(user.roleState);
  useEffect(() => {
    stateRole.findMany.load();
  }, []);

  const resetForm = () => {
    stateRole.create.form = {
      name: '',
      permissions: [],
    };
  };

  const handleSubmit = async () => {
    await stateRole.create.create();

    resetForm();
    router.push('/admin/user&role/role');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
              defaultValue={stateRole.create.form.name || ''}
              onChange={(e) => (stateRole.create.form.name = e.target.value)}
              required
            />
          </Box>
          <Box>
            <MultiSelect
              label="Permission"
              placeholder="Pilih permission"
              data={
                Array.from(
                  new Set(
                    stateRole.findMany.data
                      ?.map((item) => item.permissions)
                      .flat()
                  )
                )
                  .filter((p): p is string => typeof p === 'string')
                  .map((p) => ({ label: p, value: p }))
              }
              value={stateRole.create.form.permissions}
              onChange={(value) => (stateRole.create.form.permissions = value)}
              required
            />


          </Box>

          <Group justify="right">
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
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
