'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';


function CreatePengangguranBerdasarkanPendidikan() {
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
          <Title order={4}>Create Pengangguran Berdasarkan Pendidikan</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pendidikan SD</Text>}
          placeholder='Masukkan pendidikan sd'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pendidikan SMP</Text>}
          placeholder='Masukkan pendidikan smp'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pendidikan SMA</Text>}
          placeholder='Masukkan pendidikan sma'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pendidikan S1</Text>}
          placeholder='Masukkan pendidikan s1'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pendidikan S2</Text>}
          placeholder='Masukkan pendidikan s2'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pendidikan S3</Text>}
          placeholder='Masukkan pendidikan s3'
          />
          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default CreatePengangguranBerdasarkanPendidikan;
