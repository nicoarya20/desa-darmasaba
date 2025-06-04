'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';


function EditJumlahPendudukMiskin() {
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
          <Title order={4}>Edit Jumlah Penduduk Miskin</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Tahun</Text>}
          placeholder='Masukkan tahun'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Jumlah Penduduk Miskin</Text>}
          placeholder='Masukkan jumlah penduduk miskin'
          />
          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default EditJumlahPendudukMiskin;
