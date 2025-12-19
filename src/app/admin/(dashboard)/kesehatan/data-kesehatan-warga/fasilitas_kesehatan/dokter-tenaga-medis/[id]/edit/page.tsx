/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconArrowBack, IconClock } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditDokterTenagaMedis() {
  const state = useProxy(fasilitasKesehatanState.dokter);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialist: '',
    jadwal: '',
    jadwalLibur: '',
    jamBukaOperasional: '',
    jamTutupOperasional: '',
    jamBukaLibur: '',
    jamTutupLibur: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    specialist: '',
    jadwal: '',
    jadwalLibur: '',
    jamBukaOperasional: '',
    jamTutupOperasional: '',
    jamBukaLibur: '',
    jamTutupLibur: '',
  });

  // Load data
  useEffect(() => {
    const load = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await state.update.load(id);
        const loadedData = state.update.form;

        if (!loadedData) {
          toast.error('Data tidak ditemukan');
          return;
        }

        setFormData(loadedData);
        setOriginalData(loadedData);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data fasilitas kesehatan');
      }
    };

    load();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      specialist: originalData.specialist,
      jadwal: originalData.jadwal,
      jadwalLibur: originalData.jadwalLibur,
      jamBukaOperasional: originalData.jamBukaOperasional,
      jamTutupOperasional: originalData.jamTutupOperasional,
      jamBukaLibur: originalData.jamBukaLibur,
      jamTutupLibur: originalData.jamTutupLibur,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const refBuka = useRef<HTMLInputElement>(null);
  const refTutup = useRef<HTMLInputElement>(null);
  const refBukaLibur = useRef<HTMLInputElement>(null);
  const refTutupLibur = useRef<HTMLInputElement>(null);

  const picker = (ref: any) => (
    <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      state.update.form = { ...state.update.form, ...formData };
      const success = await state.update.submit();
      if (success) {
        toast.success('Data berhasil diperbarui!');
        router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Fasilitas Kesehatan
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
            label="Nama Dokter"
            placeholder="Masukkan nama dokter"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />

          <TextInput
            label="Jadwal"
            placeholder="Masukkan jadwal"
            value={formData.jadwal}
            onChange={(e) => handleChange("jadwal", e.target.value)}
            required
          />

          <TextInput
            label="Jadwal Libur"
            placeholder="Masukkan jadwal libur"
            value={formData.jadwalLibur}
            onChange={(e) => handleChange("jadwalLibur", e.target.value)}
            required
          />

          <TimeInput
            label="Jam Buka Operasional"
            ref={refBuka}
            rightSection={picker(refBuka)}
            value={formData.jamBukaOperasional}
            onChange={(e) => handleChange("jamBukaOperasional", e.target.value)}
            required
          />

          <TimeInput
            label="Jam Tutup Operasional"
            ref={refTutup}
            rightSection={picker(refTutup)}
            value={formData.jamTutupOperasional}
            onChange={(e) => handleChange("jamTutupOperasional", e.target.value)}
            required
          />

          <TimeInput
            label="Jam Buka Hari Libur"
            ref={refBukaLibur}
            rightSection={picker(refBukaLibur)}
            value={formData.jamBukaLibur}
            onChange={(e) => handleChange("jamBukaLibur", e.target.value)}
            required
          />

          <TimeInput
            label="Jam Tutup Hari Libur"
            ref={refTutupLibur}
            rightSection={picker(refTutupLibur)}
            value={formData.jamTutupLibur}
            onChange={(e) => handleChange("jamTutupLibur", e.target.value)}
            required
          />
          {/* Tombol Simpan */}
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

export default EditDokterTenagaMedis;
