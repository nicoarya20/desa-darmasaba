'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

function CreatePengangguranBerdasarkanUsia() {
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25}/>
        </Button>
      </Box>

      <Paper w={{base: '100%', md: '50%'}} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Pengangguran Berdasarkan Usia</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Usia 18 - 25</Text>}
          placeholder='Masukkan usia'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Usia 26 - 35</Text>}
          placeholder='Masukkan usia'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Usia 36 - 45</Text>}
          placeholder='Masukkan usia'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Usia 46 +</Text>}
          placeholder='Masukkan usia'
          />
          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default CreatePengangguranBerdasarkanUsia;
