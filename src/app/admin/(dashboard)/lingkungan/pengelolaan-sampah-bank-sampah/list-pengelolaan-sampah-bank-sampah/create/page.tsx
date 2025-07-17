'use client'
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import SelectIconProgram from '@/app/admin/(dashboard)/inovasi/program-kreatif-desa/_lib/selectIcon';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';




function CreatePengelolaanSampahBankSampah() {
  const stateCreate = useProxy(pengelolaanSampahState)
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      icon: "",
    }
  }

  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah")
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
          <Title order={3}>Create List Pengelolaan Sampah Bank Sampah</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Pengelolaan Sampah Bank Sampah</Text>}
            placeholder="masukkan nama pengelolaan sampah bank sampah"
            onChange={(val) => stateCreate.create.form.name = val.target.value}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Pengelolaan Sampah Bank Sampah</Text>
            <SelectIconProgram onChange={(value) => stateCreate.create.form.icon = value} />
          </Box>
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePengelolaanSampahBankSampah;
