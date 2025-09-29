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

function EditKontakItem() {
  const router = useRouter();
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem);
  const params = useParams();

  const [formData, setFormData] = useState({
    name: kontakState.update.form.nama || '',
    nomorTelepon: kontakState.update.form.nomorTelepon || '',
    icon: kontakState.update.form.icon || '',
  });

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
        }
      } catch (error) {
        console.error('Error loading kontak darurat:', error);
        toast.error('Gagal memuat data kontak darurat');
      }
    };

    loadKontakDarurat();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
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
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
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
            defaultValue={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Nomor Telepon"
            placeholder="Masukkan nomor telepon"
            defaultValue={formData.nomorTelepon}
            onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, icon: value }));
                kontakState.update.form.icon = value;
              }}
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

export default EditKontakItem;
