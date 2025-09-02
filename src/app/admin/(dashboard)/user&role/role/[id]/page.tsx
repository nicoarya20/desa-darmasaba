/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, MultiSelect, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import user from '../../../_state/user/user-state';

function EditRole() {
  const stateRole = useProxy(user.roleState)
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: stateRole.update.form.name || "",
    permissions: stateRole.update.form.permissions || [],
  })

  useEffect(() => {
    stateRole.findMany.load();
    const loadRole = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateRole.update.load(id);
        if (data) {
          setFormData({
            name: data.name || "",
            permissions: data.permissions || [],
          });
        }
      } catch (error) {
        console.error("Error loading role:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data role"
        );
      }
    }

    loadRole();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateRole.update.form = {
        ...stateRole.update.form,
        name: formData.name,
        permissions: formData.permissions,
      }
      await stateRole.update.update();
      toast.success("Role berhasil diperbarui!");
      router.push("/admin/user&role/role");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Terjadi kesalahan saat memperbarui role");
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
          Edit Role
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p={'md'}
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap={"xs"}>
          <Title order={4}>Edit Role</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Role</Text>}
            placeholder='Masukkan nama role'
          />
          <MultiSelect
            value={formData.permissions}
            onChange={(val) => setFormData({ ...formData, permissions: val })}
            label={<Text fw={"bold"} fz={"sm"}>Permission</Text>}
            placeholder='Pilih permission'
            data={
              stateRole.findMany.data?.map((v) => ({
                value: v.id,  // Make sure this is using the ID
                label: v.name
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.permissions.length ? "Pilih minimal satu permission" : undefined}
          />

          <Group justify="right">
            <Button 
            radius="md"
            size="md"
            onClick={handleSubmit}
            style={{
              background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
              color: '#fff',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
            }}
            >Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditRole;
