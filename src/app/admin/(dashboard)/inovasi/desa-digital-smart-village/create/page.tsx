'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KeamananEditor } from '../../../keamanan/_com/keamananEditor';


function CreateDesaDigital() {
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
          <Title order={4}>Create Desa Digital Smart Village</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nama Inovasi</Text>}
          placeholder='Masukkan nama inovasi'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Deskripsi Singkat Inovasi</Text>}
          placeholder='Masukkan deskripsi singkat inovasi'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Image</Text>}
          placeholder='Masukkan image'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Inovasi</Text>
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

export default CreateDesaDigital;
