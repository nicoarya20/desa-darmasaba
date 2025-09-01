/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export default function EditKategoriDesaAntiKorupsi() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi);

  const [formData, setFormData] = useState({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadKategori = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        const data = await stateKategori.edit.load(id);

        if (data) {
          stateKategori.edit.id = id;
          setFormData({
            name: data.name || '',
          });
        }
      } catch (error) {
        console.error("Error loading kategori desa anti korupsi:", error);
        toast.error("Gagal memuat data kategori desa anti korupsi");
      } finally {
        setIsLoading(false);
      }
    };

    loadKategori();
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return toast.error('Nama kategori tidak boleh kosong');
    }

    try {
      setIsLoading(true);
      stateKategori.edit.form = {
        name: formData.name.trim(),
      };

      if (!stateKategori.edit.id) {
        stateKategori.edit.id = id;
      }

      await stateKategori.edit.update();
      toast.success('Kategori berhasil diperbarui');
      router.push("/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi");
    } catch (error) {
      console.error("Error updating kategori desa anti korupsi:", error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui kategori');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya"  withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />

          <Group justify="right" mt="md">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              loading={isLoading}
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
