'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
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

function CreateJadwalKegiatan() {
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateJadwalKegiatan.create.form = {
      content: '',
      informasiJadwalKegiatan: {
        name: '',
        tanggal: '',
        waktu: '',
        lokasi: '',
      },
      deskripsiJadwalKegiatan: {
        deskripsi: '',
      },
      layananJadwalKegiatan: {
        content: '',
      },
      syaratKetentuanJadwalKegiatan: {
        content: '',
      },
      dokumenJadwalKegiatan: {
        content: '',
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await stateJadwalKegiatan.create.submit();
      toast.success('Data berhasil disimpan');
      resetForm();
      router.push('/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan data jadwal kegiatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md" component="form" onSubmit={handleSubmit}>
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
          Tambah Jadwal Kegiatan
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
          <TextInput
            label="Nama Jadwal Kegiatan"
            placeholder="Masukkan nama jadwal kegiatan"
            value={stateJadwalKegiatan.create.form.content}
            onChange={(e) => {
              stateJadwalKegiatan.create.form.content = e.target.value;
            }}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={4}>Deskripsi Jadwal Kegiatan</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.deskripsiJadwalKegiatan.deskripsi}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.deskripsiJadwalKegiatan.deskripsi = e;
              }}
            />
          </Box>

          <Box>
            <Text fz="md" fw="bold" mb="sm">Informasi Jadwal Kegiatan</Text>
            <TextInput
              label="Nama"
              required
              placeholder="Masukkan nama"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.name}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.name = e.target.value;
              }}
            />
            <TextInput
              type="date"
              required
              label="Tanggal"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.tanggal}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.tanggal = e.target.value;
              }}
            />
            <TextInput
              label="Waktu"
              required
              placeholder="Masukkan waktu"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.waktu}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.waktu = e.target.value;
              }}
            />
            <TextInput
              label="Lokasi"
              required
              placeholder="Masukkan lokasi"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.lokasi}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.lokasi = e.target.value;
              }}
            />
          </Box>

          <Box>
            <Text fz="md" fw="bold" mb="sm">Layanan Jadwal Kegiatan</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.layananJadwalKegiatan.content}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.layananJadwalKegiatan.content = e;
              }}
            />
          </Box>

          <Box>
            <Text fz="md" fw="bold" mb="sm">Syarat & Ketentuan</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.syaratKetentuanJadwalKegiatan.content}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.syaratKetentuanJadwalKegiatan.content = e;
              }}
            />
          </Box>

          <Box>
            <Text fz="md" fw="bold" mb="sm">Dokumen Yang Perlu Dibawa</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.dokumenJadwalKegiatan.content}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.dokumenJadwalKegiatan.content = e;
              }}
            />
          </Box>
          {/* Save Button */}
          <Group justify="right">
            {/* Tombol Batal */}
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

export default CreateJadwalKegiatan;
