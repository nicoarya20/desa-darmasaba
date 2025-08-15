'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';


function CreateDokter() {
  const params = useParams()
  const createState = useProxy(fasilitasKesehatanState.dokter)
  const router = useRouter();

  const resetForm = () => {
    createState.create.create.form = {
      name: "",
      specialist: "",
      jadwal: "",
    };
  };

  const handleSubmit = async () => {
    await createState.create.create.create();
    resetForm();
    router.push(`/admin/kesehatan/fasilitas-kesehatan/${params?.id}/dokter-tenaga-medis`)
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Dokter</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Dokter</Text>}
            placeholder="masukkan nama dokter"
            value={createState.create.create.form.name}
            onChange={(e) => {
              createState.create.create.form.name = e.target.value;
            }}
          />
          <Text fz="md" fw="bold">Specialist</Text>
          <TextInput
            label={<Text fz="sm" fw="bold">Specialist</Text>}
            placeholder="masukkan specialist"
            value={createState.create.create.form.specialist}
            onChange={(e) => {
              createState.create.create.form.specialist = e.target.value;
            }}
          />
          <Box>
            <Text fz="md" fw="bold">Jadwal</Text>
            <CreateEditor
              value={createState.create.create.form.jadwal}
              onChange={(htmlContent) => {
                createState.create.create.form.jadwal = htmlContent;
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

export default CreateDokter;
