'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KeamananEditor } from '../../../keamanan/_com/keamananEditor';


function CreateProgramKreatifDesa() {
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
          <Title order={4}>Create Program Penghijauan</Title>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
            <IconImageInPicture size={50} />
          </Box>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nama Program Penghijauan</Text>}
          placeholder='Masukkan nama program penghijauan'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Deskripsi Singkat Program Penghijauan</Text>}
          placeholder='Masukkan deskripsi singkat program penghijauan'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Jumlah</Text>}
          placeholder='Masukkan jumlah'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Program Kreatif Desa</Text>
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

export default CreateProgramKreatifDesa;
