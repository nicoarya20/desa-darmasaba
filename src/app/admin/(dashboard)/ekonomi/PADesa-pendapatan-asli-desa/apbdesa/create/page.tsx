'use client';

import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
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
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateAPBDesa() {
  const apbDesaState = useProxy(PendapatanAsliDesa.ApbDesa);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    apbDesaState.create.form = {
      tahun: 0,
      pendapatanIds: [],
      belanjaIds: [],
      pembiayaanIds: [],
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await apbDesaState.create.submit();
      resetForm();
      router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa');
    } catch (error) {
      console.error('Error creating APB Desa:', error);
      toast.error('Gagal membuat APB Desa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah APB Desa
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
            type="number"
            value={apbDesaState.create.form.tahun}
            onChange={(val) => {
              apbDesaState.create.form.tahun = Number(val.target.value);
            }}
            label={<Text fz="sm" fw="bold">Tahun</Text>}
            placeholder="Masukkan tahun anggaran"
            required
          />

          <SelectPendapatan
            selectedIds={apbDesaState.create.form.pendapatanIds}
            onSelectionChange={(ids) => {
              apbDesaState.create.form.pendapatanIds = ids;
            }}
          />

          <SelectBelanja
            selectedIds={apbDesaState.create.form.belanjaIds}
            onSelectionChange={(ids) => {
              apbDesaState.create.form.belanjaIds = ids;
            }}
          />

          <SelectPembiayaan
            selectedIds={apbDesaState.create.form.pembiayaanIds}
            onSelectionChange={(ids) => {
              apbDesaState.create.form.pembiayaanIds = ids;
            }}
          />

          {/* Action */}
          <Group justify="right">
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

  /* ---------- Select Pendapatan ---------- */
  interface SelectPendapatanProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }
  function SelectPendapatan({ selectedIds = [], onSelectionChange }: SelectPendapatanProps) {
    const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);

    useShallowEffect(() => {
      pendapatanState.findMany.load();
    }, []);

    if (!pendapatanState.findMany.data) {
      return <Skeleton height={38} />;
    }

    return (
      <MultiSelect
        label={<Text fz="sm" fw="bold">Pendapatan</Text>}
        data={pendapatanState.findMany.data.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        value={selectedIds}
        onChange={onSelectionChange}
        searchable
        clearable
        placeholder="Pilih pendapatan..."
        nothingFoundMessage="Tidak ditemukan"
      />
    );
  }

  /* ---------- Select Belanja ---------- */
  interface SelectBelanjaProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }
  function SelectBelanja({ selectedIds = [], onSelectionChange }: SelectBelanjaProps) {
    const belanjaState = useProxy(PendapatanAsliDesa.belanja);

    useShallowEffect(() => {
      belanjaState.findMany.load();
    }, []);

    if (!belanjaState.findMany.data) {
      return <Skeleton height={38} />;
    }

    return (
      <MultiSelect
        label={<Text fz="sm" fw="bold">Belanja</Text>}
        data={belanjaState.findMany.data.map((b) => ({
          value: b.id,
          label: b.name,
        }))}
        value={selectedIds}
        onChange={onSelectionChange}
        searchable
        clearable
        placeholder="Pilih belanja..."
        nothingFoundMessage="Tidak ditemukan"
      />
    );
  }

  /* ---------- Select Pembiayaan ---------- */
  interface SelectPembiayaanProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }
  function SelectPembiayaan({ selectedIds = [], onSelectionChange }: SelectPembiayaanProps) {
    const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);

    useShallowEffect(() => {
      pembiayaanState.findMany.load();
    }, []);

    if (!pembiayaanState.findMany.data) {
      return <Skeleton height={38} />;
    }

    return (
      <MultiSelect
        label={<Text fz="sm" fw="bold">Pembiayaan</Text>}
        data={pembiayaanState.findMany.data.map((b) => ({
          value: b.id,
          label: b.name,
        }))}
        value={selectedIds}
        onChange={onSelectionChange}
        searchable
        clearable
        placeholder="Pilih pembiayaan..."
        nothingFoundMessage="Tidak ditemukan"
      />
    );
  }
}

export default CreateAPBDesa;
