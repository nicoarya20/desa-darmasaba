import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function ProgramKreatifCreate() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper w={{base: "100%", md: "50%"}} p={"md"} bg={colors["white-1"]}>
          <Stack gap={"xs"}>
            <Title order={4}>Create Program Kreatif Desa</Title>
            <Box>
              <Text fz={"sm"} fw={"bold"}>Gambar</Text>
              <IconImageInPicture size={24}/>
            </Box>
            <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Program</Text>}
            placeholder="Masukkan nama program"
            />
            <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="Masukkan deskripsi"
            />
            <Group>
              <Button
              bg={colors["blue-button"]}
              >Simpan</Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default ProgramKreatifCreate;
