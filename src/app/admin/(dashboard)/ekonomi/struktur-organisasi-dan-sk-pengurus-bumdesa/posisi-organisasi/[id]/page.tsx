/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
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

function EditPosisiOrganisasi() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateOrganisasi = useProxy(strukturorganisasiState.posisiOrganisasi);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    hierarki: 0,
  });

  // Load data awal sekali saja
  useEffect(() => {
    const loadPosisiOrganisasi = async () => {
      if (!id) return;

      try {
        const data = await stateOrganisasi.edit.load(id);

        if (data) {
          stateOrganisasi.edit.id = id;
          setFormData({
            nama: data.nama ?? '',
            deskripsi: data.deskripsi ?? '',
            hierarki: data.hierarki ?? 0,
          });
        }
      } catch (error) {
        console.error('Error loading posisi organisasi:', error);
        toast.error('Gagal memuat data posisi organisasi');
      }
    };

    loadPosisiOrganisasi();
  }, [id]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama posisi organisasi tidak boleh kosong');
        return;
      }

      // update global state HANYA saat submit
      stateOrganisasi.edit.form = {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        hierarki: formData.hierarki,
      };

      if (!stateOrganisasi.edit.id) {
        stateOrganisasi.edit.id = id; // fallback
      }

      const success = await stateOrganisasi.edit.update();

      if (success) {
        toast.success('Posisi organisasi berhasil diperbarui!');
        router.push(
          '/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi'
        );
      }
    } catch (error) {
      console.error('Error updating posisi organisasi:', error);
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
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Posisi Organisasi
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
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            label="Nama Posisi Organisasi"
            placeholder="Masukkan nama posisi organisasi"
            required
          />

          <Box>
            <Text fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                handleChange('deskripsi', htmlContent)
              }
            />
          </Box>

          <TextInput
            type="number"
            value={formData.hierarki}
            onChange={(e) =>
              handleChange('hierarki', parseInt(e.target.value) || 0)
            }
            label="Hierarki"
            placeholder="Masukkan hierarki"
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

export default EditPosisiOrganisasi;
