'use client'
import SelectIconProgram from '@/app/admin/(dashboard)/_com/selectIcon';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function CreateKontakItem() {
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem);
  const router = useRouter();
  const resetForm = () => {
    kontakState.create.form = {
      nama: '',
      icon: '',
      nomorTelepon: '',
    };
  };

  const handleSubmit = async () => {
    await kontakState.create.create();
    resetForm();
    router.push('/admin/keamanan/kontak-darurat/kontak-darurat-item');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
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
            defaultValue={kontakState.create.form.nama}
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
            defaultValue={kontakState.create.form.nomorTelepon}
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
}

export default CreateKontakItem;
