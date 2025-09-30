/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import grafikSektorUnggulan from '@/app/admin/(dashboard)/_state/ekonomi/sektor-unggulan-desa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { toast } from 'react-toastify';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';

function EditSektorUnggulanDesa() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateGrafik = useProxy(grafikSektorUnggulan);

  const id = params.id;

  // state lokal buat form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: 0,
  });

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      stateGrafik.findUnique
        .load(id)
        .then(() => {
          const data = stateGrafik.findUnique.data;
          if (data) {
            setFormData({
              name: data.name || '',
              description: data.description || '',
              value: data.value || 0,
            });
          }
        })
        .catch((err) => {
          console.error('Error load sektor unggulan:', err);
          toast.error('Gagal mengambil data sektor unggulan');
        });
    }
  }, [id]);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'value' ? Number(e.currentTarget.value) : e.currentTarget.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async () => {
    try {
      stateGrafik.update.id = id;
      stateGrafik.update.form = { ...formData }; // update global pas submit
      await stateGrafik.update.submit();
      toast.success('Sektor unggulan berhasil diperbarui!');
      router.push('/admin/ekonomi/sektor-unggulan-desa');
    } catch (error) {
      console.error('Error update sektor unggulan:', error);
      toast.error('Terjadi kesalahan saat memperbarui sektor unggulan');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={22} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Sektor Unggulan Desa
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
            label="Nama Sektor Unggulan"
            placeholder="Masukkan nama sektor unggulan"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />
          <Box>
            <Text fz="sm" fw="bold">
              Konten
            </Text>
            <EditEditor
              value={formData.description}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, description: htmlContent }))
              }
            />
          </Box>
          <TextInput
            label="Jumlah"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.value}
            onChange={handleChange('value')}
            required
          />

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

export default EditSektorUnggulanDesa;
