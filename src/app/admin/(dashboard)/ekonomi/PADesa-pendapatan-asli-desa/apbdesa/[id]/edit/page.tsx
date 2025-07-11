/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Button, MultiSelect, Paper, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
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
    tahun: apbState.update.form.tahun || '',
    pendapatanIds: apbState.update.form.pendapatanIds || [],
    belanjaIds: apbState.update.form.belanjaIds || [],
    pembiayaanIds: apbState.update.form.pembiayaanIds || [],
  });

  // Load APB desa by id saat pertama kali
  useEffect(() => {
    const loadAPBdesa = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await apbState.update.load(id);
        if (data) {
          setFormData({
            tahun: data.tahun || 0,
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
  }, [params?.id]); // ✅ hapus beritaState dari dependency

  const handleSubmit = async () => {

    try {
      // Update global state with form data
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
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit APB Desa</Title>
          <TextInput
            type='number'
            value={formData.tahun}
            onChange={(val) => {
              setFormData({ ...formData, tahun: val.target.value });
            }}
            label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
            placeholder="masukkan tahun"
          />
          <SelectPendapatan
            selectedIds={formData.pendapatanIds}
            onSelectionChange={(ids) => {
              setFormData({ ...formData, pendapatanIds: ids });
            }}
          />
          <SelectBelanja
            selectedIds={formData.belanjaIds}
            onSelectionChange={(ids) => {
              setFormData({ ...formData, belanjaIds: ids });
            }}
          />
          <SelectPembiayaan
            selectedIds={formData.pembiayaanIds}
            onSelectionChange={(ids) => {
              setFormData({ ...formData, pembiayaanIds: ids });
            }}
          />
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );


  /* Select Pendapatan */
  interface SelectPendapatanProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }

  function SelectPendapatan({
    selectedIds = [],
    onSelectionChange,
  }: SelectPendapatanProps) {
    const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);

    useShallowEffect(() => {
      pendapatanState.findMany.load().then(() => {
        console.log("Pendapatan berhasil dimuat:", pendapatanState.findMany.data);
      });
    }, []);

    if (!pendapatanState.findMany.data) {
      return <Skeleton height={38} />;
    }

    return (
      <MultiSelect
        label={<Text fz={"sm"} fw={"bold"}>Pendapatan</Text>}
        data={pendapatanState.findMany.data.map(p => ({
          value: p.id,
          label: p.name
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

  /* Select Belanja */
  interface SelectBelanjaProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }

  function SelectBelanja({
    selectedIds = [],
    onSelectionChange,
  }: SelectBelanjaProps) {
    const belanjaState = useProxy(PendapatanAsliDesa.belanja);

    useShallowEffect(() => {
      belanjaState.findMany.load().then(() => {
        console.log("Belanja berhasil dimuat:", belanjaState.findMany.data);
      });
    }, []);

    if (!belanjaState.findMany.data) {
      return <Skeleton height={38} />;
    }

    return (
      <MultiSelect
        label={<Text fz={"sm"} fw={"bold"}>Belanja</Text>}
        data={belanjaState.findMany.data.map(b => ({
          value: b.id,
          label: b.name
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

  /* Select Pembiayaan */
  interface SelectPembiayaanProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  }

  function SelectPembiayaan({
    selectedIds = [],
    onSelectionChange,
  }: SelectPembiayaanProps) {
    const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);

    useShallowEffect(() => {
      pembiayaanState.findMany.load().then(() => {
        console.log("Pembiayaan berhasil dimuat:", pembiayaanState.findMany.data);
      });
    }, []);

    if (!pembiayaanState.findMany.data) {
      return <Skeleton height={38} />;
    }

    return (
      <MultiSelect
        label={<Text fz={"sm"} fw={"bold"}>Pembiayaan</Text>}
        data={pembiayaanState.findMany.data.map(b => ({
          value: b.id,
          label: b.name
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
