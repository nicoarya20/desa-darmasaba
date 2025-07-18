'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import SelectIconProgram from '../../../_com/selectIcon';
import programPenghijauanState from '../../../_state/lingkungan/program-penghijauan';


function CreateProgramPenghijauan() {
  const stateCreate = useProxy(programPenghijauanState)
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      deskripsi: "",
      judul: "",
      icon: "",
    }
  }

  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/lingkungan/program-penghijauan")
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={3}>Create Program Penghijauan</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Program Penghijauan</Text>}
            placeholder="masukkan nama program penghijauan"
            onChange={(val) => stateCreate.create.form.name = val.target.value}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Program Penghijauan</Text>
            <SelectIconProgram onChange={(value) => stateCreate.create.form.icon = value} />
          </Box>
          <TextInput
            onChange={(e) => stateCreate.create.form.judul = e.currentTarget.value}
            label={<Text fw={"bold"} fz={"sm"}>Judul Deskripsi   Program Penghijauan</Text>}
            placeholder='Masukkan judul deskripsi program penghijauan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Program Penghijauan</Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(htmlContent) => stateCreate.create.form.deskripsi = htmlContent}
            />
          </Box>
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramPenghijauan;
