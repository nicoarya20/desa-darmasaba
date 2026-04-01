'use client';
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
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import lowonganKerjaState from '../../../_state/ekonomi/lowongan-kerja';
import { useState } from 'react';
import { toast } from 'react-toastify';

function CreateLowonganKerja() {
  const lowonganState = useProxy(lowonganKerjaState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      lowonganState.create.form.posisi?.trim() !== '' &&
      lowonganState.create.form.namaPerusahaan?.trim() !== '' &&
      lowonganState.create.form.notelp?.trim() !== '' &&
      lowonganState.create.form.lokasi?.trim() !== '' &&
      lowonganState.create.form.tipePekerjaan?.trim() !== '' &&
      lowonganState.create.form.gaji?.trim() !== '' &&
      !isHtmlEmpty(lowonganState.create.form.deskripsi) &&
      !isHtmlEmpty(lowonganState.create.form.kualifikasi)
    );
  };

  const resetForm = () => {
    lowonganState.create.form = {
      posisi: '',
      namaPerusahaan: '',
      lokasi: '',
      tipePekerjaan: '',
      gaji: '',
      deskripsi: '',
      kualifikasi: '',
      notelp: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await lowonganState.create.create();
      resetForm();
      router.push('/admin/ekonomi/lowongan-kerja-lokal');
    } catch (error) {
      console.error('Error creating lowongan kerja:', error);
      toast.error(
        error instanceof Error ? error.message : 'Gagal membuat lowongan kerja'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
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
            value={lowonganState.create.form.posisi}
            onChange={(val) =>
              (lowonganState.create.form.posisi = val.target.value)
            }
            label="Posisi"
            placeholder="Masukkan posisi"
            required
          />
          <TextInput
            value={lowonganState.create.form.namaPerusahaan}
            onChange={(val) =>
              (lowonganState.create.form.namaPerusahaan = val.target.value)
            }
            label="Nama Perusahaan"
            placeholder="Masukkan nama perusahaan"
            required
          />
          <TextInput
            value={lowonganState.create.form.notelp}
            onChange={(val) =>
              (lowonganState.create.form.notelp = val.target.value)
            }
            label="Nomor Yang Dapat Dihubungi"
            placeholder="Masukkan nomor yang dapat dihubungi"
            required
          />
          <TextInput
            value={lowonganState.create.form.lokasi}
            onChange={(val) =>
              (lowonganState.create.form.lokasi = val.target.value)
            }
            label="Lokasi"
            placeholder="Masukkan lokasi"
            required
          />
          <TextInput
            value={lowonganState.create.form.tipePekerjaan}
            onChange={(val) =>
              (lowonganState.create.form.tipePekerjaan = val.target.value)
            }
            label="Tipe Pekerjaan"
            placeholder="Masukkan tipe pekerjaan"
            required
          />
          <TextInput
            value={lowonganState.create.form.gaji}
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

export default CreateLowonganKerja;
