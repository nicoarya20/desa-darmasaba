'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import SelectIconProgram from '../../../_com/selectIcon';
import dataLingkunganDesaState from '../../../_state/lingkungan/data-lingkungan-desa';


function CreateDataLingkunganDesa() {
  const stateCreate = useProxy(dataLingkunganDesaState)
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      deskripsi: "",
      jumlah: "",
      icon: "",
    }
  }

  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/lingkungan/data-lingkungan-desa")
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
          <Title order={3}>Create Data Lingkungan Desa</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Data Lingkungan Desa</Text>}
            placeholder="masukkan nama data lingkungan desa"
            onChange={(val) => stateCreate.create.form.name = val.target.value}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Data Lingkungan Desa</Text>
            <SelectIconProgram onChange={(value) => stateCreate.create.form.icon = value} />
          </Box>
          <TextInput
            type='number'
            onChange={(e) => stateCreate.create.form.jumlah = e.currentTarget.value}
            label={<Text fw={"bold"} fz={"sm"}>Jmlah data lingkungan desa</Text>}
            placeholder='Masukkan jumlah data lingkungan desa'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi data lingkungan desa</Text>
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

export default CreateDataLingkunganDesa;
