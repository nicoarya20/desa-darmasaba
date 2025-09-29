'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
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
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';

function EditPelayananTelunjukSakti() {
  const stateTelunjukDesa = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: stateTelunjukDesa.edit.form.name,
    deskripsi: stateTelunjukDesa.edit.form.deskripsi,
    link: stateTelunjukDesa.edit.form.link,
  });

  useEffect(() => {
    const loadPelayananTelunjukSakti = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await stateTelunjukDesa.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            link: data.link || '',
          });
        }
      } catch (error) {
        console.error('Error loading pelayanan telunjuk sakti:', error);
        toast.error('Gagal memuat data pelayanan telunjuk sakti');
      }
    };
    loadPelayananTelunjukSakti();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateTelunjukDesa.edit.form = {
        ...stateTelunjukDesa.edit.form,
        ...formData,
      };
      await stateTelunjukDesa.edit.update();
      toast.success('Pelayanan telunjuk sakti berhasil diperbarui!');
      router.push('/admin/desa/layanan/pelayanan_telunjuk_sakti_desa');
    } catch (error) {
      console.error('Error updating pelayanan telunjuk sakti:', error);
      toast.error('Terjadi kesalahan saat memperbarui pelayanan telunjuk sakti');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Back Button + Title */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Pelayanan Telunjuk Sakti Desa
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
          {/* Nama */}
          <TextInput
            label="Nama Pelayanan"
            placeholder="Masukkan nama pelayanan"
            defaultValue={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {/* Deskripsi pakai editor */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => setFormData({ ...formData, deskripsi: htmlContent })}
            />
          </Box>

          {/* Link */}
          <TextInput
            label="Link"
            placeholder="Masukkan link terkait"
            defaultValue={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          {/* Tombol Simpan */}
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

export default EditPelayananTelunjukSakti;
