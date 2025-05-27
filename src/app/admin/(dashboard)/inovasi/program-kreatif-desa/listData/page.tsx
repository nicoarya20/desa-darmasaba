import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Title } from '@mantine/core';
import React from 'react';

function ListDataProgramKreatifDesa() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>List Data Program Kreatif Desa</Title>
        <SimpleGrid cols={{ base: 1, md: 4 }}>
          <Paper p={"md"} bg={colors["white-1"]}>
          Data 1
          </Paper>
          <Paper p={"md"} bg={colors["white-1"]}>
          Data 2
          </Paper>
          <Paper p={"md"} bg={colors["white-1"]}>
          Data 3
          </Paper>
          <Paper p={"md"} bg={colors["white-1"]}>
          Data 4
          </Paper>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default ListDataProgramKreatifDesa;
