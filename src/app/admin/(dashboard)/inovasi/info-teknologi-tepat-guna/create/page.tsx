import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function CreateInfoTeknologiTepatGuna() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <Paper w={{base: "100%", md: "50%"}} p={"md"} bg={colors['white-1']}>
          <Stack gap={"xs"}>
            <Title order={4}>Create Info Teknologi Tepat Guna</Title>
            <Box>
              <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
              <IconImageInPicture size={24}/>
            </Box>
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Nama Info Teknologi Tepat Guna</Text>}
              placeholder="Masukkan nama info teknologi tepat guna"
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Deskripsi Info Teknologi Tepat Guna</Text>}
              placeholder="Masukkan deskripsi info teknologi tepat guna"
            />
            <Group>
              <Button bg={colors['blue-button']}>Submit</Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default CreateInfoTeknologiTepatGuna;
