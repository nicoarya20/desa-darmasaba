/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Loader } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import korupsiState from '../../../../_state/landing-page/desa-anti-korupsi';
import { toast } from 'react-toastify';

export default function CreateKategoriDesaAntiKorupsi() {
  const router = useRouter();
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi, { sync: true }); // sync: cegah caret jump di controlled input
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return stateKategori.create.form.name?.trim() !== '';
  };

  useEffect(() => {
    stateKategori.findMany.load();
  }, []);

  const resetForm = () => {
    stateKategori.create.form = {
      name: "",
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!stateKategori.create.form.name) {
        return alert('Nama kategori harus diisi');
      }

      await stateKategori.create.create();
      resetForm();
      router.push("/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi");
    } catch (error) {
      console.error("Error creating kategori desa anti korupsi:", error);
      toast.error("Gagal menambahkan kategori desa anti korupsi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Kategori Desa Anti Korupsi
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
            value={stateKategori.create.form.name || ''}
            onChange={(e) => (stateKategori.create.form.name = e.target.value)}
            required
          />

          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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
