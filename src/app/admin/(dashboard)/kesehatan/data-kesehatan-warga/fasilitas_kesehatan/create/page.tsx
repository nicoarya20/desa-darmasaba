'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateFasilitasKesehatan() {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan)
  const router = useRouter();


  const resetForm = () => {
    stateFasilitasKesehatan.create.form = {
      name: "",
      informasiUmum: {
        fasilitas: "",
        alamat: "",
        jamOperasional: "",
      },
      layananUnggulan: {
        content: "",
      },
      dokterdanTenagaMedis: {
        name: "",
        specialist: "",
        jadwal: "",
      },
      fasilitasPendukung: {
        content: "",
      },
      prosedurPendaftaran: {
        content: "",
      },
      tarifDanLayanan: {
        layanan: "",
        tarif: "",
      },
    };
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await stateFasilitasKesehatan.create.submit();

    toast.success("Data berhasil disimpan");
    resetForm();
    // After successful submission, redirect to the list page
    router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan');
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Fasilitas Kesehatan</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Fasilitas Kesehatan</Text>}
            placeholder="masukkan nama fasilitas kesehatan"
            value={stateFasilitasKesehatan.create.form.name}
            onChange={(e) => {
              stateFasilitasKesehatan.create.form.name = e.target.value;
            }}
          />
          <Box>
            <Text fz="md" fw="bold">Informasi Umum</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Fasilitas</Text>}
              placeholder="masukkan fasilitas"
              value={stateFasilitasKesehatan.create.form.informasiUmum.fasilitas}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.informasiUmum.fasilitas = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Alamat</Text>}
              placeholder="masukkan alamat"
              value={stateFasilitasKesehatan.create.form.informasiUmum.alamat}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.informasiUmum.alamat = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Jam Operasional</Text>}
              placeholder="masukkan jam operasional"
              value={stateFasilitasKesehatan.create.form.informasiUmum.jamOperasional}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.informasiUmum.jamOperasional = e.target.value;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Layanan Unggulan</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.layananUnggulan.content}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.layananUnggulan.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Dokter dan Tenaga Medis</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama Dokter</Text>}
              placeholder="masukkan nama dokter"
              value={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.name}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.name = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Specialist</Text>}
              placeholder="masukkan specialist"
              value={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.specialist}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.specialist = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Jadwal</Text>}
              placeholder="masukkan jadwal"
              value={stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.jadwal}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.dokterdanTenagaMedis.jadwal = e.target.value;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Fasilitas Pendukung</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.fasilitasPendukung.content}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.fasilitasPendukung.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Prosedur Pendaftaran</Text>
            <CreateEditor
              value={stateFasilitasKesehatan.create.form.prosedurPendaftaran.content}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.prosedurPendaftaran.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Tarif dan Layanan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Tarif</Text>}
              placeholder="masukkan tarif"
              value={stateFasilitasKesehatan.create.form.tarifDanLayanan.tarif}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.tarifDanLayanan.tarif = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Layanan</Text>}
              placeholder="masukkan layanan"
              value={stateFasilitasKesehatan.create.form.tarifDanLayanan.layanan}
              onChange={(e) => {
                stateFasilitasKesehatan.create.form.tarifDanLayanan.layanan = e.target.value;
              }}
            />
          </Box>

          <Button onClick={handleSubmit} bg={colors['blue-button']}>
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateFasilitasKesehatan;
