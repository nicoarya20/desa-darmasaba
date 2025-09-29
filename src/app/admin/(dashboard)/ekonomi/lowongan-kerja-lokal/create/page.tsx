'use client';
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
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import lowonganKerjaState from '../../../_state/ekonomi/lowongan-kerja';

function CreateLowonganKerja() {
  const lowonganState = useProxy(lowonganKerjaState);
  const router = useRouter();

  const resetForm = () => {
    lowonganState.create.form = {
      posisi: '',
      namaPerusahaan: '',
      lokasi: '',
      tipePekerjaan: '',
      gaji: '',
      deskripsi: '',
      kualifikasi: '',
    };
  };

  const handleSubmit = async () => {
    await lowonganState.create.create();
    resetForm();
    router.push('/admin/ekonomi/lowongan-kerja-lokal');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol kembali */}
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
          Tambah Lowongan Kerja Lokal
        </Title>
      </Group>

      {/* Card Form */}
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
            defaultValue={lowonganState.create.form.posisi}
            onChange={(val) =>
              (lowonganState.create.form.posisi = val.target.value)
            }
            label="Posisi"
            placeholder="Masukkan posisi"
            required
          />
          <TextInput
            defaultValue={lowonganState.create.form.namaPerusahaan}
            onChange={(val) =>
              (lowonganState.create.form.namaPerusahaan = val.target.value)
            }
            label="Nama Perusahaan"
            placeholder="Masukkan nama perusahaan"
            required
          />
          <TextInput
            defaultValue={lowonganState.create.form.lokasi}
            onChange={(val) =>
              (lowonganState.create.form.lokasi = val.target.value)
            }
            label="Lokasi"
            placeholder="Masukkan lokasi"
            required
          />
          <TextInput
            defaultValue={lowonganState.create.form.tipePekerjaan}
            onChange={(val) =>
              (lowonganState.create.form.tipePekerjaan = val.target.value)
            }
            label="Tipe Pekerjaan"
            placeholder="Masukkan tipe pekerjaan"
            required
          />
          <TextInput
            defaultValue={lowonganState.create.form.gaji}
            onChange={(val) =>
              (lowonganState.create.form.gaji = val.target.value)
            }
            label="Gaji (per bulan)"
            placeholder="Masukkan gaji"
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Lowongan Kerja
            </Text>
            <CreateEditor
              value={lowonganState.create.form.deskripsi}
              onChange={(val) => {
                lowonganState.create.form.deskripsi = val;
              }}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Kualifikasi Lowongan Kerja
            </Text>
            <CreateEditor
              value={lowonganState.create.form.kualifikasi}
              onChange={(val) => {
                lowonganState.create.form.kualifikasi = val;
              }}
            />
          </Box>

          {/* Tombol Simpan */}
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

export default CreateLowonganKerja;
