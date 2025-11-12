/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import dataLingkunganDesaState from '@/app/admin/(dashboard)/_state/lingkungan/data-lingkungan-desa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import SelectIconProgramEdit from '../../../../_com/selectIconEdit';

interface FormDataLingkunganDesa {
  name: string;
  deskripsi: string;
  jumlah: string;
  icon: string;
}

type IconKey =
  | 'ekowisata'
  | 'kompetisi'
  | 'wisata'
  | 'ekonomi'
  | 'sampah'
  | 'truck'
  | 'scale'
  | 'clipboard'
  | 'trash'
  | 'lingkunganSehat'
  | 'sumberOksigen'
  | 'ekonomiBerkelanjutan'
  | 'mencegahBencana'
  | 'rumah'
  | 'pohon'
  | 'air';

export default function EditDataLingkunganDesa() {
  const stateDataLingkunganDesa = useProxy(dataLingkunganDesaState);
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataLingkunganDesa>({
    name: '',
    deskripsi: '',
    jumlah: '',
    icon: '',
  });

  const [originalData, setOriginalData] = useState<FormDataLingkunganDesa>({
    name: '',
    deskripsi: '',
    jumlah: '',
    icon: '',
  });

  // Load data saat komponen mount
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDataLingkunganDesa.update.load(id);
        if (data) {
          stateDataLingkunganDesa.update.id = id;
          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            jumlah: data.jumlah,
            icon: data.icon,
          });
          setOriginalData({
            name: data.name,
            deskripsi: data.deskripsi,
            jumlah: data.jumlah,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error('Error loading data lingkungan desa:', error);
        toast.error('Gagal memuat data lingkungan desa');
      }
    };

    loadData();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      jumlah: originalData.jumlah,
      icon: originalData.icon,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Update global state hanya saat submit
      stateDataLingkunganDesa.update.form = {
        ...formData,
        name: formData.name.trim(),
        deskripsi: formData.deskripsi.trim(),
        jumlah: formData.jumlah.trim(),
        icon: formData.icon.trim(),
      };
      await stateDataLingkunganDesa.update.submit();
      toast.success('Data lingkungan desa berhasil diperbarui!');
      router.push('/admin/lingkungan/data-lingkungan-desa');
    } catch (error) {
      console.error('Error updating data lingkungan desa:', error);
      toast.error('Terjadi kesalahan saat memperbarui data lingkungan desa');
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
          Edit Data Lingkungan Desa
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            value={formData.name}
            label={<Text fz="sm" fw="bold">Nama Data Lingkungan Desa</Text>}
            placeholder="Masukkan nama data lingkungan desa"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <TextInput
            value={formData.jumlah}
            label={<Text fz="sm" fw="bold">Jumlah Data Lingkungan Desa</Text>}
            placeholder="Masukkan jumlah data lingkungan desa"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, jumlah: e.target.value }))
            }
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Ikon Data Lingkungan Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, icon: value }))
              }
            />
          </Box>

          <Group justify="flex-end">
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
