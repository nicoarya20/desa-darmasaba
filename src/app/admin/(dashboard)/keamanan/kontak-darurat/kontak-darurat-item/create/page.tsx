'use client'
import SelectIconProgram from '@/app/admin/(dashboard)/_com/selectIcon';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateKontakItem() {
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      kontakState.create.form.nama?.trim() !== '' &&
      kontakState.create.form.nomorTelepon?.trim() !== '' &&
      kontakState.create.form.icon?.trim() !== ''
    );
  };

  const resetForm = () => {
    kontakState.create.form = {
      nama: '',
      icon: '',
      nomorTelepon: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await kontakState.create.create();
      resetForm();
      router.push('/admin/keamanan/kontak-darurat/kontak-darurat-item');
    } catch (error) {
      console.error("Error creating kontak darurat item:", error);
      toast.error("Gagal menambahkan kontak darurat item");
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
          Tambah Kontak Darurat Item
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
            label={<Text fw="bold" fz="sm">Nama Kontak Darurat</Text>}
            placeholder="Masukkan nama kontak darurat"
            required
          />

          <TextInput
            label={<Text fw="bold" fz="sm">Nomor Telepon Kontak</Text>}
            placeholder="Masukkan nomor telepon"
            value={kontakState.create.form.nomorTelepon}
            onChange={(val) => {
              kontakState.create.form.nomorTelepon = val.target.value;
            }}
            required
          />

          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Kontak Darurat Item</Text>
            <SelectIconProgram onChange={(value) => kontakState.create.form.icon = value} />
          </Box>

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

export default CreateKontakItem;
