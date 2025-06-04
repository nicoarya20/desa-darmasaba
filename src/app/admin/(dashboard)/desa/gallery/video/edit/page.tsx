'use client'
import { KeamananEditor } from '@/app/admin/(dashboard)/keamanan/_com/keamananEditor';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';



function EditVideo() {
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
          <Title order={4}>Edit Video</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Judul Video</Text>}
          placeholder='Masukkan judul video'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Tanggal Video</Text>}
          placeholder='Masukkan tanggal video'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Video</Text>
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

export default EditVideo;
