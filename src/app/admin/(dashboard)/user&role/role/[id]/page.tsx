/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import user from '../../../_state/user/user-state';


function EditRole() {
  const stateRole = useProxy(user.roleState);
  const router = useRouter();
  const params = useParams();

  // Controlled local state
  const [formData, setFormData] = useState({
    name: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load role data
  const loadRole = useCallback(async (id: string) => {
    const data = await stateRole.update.load(id);

    if (data) {
      setFormData({
        name: data.name ?? '',
      });

      setOriginalData({
        name: data.name ?? '',
      });
    }
  }, []);

  useEffect(() => {
    stateRole.findMany.load();   // load permission
    if (params?.id) loadRole(params.id as string);
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
    });
    toast.info("Form dikembalikan ke data awal");
  };
  // Submit handler
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama role tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      // Update global state only on submit
      stateRole.update.form = {
        ...stateRole.update.form,
        name: formData.name,
      };
      await stateRole.update.update();
      toast.success('Role berhasil diperbarui!');
      router.push('/admin/user&role/role');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Terjadi kesalahan saat memperbarui role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Role
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="md"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="xs">
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fw="bold" fz="sm">Nama Role</Text>}
            placeholder="Masukkan nama role"
          />
          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
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

export default EditRole;
