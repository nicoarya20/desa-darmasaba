'use client'
import SelectIconProgram from '@/app/admin/(dashboard)/_com/selectIcon';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  Paper,
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

function CreateKontakDaruratKeamanan() {
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useShallowEffect(() => {
    kontakDarurat.kontakDaruratItem.findMany.load();
  }, []);

  const resetForm = () => {
    kontakState.create.form = {
      nama: '',
      icon: '',
      kategoriId: []
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await kontakState.create.create();
      resetForm();
      router.push('/admin/keamanan/kontak-darurat/kontak-darurat-keamanan');
    } catch (error) {
      console.error('Error creating kontak darurat:', error);
      toast.error('Terjadi kesalahan saat menambah kontak darurat');
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
          Tambah Kontak Darurat Keamanan
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
          {/* Input Nama Kategori */}
          <TextInput
            value={kontakState.create.form.nama}
            onChange={(val) => {
              kontakState.create.form.nama = val.target.value;
            }}
            label={<Text fw="bold" fz="sm">Nama Kategori Darurat</Text>}
            placeholder="Masukkan nama kategori darurat"
            required
          />

          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Kontak Darurat</Text>
            <SelectIconProgram onChange={(value) => kontakState.create.form.icon = value} />
          </Box>

          <MultiSelect
            value={kontakState.create.form.kategoriId}
            onChange={(val) => {
              kontakState.create.form.kategoriId = val;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Kontak Item</Text>}
            placeholder='Pilih kontak item'
            data={
              kontakDarurat.kontakDaruratItem.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []
            }
          />

          {/* Tombol Submit */}
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
}

export default CreateKontakDaruratKeamanan;
