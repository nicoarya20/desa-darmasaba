/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFileCheckFilled } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function AdministrasiOnline() {
  const [opened, { open, close }] = useDisclosure(false);
  const state = useProxy(layananonlineDesa);

  useEffect(() => {
    // ✅ Panggil load data jenis layanan dari backend
    if (!state.jenisLayanan.findMany.data) {
      state.jenisLayanan.findMany.load();
    }
  }, []);

  const resetForm = () => {
    state.administrasiOnline.create.form = {
      name: '',
      alamat: '',
      nomorTelepon: '',
      jenisLayananId: '',
    };
  };

  const handleSubmit = async () => {
    await state.administrasiOnline.create.create();
    resetForm();
    close(); // Tutup modal setelah submit
  };

  return (
    <Box>
      <Stack>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.8 }} onClick={open}>
          <Paper p="xl" withBorder>
            <Box>
              <IconFileCheckFilled size={50} color={colors['blue-button']} />
            </Box>
            <Text fz="h3" fw="bold" c={colors['blue-button']}>
              Administrasi Online
            </Text>
            <Text fz="lg" c="black">
              Pengurusan surat dan dokumen secara digital tanpa perlu datang ke kantor desa
            </Text>
          </Paper>
        </motion.div>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>Ajukan Administrasi Online</Title>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama</Text>}
              placeholder="masukkan nama"
              onChange={(val) => (state.administrasiOnline.create.form.name = val.target.value)}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Alamat</Text>}
              placeholder="masukkan alamat"
              onChange={(val) => (state.administrasiOnline.create.form.alamat = val.target.value)}
            />
            <TextInput
              type="number"
              label={<Text fz="sm" fw="bold">Nomor Telepon</Text>}
              placeholder="masukkan nomor telepon"
              onChange={(val) => (state.administrasiOnline.create.form.nomorTelepon = val.target.value)}
            />
            <Select
              value={state.administrasiOnline.create.form.jenisLayananId}
              onChange={(val) => {
                state.administrasiOnline.create.form.jenisLayananId = val ?? "";
              }}
              label={<Text fw={"bold"} fz={"sm"}>Jenis Layanan</Text>}
              placeholder="Pilih kategori produk"
              data={
                state.jenisLayanan.findMany.data?.map((v) => ({
                  value: v.id,
                  label: v.nama,
                })) || []
              }
            />

            <Button bg={colors['blue-button']} onClick={handleSubmit}>
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
}

export default AdministrasiOnline;
