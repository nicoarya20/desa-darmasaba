/* eslint-disable react-hooks/exhaustive-deps */
'use client';

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

export default function EditLembaga() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const state = useProxy(infoSekolahPaud.lembagaPendidikan);
  const jenjangPendidikanList = infoSekolahPaud.jenjangPendidikan.findMany.data;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    jenjangId: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
    jenjangId: '',
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      form.nama?.trim() !== '' &&
      form.jenjangId?.trim() !== ''
    );
  };

  // Load jenjang pendidikan dan data lembaga
  useEffect(() => {
    infoSekolahPaud.jenjangPendidikan.findMany.load();

    if (id) {
      state.edit.load(id).then((data) => {
        if (data) {
          setForm({
            nama: data.nama,
            jenjangId: data.jenjangId,
          });
          setOriginalData({
            nama: data.nama,
            jenjangId: data.jenjangId,
          });
        }
      });
    }
  }, [id]);

  const handleChange = (field: 'nama' | 'jenjangId', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setForm({
      nama: originalData.nama,
      jenjangId: originalData.jenjangId,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!form.nama || !form.jenjangId) {
        toast.warn('Nama dan jenjang pendidikan harus diisi');
        return;
      }

      // Update global state hanya saat submit
      state.edit.id = id;
      state.edit.form = form;

      const result = await state.edit.update();

      if (result) {
        toast.success('Data berhasil diperbarui');
        router.push('/admin/pendidikan/info-sekolah/lembaga');
      }
    } catch (error) {
      console.error('Error updating lembaga:', error);
      toast.error('Gagal memperbarui lembaga');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Lembaga Pendidikan
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
            label="Nama Lembaga"
            placeholder="Masukkan nama lembaga"
            value={form.nama}
            onChange={(e) => handleChange('nama', e.currentTarget.value)}
            required
          />

          <Select
            label="Jenjang Pendidikan"
            placeholder="Pilih jenjang pendidikan"
            searchable
            data={
              jenjangPendidikanList?.map((p) => ({
                value: p.id,
                label: p.nama,
              })) || []
            }
            value={form.jenjangId}
            onChange={(val) => handleChange('jenjangId', val || '')}
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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
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
