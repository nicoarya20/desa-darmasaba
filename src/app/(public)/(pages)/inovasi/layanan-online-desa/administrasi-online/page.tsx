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
  const state = useProxy(layananonlineDesa, { sync: true });

  // Batas minimum karakter agar tombol Simpan hanya aktif saat data valid.
  const MIN = { name: 3, alamat: 3 };

  // Check if form is valid.
  // Pakai panjang minimum, bukan `x?.trim() !== ''`: field default '' membuat
  // `!== ''` selalu lolos sehingga tombol tak pernah benar-benar tergerbang.
  const isFormValid = () => {
    const f = state.administrasiOnline.create.form;
    const telpDigits = (f.nomorTelepon || '').replace(/\D/g, '');
    return (
      (f.name || '').trim().length >= MIN.name &&
      (f.alamat || '').trim().length >= MIN.alamat &&
      telpDigits.length >= 10 &&
      !!(f.jenisLayananId || '').trim()
    );
  };

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
    const success = await state.administrasiOnline.create.create();
    if (success) {
      resetForm();
      close(); // Tutup modal hanya setelah submit sukses
    }
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
              placeholder="Masukkan nama (minimal 3 karakter)"
              value={state.administrasiOnline.create.form.name || ''}
              onChange={(val) =>
                (state.administrasiOnline.create.form.name = val.target.value.replace(/[0-9]/g, ''))
              }
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Alamat</Text>}
              placeholder="Masukkan alamat (minimal 3 karakter)"
              value={state.administrasiOnline.create.form.alamat || ''}
              onChange={(val) => (state.administrasiOnline.create.form.alamat = val.target.value)}
            />
            <TextInput
              inputMode="numeric"
              maxLength={13}
              label={<Text fz="sm" fw="bold">Nomor Telepon</Text>}
              placeholder="Masukkan nomor telepon"
              value={state.administrasiOnline.create.form.nomorTelepon}
              onChange={(val) =>
                (state.administrasiOnline.create.form.nomorTelepon = val.target.value
                  .replace(/\D/g, '')
                  .slice(0, 13))
              }
            />
            <Select
              value={state.administrasiOnline.create.form.jenisLayananId}
              onChange={(val) => {
                state.administrasiOnline.create.form.jenisLayananId = val ?? "";
              }}
              label={<Text fw={"bold"} fz={"sm"}>Jenis Layanan</Text>}
              placeholder="Pilih jenis layanan"
              data={
                state.jenisLayanan.findMany.data?.map((v) => ({
                  value: v.id,
                  label: v.nama,
                })) || []
              }
            />

            <Button 
              bg={colors['blue-button']} 
              onClick={handleSubmit}
              disabled={!isFormValid()}
            >
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
}

export default AdministrasiOnline;
