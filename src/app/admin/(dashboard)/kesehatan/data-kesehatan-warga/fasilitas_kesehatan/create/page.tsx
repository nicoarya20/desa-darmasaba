'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
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

function CreateFasilitasKesehatan() {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateFasilitasKesehatan.create.form = {
      name: '',
      informasiUmum: {
        fasilitas: '',
        alamat: '',
        jamOperasional: '',
      },
      layananUnggulan: {
        content: ''
      },
      dokterdanTenagaMedis: [] as string[],
      fasilitasPendukung: {
        content: '',
      },
      prosedurPendaftaran: {
        content: '',
      },
      tarifDanLayanan: [] as string[],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await stateFasilitasKesehatan.create.submit();
      toast.success('Data berhasil disimpan');
      resetForm();
      router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  useShallowEffect(() => {
    fasilitasKesehatanState.dokter.findMany.load();
    fasilitasKesehatanState.tarif.findMany.load();
  }, []);

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs" component="form" onSubmit={handleSubmit}>
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
            value={stateFasilitasKesehatan.create.form.name}
            onChange={(e) => (stateFasilitasKesehatan.create.form.name = e.target.value)}
            required
          />

          {/* Informasi Umum */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Informasi Umum</Text>
            <TextInput
              label="Fasilitas"
              placeholder="Masukkan fasilitas"
              value={stateFasilitasKesehatan.create.form.informasiUmum.fasilitas}
              onChange={(e) => (stateFasilitasKesehatan.create.form.informasiUmum.fasilitas = e.target.value)}
              required
            />
            <TextInput
              label="Alamat"
              placeholder="Masukkan alamat"
              value={stateFasilitasKesehatan.create.form.informasiUmum.alamat}
              onChange={(e) => (stateFasilitasKesehatan.create.form.informasiUmum.alamat = e.target.value)}
              required
            />
            <TextInput
              label="Jam Operasional"
              placeholder="Masukkan jam operasional"
              value={stateFasilitasKesehatan.create.form.informasiUmum.jamOperasional}
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
          <MultiSelect
            label="Dokter & Tenaga Medis"
            placeholder="Pilih dokter / tenaga medis"
            data={
              fasilitasKesehatanState.dokter.findMany.data?.map((item) => ({
                label: item.name,
                value: item.id,
              })) || []
            }
            value={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis}
            onChange={(val: string[]) => {
              stateFasilitasKesehatan.create.form.dokterdanTenagaMedis = val;
            }}
            searchable
            clearable
            required
          />

          {/* Fasilitas Pendukung */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Fasilitas Pendukung</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.fasilitasPendukung.content}
              onChange={(val) => (stateFasilitasKesehatan.create.form.fasilitasPendukung.content = val)}
            />
          </Box>

          <MultiSelect
            label="Layanan"
            placeholder="Pilih layanan"
            data={
              fasilitasKesehatanState.tarif.findMany.data?.map((item) => ({
                label: item.layanan,
                value: item.id,
              })) || []
            }
            value={stateFasilitasKesehatan.create.form.tarifDanLayanan} // string[]
            onChange={(val: string[]) => {
              stateFasilitasKesehatan.create.form.tarifDanLayanan = val;
            }}
            searchable
            clearable
            required
          />

          {/* Prosedur Pendaftaran */}
          <Box>
            <Text fz="md" fw="bold" mb={5}>Prosedur Pendaftaran</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.prosedurPendaftaran.content}
              onChange={(val) => (stateFasilitasKesehatan.create.form.prosedurPendaftaran.content = val)}
            />
          </Box>


          {/* Submit */}
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

export default CreateFasilitasKesehatan;
