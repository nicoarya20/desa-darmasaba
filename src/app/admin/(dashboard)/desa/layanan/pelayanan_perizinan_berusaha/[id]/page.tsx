/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPelayananPerizinanBerusaha() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id; // ini langsung string
  const state = useProxy(stateLayananDesa.pelayananPerizinanBerusaha);

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    deskripsi: '',
    link: '',
  });

  // Load data detail
  useEffect(() => {
    if (!id) {
      toast.error("ID tidak valid");
      return;
    }
  
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await state.findById.load(id);
        if (data) {
          setFormData({
            id: data.id,
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            link: data.link || "",
          });
        } else {
          toast.error("Data tidak ditemukan");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [id]);
  

  const handleChange =
    (field: keyof typeof formData) =>
      (value: string) => {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
      };

  const handleSubmit = async () => {
    try {
      await state.update.update(formData);
      router.push('/admin/desa/layanan/pelayanan_perizinan_berusaha');
    } catch (error) {
      console.error('Error updating pelayanan perizinan berusaha:', error);
      toast.error('Terjadi kesalahan saat update data');
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton height={800} radius="md" />
      </Stack>
    );
  }

  return (
    <Box>
      <Stack gap="xs">
        {/* Header */}
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
            Edit Pelayanan Perizinan Berusaha
          </Title>
        </Group>

        {/* Form */}
        <Paper
          w={{ base: '100%', md: '50%' }}
          bg={colors['white-1']}
          p="md"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="xs">
            <Title order={3}>Edit Pelayanan Perizinan Berusaha</Title>

            <TextInput
              label="Judul"
              placeholder="Masukkan judul"
              value={formData.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              required
            />

            <TextInput
              label="Link"
              placeholder="Masukkan link terkait"
              value={formData.link}
              onChange={(e) => handleChange('link')(e.target.value)}
            />

            <Box>
              <Title order={6}>Deskripsi</Title>
              <EditEditor
                value={formData.deskripsi}
                onChange={handleChange('deskripsi')}
              />
            </Box>

            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={state.update.loading}
                disabled={!formData.name}
              >
                {state.update.loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={state.update.loading}
              >
                Batal
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditPelayananPerizinanBerusaha;
