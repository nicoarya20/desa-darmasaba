'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Button, MultiSelect, Paper, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function CreateAPBDesa() {
  const apbDesaState = useProxy(PendapatanAsliDesa.ApbDesa)
  const router = useRouter()

  const resetForm = () => {
    apbDesaState.create.form = {
      tahun: 0,
      pendapatanIds: [],
      belanjaIds: [],
      pembiayaanIds: [],
    }
  }

  const handleSubmit = async () => {
    await apbDesaState.create.submit()
    resetForm()
    router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa")
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Create APB Desa</Title>
          <TextInput
            type='number'
            value={apbDesaState.create.form.tahun}
            onChange={(val) => {
              apbDesaState.create.form.tahun = Number(val.target.value);
            }}
            label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
            placeholder="masukkan tahun"
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
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
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

export default CreateAPBDesa;
