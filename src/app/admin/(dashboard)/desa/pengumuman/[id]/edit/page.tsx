'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KeamananEditor } from '@/app/admin/(dashboard)/keamanan/_com/keamananEditor';

function EditPengumuman() {
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
          <Title order={4}>Edit Pengumuman</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
          placeholder='Masukkan judul'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Deskripsi Singkat</Text>}
          placeholder='Masukkan deskripsi singkat'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Tanggal</Text>}
          placeholder='Masukkan tanggal'
          />
           <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Waktu</Text>}
          placeholder='Masukkan waktu'
          />
          <Box>
          <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
          <KeamananEditor
          showSubmit={false}
          />
          </Box>

          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default EditPengumuman;
