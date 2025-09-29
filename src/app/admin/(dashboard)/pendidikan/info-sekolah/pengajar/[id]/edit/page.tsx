/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormPengajar {
  nama: string;
  lembagaId: string;
}

function EditPengajar() {
  const pengajarState = useProxy(infoSekolahPaud.pengajar)
  const params = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState<FormPengajar>({
    nama: '',
    lembagaId: ''
  })

  useEffect(() => {
    const loadPengajar = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pengajarState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            lembagaId: data.lembagaId || '',
          });
        }
      } catch (error) {
        console.error("Error loading pengajar:", error);
        toast.error("Gagal memuat data pengajar");
      }
    }
    infoSekolahPaud.lembagaPendidikan.findMany.load()
    loadPengajar();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      pengajarState.edit.form = {
        ...pengajarState.edit.form,
        nama: formData.nama.trim(),
        lembagaId: formData.lembagaId.trim(),
      }
      await pengajarState.edit.update()
      toast.success("Data pengajar berhasil diperbarui!")
      router.push("/admin/pendidikan/info-sekolah/pengajar");
    } catch (error) {
      console.error("Error updating pengajar:", error);
      toast.error("Terjadi kesalahan saat memperbarui pengajar");
    }
  }

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header Back + Title */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Pengajar
        </Title>
      </Group>

      {/* Form Card */}
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
            label="Nama Pengajar"
            placeholder="Masukkan nama pengajar"
            defaultValue={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />

          <Select
            label="Lembaga Pendidikan"
            placeholder="Pilih lembaga"
            data={infoSekolahPaud.lembagaPendidikan.findMany.data?.map(k => ({
              value: k.id,
              label: k.nama
            })) ?? []}
            value={formData.lembagaId}
            onChange={(val) => setFormData({ ...formData, lembagaId: val ?? '' })}
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

export default EditPengajar;
