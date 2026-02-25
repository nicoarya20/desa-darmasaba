/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Loader } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export default function EditKategoriDesaAntiKorupsi() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // 🧠 Ambil proxy asli (bisa ditulis) & snapshot (buat render)
  const stateKategori = korupsiState.kategoriDesaAntiKorupsi;
  const snapshotKategori = useProxy(stateKategori);

  // 🧾 state lokal form
  const [formData, setFormData] = useState({ name: '' });
  const [originalData, setOriginalData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return formData.name?.trim() !== '';
  };

  // 📥 load data saat pertama kali dibuka
  useEffect(() => {
    if (!id) return;

    const loadKategori = async () => {
      try {
        const data = await stateKategori.edit.load(id);
        if (data) {
          stateKategori.edit.id = id;
          const newForm = { name: data.name || '' };
          setFormData(newForm);
          setOriginalData(newForm);
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data kategori desa anti korupsi');
      }
    };

    loadKategori();
  }, [id]);

  // ✍️ ubah value input form
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔁 reset ke data awal
  const handleResetForm = () => {
    setFormData({ ...originalData });
    toast.info('Form dikembalikan ke data awal');
  };

  // 💾 submit update
  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) return toast.error('Nama kategori tidak boleh kosong');

    setIsSubmitting(true);
    try {
      // isi form global dari local state
      stateKategori.edit.form = { name: formData.name.trim() };
      stateKategori.edit.id = id;

      await stateKategori.edit.update();

      toast.success('Kategori berhasil diperbarui');
      router.push('/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui kategori');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData.name, id, router]);

  // 🧩 UI
  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kategori Desa Anti Korupsi
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
            label="Nama Kategori"
            placeholder="Masukkan nama kategori"
            value={formData.name}
            onChange={(e) => handleChange('name', e.currentTarget.value)}
            required
          />

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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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
