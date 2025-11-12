/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
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

function EditKontakItem() {
  const router = useRouter();
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem);
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nomorTelepon: '',
    icon: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    nomorTelepon: '',
    icon: '',
  });

  // Load data sekali dari global state
  useEffect(() => {
    const loadKontakDarurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kontakState.update.load(id);
        if (data) {
          setFormData({
            name: data.nama || '',
            nomorTelepon: data.nomorTelepon || '',
            icon: data.icon || '',
          });
          setOriginalData({
            name: data.nama || '',
            nomorTelepon: data.nomorTelepon || '',
            icon: data.icon || '',
          });
        }
      } catch (error) {
        console.error('Error loading kontak darurat:', error);
        toast.error('Gagal memuat data kontak darurat');
      }
    };

    loadKontakDarurat();
  }, [params?.id]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      nomorTelepon: originalData.nomorTelepon,
      icon: originalData.icon,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Update global state sekali pas submit
      kontakState.update.form = {
        ...kontakState.update.form,
        nama: formData.name,
        nomorTelepon: formData.nomorTelepon,
        icon: formData.icon,
      };

      await kontakState.update.update();
      toast.success('Kontak Darurat berhasil diperbarui!');
      router.push('/admin/keamanan/kontak-darurat/kontak-darurat-item');
    } catch (error) {
      console.error('Error updating kontak darurat:', error);
      toast.error('Terjadi kesalahan saat memperbarui kontak darurat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kontak Darurat Item
        </Title>
      </Group>

      {/* Form */}
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
            label="Nama Kontak"
            placeholder="Masukkan nama kontak"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          <TextInput
            label="Nomor Telepon"
            placeholder="Masukkan nomor telepon"
            value={formData.nomorTelepon}
            onChange={(e) => handleChange('nomorTelepon', e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => handleChange('icon', value)}
            />
          </Box>

          <Group justify="right">
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

export default EditKontakItem;
