'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function CreatePelayananTelunjukDesa() {
  const stateTelunjukDesa = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa)
  const router = useRouter()

  const resetForm = () => {
    stateTelunjukDesa.create.form = {
      name: "",
      deskripsi: "",
      link: "",
    }
  }

  const handleSubmit = async () => {
    await stateTelunjukDesa.create.create()
    resetForm()
    router.push("/admin/desa/layanan/pelayanan_telunjuk_sakti_desa")

  }
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Create Pelayanan Telunjuk Sakti Desa</Title>
          <TextInput
            value={stateTelunjukDesa.create.form.name}
            onChange={(val) => {
              stateTelunjukDesa.create.form.name = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Pelayanan Telunjuk Sakti Desa</Text>}
            placeholder="masukkan nama pelayanan telunjuk sakti desa"
          />
          <TextInput
            value={stateTelunjukDesa.create.form.link}
            onChange={(val) => {
              stateTelunjukDesa.create.form.link = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Link</Text>}
            placeholder="masukkan link"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <CreateEditor
              value={stateTelunjukDesa.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateTelunjukDesa.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePelayananTelunjukDesa;
