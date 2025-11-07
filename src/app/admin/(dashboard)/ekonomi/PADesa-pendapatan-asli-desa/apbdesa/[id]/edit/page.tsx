/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
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
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditAPBDesa() {
  const apbState = useProxy(PendapatanAsliDesa.ApbDesa);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    tahun: '',
    pendapatanIds: [] as string[],
    belanjaIds: [] as string[],
    pembiayaanIds: [] as string[],
  });

  // Load APB desa by id → hanya update formData, bukan global state
  useEffect(() => {
    const loadAPBdesa = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await apbState.update.load(id);
        if (data) {
          setFormData({
            tahun: String(data.tahun || ''),
            pendapatanIds: data.pendapatan?.map((p: any) => p.id) || [],
            belanjaIds: data.belanja?.map((b: any) => b.id) || [],
            pembiayaanIds: data.pembiayaan?.map((p: any) => p.id) || [],
          });
        }
      } catch (error) {
        console.error("Error loading APBdesa:", error);
        toast.error("Gagal memuat data APBdesa");
      }
    };

    loadAPBdesa();
  }, [params?.id]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // update global state cuma pas submit
      apbState.update.form = {
        ...apbState.update.form,
        tahun: Number(formData.tahun),
        pendapatanIds: formData.pendapatanIds,
        belanjaIds: formData.belanjaIds,
        pembiayaanIds: formData.pembiayaanIds,
      };

      await apbState.update.update();
      toast.success("APB Desa berhasil diperbarui!");
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa");
    } catch (error) {
      console.error("Error updating APBdesa:", error);
      toast.error("Terjadi kesalahan saat memperbarui APBdesa");
    }
  };

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
            onChange={(e) => handleChange("tahun", e.target.value)}
            label={<Text fz="sm" fw="bold">Tahun</Text>}
            placeholder="Masukkan tahun anggaran"
            required
          />

          {/* Selects */}
          <SelectPendapatan
            selectedIds={formData.pendapatanIds}
            onSelectionChange={(ids) => handleChange("pendapatanIds", ids)}
          />

          <SelectBelanja
            selectedIds={formData.belanjaIds}
            onSelectionChange={(ids) => handleChange("belanjaIds", ids)}
          />

          <SelectPembiayaan
            selectedIds={formData.pembiayaanIds}
            onSelectionChange={(ids) => handleChange("pembiayaanIds", ids)}
          />

          {/* Save Button */}
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

  /* --- Sub Components --- */

  function SelectPendapatan({
    selectedIds,
    onSelectionChange,
  }: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }) {
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
        data={pendapatanState.findMany.data.map((p: any) => ({
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

  function SelectBelanja({
    selectedIds,
    onSelectionChange,
  }: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }) {
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
        data={belanjaState.findMany.data.map((b: any) => ({
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

  function SelectPembiayaan({
    selectedIds,
    onSelectionChange,
  }: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }) {
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
        data={pembiayaanState.findMany.data.map((p: any) => ({
          value: p.id,
          label: p.name,
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

export default EditAPBDesa;
