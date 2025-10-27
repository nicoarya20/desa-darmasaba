'use client';
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
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
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditJenisLayanan() {
  const state = useProxy(layananonlineDesa.jenisLayanan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
  });

  useEffect(() => {
    const loadJenisLayanan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await state.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama ?? '',
            deskripsi: data.deskripsi ?? '',
          });
        }
      } catch (error) {
        console.error('Error loading jenis layanan:', error);
        toast.error('Gagal memuat data jenis layanan');
      }
    };

    loadJenisLayanan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      state.edit.form = {
        ...state.edit.form,
        ...formData,
      };

      await state.edit.update();
      toast.success('Jenis layanan berhasil diperbarui!');
      router.push('/admin/inovasi/layanan-online-desa/jenis-layanan');
    } catch (error) {
      console.error('Error updating jenis layanan:', error);
      toast.error('Terjadi kesalahan saat memperbarui jenis layanan');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Jenis Layanan
        </Title>
      </Group>

      {/* Form Container */}
      <Paper
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Input: Nama Jenis Layanan */}
          <TextInput
            label="Nama Jenis Layanan"
            placeholder="Masukkan nama jenis layanan"
            value={formData.nama}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nama: e.target.value }))
            }
            required
          />

          {/* Input: Deskripsi (Rich Text Editor) */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({
                  ...prev,
                  deskripsi: htmlContent,
                }))
              }
            />
          </Box>

          {/* Tombol Submit */}
          <Group justify="right" mt="sm">
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

export default EditJenisLayanan;
