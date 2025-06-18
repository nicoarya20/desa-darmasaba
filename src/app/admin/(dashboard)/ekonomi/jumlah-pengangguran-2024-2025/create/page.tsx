'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

function CreateJumlahPengangguran() {
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
          <Title order={4}>Create Jumlah Pengangguran</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pengangguran Terdidik</Text>}
          placeholder='Masukkan pengangguran terdidik'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Usia Produktif</Text>}
          placeholder='Masukkan usia produktif'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Sedang Mencari Kerja</Text>}
          placeholder='Masukkan sedang mencari kerja'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pengangguran Tidak Terdidik</Text>}
          placeholder='Masukkan pengangguran tidak terdidik'
          />
          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default CreateJumlahPengangguran;
