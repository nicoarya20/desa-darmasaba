/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  TextInput,
  Title
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
  const pengajarState = useProxy(infoSekolahPaud.pengajar);
  const params = useParams();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormPengajar>({
    nama: '',
    lembagaId: ''
  });
  const [originalData, setOriginalData] = useState<FormPengajar>({
    nama: '',
    lembagaId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        infoSekolahPaud.lembagaPendidikan.findMany.load();
        const data = await pengajarState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            lembagaId: data.lembagaId || '',
          });
          setOriginalData({
            nama: data.nama || '',
            lembagaId: data.lembagaId || '',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data pengajar");
      }
    };

    loadData();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      lembagaId: originalData.lembagaId,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleChange = (field: keyof FormPengajar, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // update global state hanya saat submit
      pengajarState.edit.form = {
        ...pengajarState.edit.form,
        nama: formData.nama.trim(),
        lembagaId: formData.lembagaId.trim()
      };
      await pengajarState.edit.update();
      toast.success("Data pengajar berhasil diperbarui!");
      router.push("/admin/pendidikan/info-sekolah/pengajar");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memperbarui pengajar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header Back + Title */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
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
            onChange={(val) => handleChange('lembagaId', val ?? '')}
            required
          />

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

export default EditPengajar;
