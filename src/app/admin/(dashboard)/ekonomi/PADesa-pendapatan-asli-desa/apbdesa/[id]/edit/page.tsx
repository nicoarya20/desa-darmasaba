/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

// ==================== HELPERS ====================
const safeStringArray = (arr: any[]): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => item != null && item !== '')
    .map(item => String(item))
    .filter(item => item.trim() !== '');
};

const createEmptyForm = () => ({
  tahun: '',
  pendapatanIds: [] as string[],
  belanjaIds: [] as string[],
  pembiayaanIds: [] as string[],
});

// ==================== COMPONENT ====================
function EditAPBDesa() {
  const apbState = useProxy(PendapatanAsliDesa.ApbDesa);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState(createEmptyForm());
  const [originalData, setOriginalData] = useState(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ==================== LOAD DATA ====================
  useEffect(() => {
    const loadAPBdesa = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error('ID tidak valid');
        router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa');
        return;
      }

      try {
        setIsLoading(true);
        const data = await apbState.update.load(id);

        if (!data) {
          toast.error('Data APB Desa tidak ditemukan');
          return;
        }

        const normalized = {
          tahun: String(data.tahun || ''),
          pendapatanIds: safeStringArray(data.pendapatan?.map((p: any) => p.id) || []),
          belanjaIds: safeStringArray(data.belanja?.map((b: any) => b.id) || []),
          pembiayaanIds: safeStringArray(data.pembiayaan?.map((p: any) => p.id) || []),
        };

        setFormData(normalized);
        setOriginalData(normalized);
      } catch (err) {
        console.error('Error loading APBdesa:', err);
        toast.error('Gagal memuat data APB Desa');
      } finally {
        setIsLoading(false);
      }
    };

    loadAPBdesa();
  }, [params?.id]);

  // ==================== HANDLERS ====================
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData(originalData);
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.tahun.trim()) {
        toast.warning('Tahun harus diisi');
        return;
      }

      apbState.update.form = {
        ...apbState.update.form,
        tahun: Number(formData.tahun),
        pendapatanIds: safeStringArray(formData.pendapatanIds),
        belanjaIds: safeStringArray(formData.belanjaIds),
        pembiayaanIds: safeStringArray(formData.pembiayaanIds),
      };

      await apbState.update.update();
      toast.success('APB Desa berhasil diperbarui!');
      router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa');
    } catch (error) {
      console.error('Error updating APBdesa:', error);
      toast.error('Terjadi kesalahan saat memperbarui APB Desa');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== UI ====================
  if (isLoading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" type="dots" />
        <Text c="dimmed">Memuat data APB Desa...</Text>
      </Stack>
    );
  }

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit APB Desa
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
          {/* Tahun */}
          <TextInput
            type="number"
            value={formData.tahun}
            onChange={(e) => handleChange('tahun', e.target.value)}
            label={<Text fz="sm" fw="bold">Tahun</Text>}
            placeholder="Masukkan tahun anggaran"
            required
          />

          {/* Selects */}
          <SelectAPBItem
            label="Pendapatan"
            state={PendapatanAsliDesa.pendapatan}
            selectedIds={formData.pendapatanIds}
            onSelectionChange={(ids) => handleChange('pendapatanIds', ids)}
          />

          <SelectAPBItem
            label="Belanja"
            state={PendapatanAsliDesa.belanja}
            selectedIds={formData.belanjaIds}
            onSelectionChange={(ids) => handleChange('belanjaIds', ids)}
          />

          <SelectAPBItem
            label="Pembiayaan"
            state={PendapatanAsliDesa.pembiayaan}
            selectedIds={formData.pembiayaanIds}
            onSelectionChange={(ids) => handleChange('pembiayaanIds', ids)}
          />

          {/* Save Button */}
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

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

// ==================== SUB COMPONENT ====================
function SelectAPBItem({
  label,
  state,
  selectedIds,
  onSelectionChange,
}: {
  label: string;
  state: any;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) {
  const proxyState = useProxy(state);

  useShallowEffect(() => {
    proxyState.findMany.load();
  }, []);

  const data = proxyState.findMany.data;
  const isLoading = !data;

  const options =
    data
      ?.filter((item: any) => item?.id)
      .map((item: any) => ({
        value: String(item.id),
        label: String(item?.name || '(Tanpa Nama)'),
      })) || [];

  if (isLoading) {
    return (
      <Box>
        <Text fz="sm" fw="bold" mb={4}>{label}</Text>
        <Skeleton height={38} radius="sm" />
      </Box>
    );
  }

  if (options.length === 0) {
    return (
      <Alert color="gray" variant="light">
        <Text size="sm">
          Tidak ada data {label.toLowerCase()} tersedia.
        </Text>
      </Alert>
    );
  }

  return (
    <MultiSelect
      label={<Text fz="sm" fw="bold">{label}</Text>}
      data={options}
      value={selectedIds}
      onChange={(ids) => onSelectionChange(safeStringArray(ids))}
      searchable
      clearable
      placeholder={`Pilih ${label.toLowerCase()}...`}
      nothingFoundMessage="Tidak ditemukan"
    />
  );
}

export default EditAPBDesa;
