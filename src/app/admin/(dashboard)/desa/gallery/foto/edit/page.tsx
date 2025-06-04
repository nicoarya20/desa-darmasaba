'use client'
import { KeamananEditor } from '@/app/admin/(dashboard)/keamanan/_com/keamananEditor';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';



function EditFoto() {
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
          <Title order={4}>Edit Foto</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Judul Foto</Text>}
          placeholder='Masukkan judul foto'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Tanggal Foto</Text>}
          placeholder='Masukkan tanggal foto'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Foto</Text>
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

export default EditFoto;
