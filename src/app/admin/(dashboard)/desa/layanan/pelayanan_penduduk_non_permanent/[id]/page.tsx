/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
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

function EditPelayananPendudukNonPermanent() {
  const router = useRouter();
  const params = useParams();
  const statePendudukNonPermanent = useProxy(
    stateLayananDesa.pelayananPendudukNonPermanen
  );

  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    name: '',
    deskripsi: '',
  });


  // Load data sekali dari backend
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePendudukNonPermanent.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
          });
          setOriginalData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data pelayanan penduduk non permanent');
      }
    };

    loadData();
  }, [params?.id]);

  const handleChange =
    (field: keyof typeof formData) =>
      (value: string) => {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
      };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!statePendudukNonPermanent.findById.data) return;

      // Update global state hanya di submit
      const updated = {
        ...statePendudukNonPermanent.findById.data,
        name: formData.name,
        deskripsi: formData.deskripsi,
      };

      await statePendudukNonPermanent.update.update(updated);
      router.push('/admin/desa/layanan/pelayanan_penduduk_non_permanent');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memuat data pelayanan penduduk non permanent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack gap="xs">
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
            Edit Pelayanan Penduduk Non Permanent
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
            <Title order={3}>Edit Pelayanan Penduduk Non Permanent</Title>

            {/* Nama Field */}
            <TextInput
              label="Judul"
              placeholder="Masukkan judul"
              value={formData.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              required
            />

            {/* Deskripsi Field */}
            <Box>
              <Text fz="sm" fw="bold">
                Deskripsi
              </Text>
              <EditEditor
                value={formData.deskripsi}
                onChange={handleChange('deskripsi')}
              />
            </Box>

            {/* Submit Button */}
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
      </Stack>
    </Box>
  );
}

export default EditPelayananPendudukNonPermanent;
