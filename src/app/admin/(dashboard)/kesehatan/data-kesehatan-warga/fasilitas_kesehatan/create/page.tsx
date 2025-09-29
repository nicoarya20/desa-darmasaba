'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
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
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateFasilitasKesehatan() {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();

  const resetForm = () => {
    stateFasilitasKesehatan.create.form = {
      name: '',
      informasiUmum: {
        fasilitas: '',
        alamat: '',
        jamOperasional: '',
      },
      layananUnggulan: {
        content: '',
      },
      dokterdanTenagaMedis: {
        name: '',
        specialist: '',
        jadwal: '',
      },
      fasilitasPendukung: {
        content: '',
      },
      prosedurPendaftaran: {
        content: '',
      },
      tarifDanLayanan: {
        layanan: '',
        tarif: '',
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await stateFasilitasKesehatan.create.submit();
    toast.success('Data berhasil disimpan');
    resetForm();
    router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md" component="form" onSubmit={handleSubmit}>
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
          Tambah Data Fasilitas Kesehatan
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
            label={"Nama Fasilitas Kesehatan"}
            placeholder="Masukkan nama fasilitas kesehatan"
            defaultValue={stateFasilitasKesehatan.create.form.name}
            onChange={(e) => (stateFasilitasKesehatan.create.form.name = e.target.value)}
            required
          />

          {/* Informasi Umum */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Informasi Umum</Text>
            <TextInput
              label="Fasilitas"
              placeholder="Masukkan fasilitas"
              defaultValue={stateFasilitasKesehatan.create.form.informasiUmum.fasilitas}
              onChange={(e) => (stateFasilitasKesehatan.create.form.informasiUmum.fasilitas = e.target.value)}
              required
            />
            <TextInput
              label="Alamat"
              placeholder="Masukkan alamat"
              defaultValue={stateFasilitasKesehatan.create.form.informasiUmum.alamat}
              onChange={(e) => (stateFasilitasKesehatan.create.form.informasiUmum.alamat = e.target.value)}
              required
            />
            <TextInput
              label="Jam Operasional"
              placeholder="Masukkan jam operasional"
              defaultValue={stateFasilitasKesehatan.create.form.informasiUmum.jamOperasional}
              onChange={(e) => (stateFasilitasKesehatan.create.form.informasiUmum.jamOperasional = e.target.value)}
              required
            />
          </Box>

          {/* Layanan Unggulan */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Layanan Unggulan</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.layananUnggulan.content}
              onChange={(val) => (stateFasilitasKesehatan.create.form.layananUnggulan.content = val)}
            />
          </Box>

          {/* Dokter dan Tenaga Medis */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Dokter dan Tenaga Medis</Text>
            <TextInput
              label="Nama Dokter"
              placeholder="Masukkan nama dokter"
              defaultValue={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.name}
              onChange={(e) => (stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.name = e.target.value)}
              required
            />
            <TextInput
              label="Spesialis"
              placeholder="Masukkan spesialis"
              defaultValue={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.specialist}
              onChange={(e) => (stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.specialist = e.target.value)}
              required
            />
            <TextInput
              label="Jadwal"
              placeholder="Masukkan jadwal"
              defaultValue={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.jadwal}
              onChange={(e) => (stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.jadwal = e.target.value)}
              required
            />
          </Box>

          {/* Fasilitas Pendukung */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Fasilitas Pendukung</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.fasilitasPendukung.content}
              onChange={(val) => (stateFasilitasKesehatan.create.form.fasilitasPendukung.content = val)}
            />
          </Box>

          {/* Prosedur Pendaftaran */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Prosedur Pendaftaran</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.prosedurPendaftaran.content}
              onChange={(val) => (stateFasilitasKesehatan.create.form.prosedurPendaftaran.content = val)}
            />
          </Box>

          {/* Tarif dan Layanan */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Tarif dan Layanan</Text>
            <TextInput
              label="Tarif"
              placeholder="Masukkan tarif"
              defaultValue={stateFasilitasKesehatan.create.form.tarifDanLayanan.tarif}
              onChange={(e) => (stateFasilitasKesehatan.create.form.tarifDanLayanan.tarif = e.target.value)}
              required
            />
            <TextInput
              label="Layanan"
              placeholder="Masukkan layanan"
              defaultValue={stateFasilitasKesehatan.create.form.tarifDanLayanan.layanan}
              onChange={(e) => (stateFasilitasKesehatan.create.form.tarifDanLayanan.layanan = e.target.value)}
              required
            />
          </Box>

          {/* Submit */}
          <Group justify="right" mt="md">
            <Button
              type="submit"
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

export default CreateFasilitasKesehatan;
