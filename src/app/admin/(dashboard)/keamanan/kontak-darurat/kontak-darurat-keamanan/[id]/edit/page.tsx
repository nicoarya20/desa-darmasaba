/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

type FormData = {
  name: string;
  icon: IconKey | '';
  kategoriId: string[];
};

export default function EditKontakDaruratKeamanan() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    icon: '',
    kategoriId: [],
  });
  const [originalData, setOriginalData] = useState<FormData>({
    name: '',
    icon: '',
    kategoriId: [],
  });

  // 🔁 Load data saat ID berubah
  useEffect(() => {
    const loadInitialData = async () => {
      const id = params?.id;
      if (!id) {
        toast.error('ID tidak valid');
        router.push('/admin/keamanan/kontak-darurat');
        return;
      }

      try {
        // Load dropdown kategori
        await kontakDarurat.kontakDaruratItem.findMany.load();

        // Load data kontak darurat
        const data = await kontakState.update.load(id);
        if (!data) {
          toast.error('Data tidak ditemukan');
          router.push('/admin/keamanan/kontak-darurat');
          return;
        }

        const initial: FormData = {
          name: data.nama || '',
          icon: (data.icon as IconKey) || '',
          kategoriId: Array.isArray(data.kategoriId) ? data.kategoriId : [],
        };

        setFormData(initial);
        setOriginalData(initial);
      } catch (err) {
        console.error('Gagal memuat data:', err);
        toast.error('Gagal memuat data kontak darurat');
        router.push('/admin/keamanan/kontak-darurat');
      }
    };

    loadInitialData();
  }, [params?.id]);

  // Debug: Log the kontakDaruratItem data
  useEffect(() => {
    if (kontakDarurat.kontakDaruratItem.findMany.data) {
      console.log('Kontak Item Data:', kontakDarurat.kontakDaruratItem.findMany.data);
    }
  }, [kontakDarurat.kontakDaruratItem.findMany.data]);

  // 📝 Update field
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ↩️ Reset ke data awal
  const handleResetForm = () => {
    setFormData(originalData);
    toast.info('Form dikembalikan ke data awal');
  };

  // 💾 Simpan
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama kontak darurat wajib diisi');
      return;
    }

    if (formData.kategoriId.length === 0) {
      toast.error('Pilih minimal satu kontak item');
      return;
    }

    try {
      setIsSubmitting(true);

      // Sinkronisasi ke Valtio state (jika digunakan di `update`)
      kontakState.update.form = {
        ...kontakState.update.form,
        nama: formData.name,
        icon: formData.icon,
        kategoriId: formData.kategoriId,
      };

      const success = await kontakState.update.update();
      if (success) {
        toast.success('Kontak Darurat berhasil diperbarui!');
        router.push('/admin/keamanan/kontak-darurat');
      }
    } catch (error) {
      console.error('Error saat menyimpan:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 📋 Daftar opsi kategori untuk MultiSelect
  const kategoriOptions = (kontakDarurat.kontakDaruratItem.findMany.data || []).map((item: { id: string; nama: string }) => ({
    value: item.id,
    label: item.nama,
  }));

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kontak Darurat Keamanan
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
            label={<Text fw="bold">Nama Kontak Darurat</Text>}
            placeholder="Masukkan nama kontak darurat"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <MultiSelect
            label={<Text fw="bold" fz="sm">Kontak Item</Text>}
            placeholder="Pilih kontak item"
            data={kategoriOptions}
            value={formData.kategoriId}
            onChange={(values) => updateField('kategoriId', values)}
            clearable
            searchable
            required
            error={!formData.kategoriId.length ? 'Pilih minimal satu kategori' : undefined}
          />

          <Box>
            <Text fz="sm" fw="bold" mb="xs">
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon}
              onChange={(icon) => updateField('icon', icon)}
            />
          </Box>

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