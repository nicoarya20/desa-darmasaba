'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';



function SejarahDesa() {


  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Sejarah Desa</Title>
              <Text fw={"bold"}>Deskripsi Sejarah Desa</Text>
              <Group>
                <Button
                  mt={10}
                  bg={colors['blue-button']}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default SejarahDesa;
