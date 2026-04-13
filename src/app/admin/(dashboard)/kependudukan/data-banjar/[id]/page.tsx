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
  NumberInput,
  TextInput
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import dataBanjar from '../../../_state/kependudukan/data-banjar';

interface DataBanjarForm {
  nama: string;
  penduduk: number;
  kk: number;
  miskin: number;
  tahun: number;
}

export default function EditDataBanjar() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const stateDataBanjar = useProxy(dataBanjar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DataBanjarForm>({
    nama: '',
    penduduk: 0,
    kk: 0,
    miskin: 0,
    tahun: new Date().getFullYear(),
  });
  const [originalData, setOriginalData] = useState<DataBanjarForm>({
    nama: '',
    penduduk: 0,
    kk: 0,
    miskin: 0,
    tahun: new Date().getFullYear(),
  });

  const currentYear = new Date().getFullYear();

  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.penduduk !== null &&
      formData.penduduk >= 0 &&
      formData.kk !== null &&
      formData.kk >= 0 &&
      formData.miskin !== null &&
      formData.miskin >= 0 &&
      formData.tahun !== null
    );
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsSubmitting(true);
        stateDataBanjar.update.id = id;
        await stateDataBanjar.findUnique.load(id);

        const data = stateDataBanjar.findUnique.data as DataBanjarForm | null;
        if (data) {
          setFormData({
            nama: data.nama ?? '',
            penduduk: Number(data.penduduk ?? 0),
            kk: Number(data.kk ?? 0),
            miskin: Number(data.miskin ?? 0),
            tahun: Number(data.tahun ?? currentYear),
          });
          setOriginalData({
            nama: data.nama ?? '',
            penduduk: Number(data.penduduk ?? 0),
            kk: Number(data.kk ?? 0),
            miskin: Number(data.miskin ?? 0),
            tahun: Number(data.tahun ?? currentYear),
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

  const handleChange = useCallback(
    (field: keyof DataBanjarForm) =>
      (value: string | number | undefined) => {
        const val =
          field === 'penduduk' || field === 'kk' || field === 'miskin' || field === 'tahun'
            ? Number(value || 0)
            : value;

        setFormData((prev) => ({ ...prev, [field]: val as never }));
      },
    []
  );

  const handleChangeText = useCallback(
    (field: keyof DataBanjarForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.currentTarget.value as never }));
      },
    []
  );

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      penduduk: Number(originalData.penduduk),
      kk: Number(originalData.kk),
      miskin: Number(originalData.miskin),
      tahun: Number(originalData.tahun),
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateDataBanjar.update.id = id;
      stateDataBanjar.update.form = { ...formData };

      await stateDataBanjar.update.submit();

      toast.success('Data berhasil diperbarui');
      router.push('/admin/kependudukan/data-banjar');
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
          Edit Data Banjar
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
            label="Nama Banjar"
            placeholder="Masukkan nama banjar"
            value={formData.nama}
            onChange={handleChangeText('nama')}
            required
          />

          <NumberInput
            label="Jumlah Penduduk"
            placeholder="Masukkan jumlah penduduk"
            value={formData.penduduk}
            onChange={handleChange('penduduk')}
            min={0}
            required
          />

          <NumberInput
            label="Jumlah KK"
            placeholder="Masukkan jumlah KK"
            value={formData.kk}
            onChange={handleChange('kk')}
            min={0}
            required
          />

          <NumberInput
            label="Jumlah Penduduk Miskin"
            placeholder="Masukkan jumlah penduduk miskin"
            value={formData.miskin}
            onChange={handleChange('miskin')}
            min={0}
            required
          />

          <NumberInput
            label="Tahun"
            placeholder="Masukkan tahun"
            value={formData.tahun}
            onChange={handleChange('tahun')}
            min={2000}
            max={currentYear + 1}
            required
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
