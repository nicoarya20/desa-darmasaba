/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Title,
  TextInput,
  Select,
  Textarea
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import migrasiPenduduk from '../../../_state/kependudukan/migrasi-penduduk';

interface MigrasiPendudukForm {
  jenis: string;
  nama: string;
  tanggal: string;
  asalTujuan: string;
  alasan: string;
}

export default function EditMigrasiPenduduk() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const stateMigrasiPenduduk = useProxy(migrasiPenduduk);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MigrasiPendudukForm>({
    jenis: '',
    nama: '',
    tanggal: '',
    asalTujuan: '',
    alasan: '',
  });
  const [originalData, setOriginalData] = useState<MigrasiPendudukForm>({
    jenis: '',
    nama: '',
    tanggal: '',
    asalTujuan: '',
    alasan: '',
  });

  const jenisOptions = [
    { value: 'MASUK', label: 'Masuk' },
    { value: 'KELUAR', label: 'Keluar' },
  ];

  const isFormValid = () => {
    return (
      formData.jenis?.trim() !== '' &&
      formData.nama?.trim() !== '' &&
      formData.tanggal?.trim() !== '' &&
      formData.asalTujuan?.trim() !== ''
    );
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsSubmitting(true);
        stateMigrasiPenduduk.update.id = id;
        await stateMigrasiPenduduk.findUnique.load(id);

        const data = stateMigrasiPenduduk.findUnique.data as any;
        if (data) {
          const asalTujuan = data.jenis === 'MASUK' ? (data.asal || '') : (data.tujuan || '');
          
          setFormData({
            jenis: data.jenis ?? '',
            nama: data.nama ?? '',
            tanggal: data.tanggal ? new Date(data.tanggal).toISOString().split('T')[0] : '',
            asalTujuan: asalTujuan,
            alasan: data.alasan ?? '',
          });
          setOriginalData({
            jenis: data.jenis ?? '',
            nama: data.nama ?? '',
            tanggal: data.tanggal ? new Date(data.tanggal).toISOString().split('T')[0] : '',
            asalTujuan: asalTujuan,
            alasan: data.alasan ?? '',
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setIsSubmitting(false);
      }
    };

    loadData();
  }, [id]);

  const handleChangeText = useCallback(
    (field: keyof MigrasiPendudukForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.currentTarget.value }));
      },
    []
  );

  const handleChangeSelect = useCallback(
    (field: keyof MigrasiPendudukForm) =>
      (value: string | null) => {
        setFormData((prev) => ({ ...prev, [field]: value || '' }));
      },
    []
  );

  const handleResetForm = () => {
    setFormData({
      jenis: originalData.jenis,
      nama: originalData.nama,
      tanggal: originalData.tanggal,
      asalTujuan: originalData.asalTujuan,
      alasan: originalData.alasan,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateMigrasiPenduduk.update.id = id;
      stateMigrasiPenduduk.update.form = { ...formData };

      await stateMigrasiPenduduk.update.submit();

      toast.success('Data berhasil diperbarui');
      router.push('/admin/kependudukan/migrasi-penduduk');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
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
          Edit Migrasi Penduduk
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
          <Select
            label="Jenis Migrasi"
            placeholder="Pilih jenis migrasi"
            data={jenisOptions}
            value={formData.jenis}
            onChange={handleChangeSelect('jenis')}
            required
          />

          <TextInput
            label="Nama"
            placeholder="Masukkan nama lengkap"
            value={formData.nama}
            onChange={handleChangeText('nama')}
            required
          />

          <DatePickerInput
            label="Tanggal"
            placeholder="Pilih tanggal"
            value={formData.tanggal ? new Date(formData.tanggal) : null}
            onChange={(val: string | null) => {
              setFormData((prev) => ({
                ...prev,
                tanggal: val || '',
              }));
            }}
            valueFormat="YYYY-MM-DD"
            required
          />

          <TextInput
            label={formData.jenis === 'MASUK' ? 'Asal' : 'Tujuan'}
            placeholder={formData.jenis === 'MASUK' ? 'Masukkan asal' : 'Masukkan tujuan'}
            value={formData.asalTujuan}
            onChange={handleChangeText('asalTujuan')}
            required
          />

          <Textarea
            label="Alasan"
            placeholder="Masukkan alasan (opsional)"
            value={formData.alasan}
            onChange={handleChangeText('alasan')}
            autosize
            minRows={2}
          />

          <Group justify="flex-end">
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
